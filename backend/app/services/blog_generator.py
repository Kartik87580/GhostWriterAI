import operator
from typing import Annotated, List, Literal, Optional, TypedDict
from pydantic import BaseModel, Field

from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send

from app.core.llm_client import get_llm
from app.services.prompt_builder import ROUTER_SYSTEM, ORCH_SYSTEM, WORKER_SYSTEM
from app.services.research_service import get_evidence

# --- Schemas from Notebooks ---

class Task(BaseModel):
    id: int
    title: str
    goal: str
    bullets: List[str]
    target_words: int
    requires_code: bool = False

class Plan(BaseModel):
    blog_title: str
    audience: str
    tone: str
    blog_kind: str = "explainer"
    tasks: List[Task]

class RouterDecision(BaseModel):
    needs_research: bool
    mode: Literal["closed_book", "hybrid", "open_book"]
    queries: List[str] = []

class EvidenceItem(BaseModel):
    title: str
    url: str
    snippet: str

class State(TypedDict):
    topic: str
    mode: str
    needs_research: bool
    queries: List[str]
    evidence: List[dict]
    plan: Optional[Plan]
    sections: Annotated[List[tuple[int, str]], operator.add]
    final: str

# --- Graph Nodes ---

def router_node(state: State) -> dict:
    llm = get_llm().with_structured_output(RouterDecision)
    decision = llm.invoke([
        SystemMessage(content=ROUTER_SYSTEM),
        HumanMessage(content=f"Topic: {state['topic']}")
    ])
    return {
        "needs_research": decision.needs_research,
        "mode": decision.mode,
        "queries": decision.queries
    }

def research_node(state: State) -> dict:
    if not state["needs_research"]:
        return {"evidence": []}
    evidence = get_evidence(state["queries"])
    return {"evidence": evidence}

def orchestrator_node(state: State) -> dict:
    llm = get_llm().with_structured_output(Plan)
    plan = llm.invoke([
        SystemMessage(content=ORCH_SYSTEM),
        HumanMessage(content=f"Topic: {state['topic']}\nMode: {state['mode']}\nEvidence: {state['evidence']}")
    ])
    return {"plan": plan}

def worker_node(payload: dict) -> dict:
    llm = get_llm()
    task = payload["task"]
    plan = payload["plan"]
    
    bullets_text = "\n- ".join(task["bullets"])
    
    prompt = [
        SystemMessage(content=WORKER_SYSTEM),
        HumanMessage(content=f"""
Blog title: {plan['blog_title']}
Audience: {plan['audience']}
Tone: {plan['tone']}
Section title: {task['title']}
Goal: {task['goal']}
Target words: {task['target_words']}
Bullets: {bullets_text}
requires_code: {task['requires_code']}
""")
    ]
    
    section_md = llm.invoke(prompt).content.strip()
    return {"sections": [(task["id"], section_md)]}

def fanout(state: State):
    return [
        Send("worker", {
            "task": task.model_dump(),
            "plan": state["plan"].model_dump(),
            "topic": state["topic"]
        }) for task in state["plan"].tasks
    ]

def reducer_node(state: State) -> dict:
    ordered_sections = [md for _, md in sorted(state["sections"], key=lambda x: x[0])]
    body = "\n\n".join(ordered_sections).strip()
    final_md = f"# {state['plan'].blog_title}\n\n{body}\n"
    return {"final": final_md}

# --- Graph Construction ---

def route_next(state: State):
    return "research" if state["needs_research"] else "orchestrator"

builder = StateGraph(State)
builder.add_node("router", router_node)
builder.add_node("research", research_node)
builder.add_node("orchestrator", orchestrator_node)
builder.add_node("worker", worker_node)
builder.add_node("reducer", reducer_node)

builder.add_edge(START, "router")
builder.add_conditional_edges("router", route_next, {"research": "research", "orchestrator": "orchestrator"})
builder.add_edge("research", "orchestrator")
builder.add_conditional_edges("orchestrator", fanout, ["worker"])
builder.add_edge("worker", "reducer")
builder.add_edge("reducer", END)

graph = builder.compile()

async def generate_blog_content(topic: str) -> str:
    initial_state = {
        "topic": topic,
        "mode": "",
        "needs_research": False,
        "queries": [],
        "evidence": [],
        "plan": None,
        "sections": [],
        "final": ""
    }
    # Invoke the graph
    result = graph.invoke(initial_state)
    return result["final"]
