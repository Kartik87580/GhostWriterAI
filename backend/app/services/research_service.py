import os
from typing import List
from langchain_community.tools.tavily_search import TavilySearchResults
from app.core.config import settings

from pydantic import BaseModel
from app.core.llm_client import get_llm
from app.services.prompt_builder import RESEARCH_SYSTEM

class EvidenceItem(BaseModel):
    title: str
    url: str
    snippet: str

class EvidencePack(BaseModel):
    evidence: List[EvidenceItem]

def run_tavily_search(query: str, max_results: int = 3):
    """Wrapper for Tavily search."""
    search = TavilySearchResults(
        tavily_api_key=settings.TAVILY_API_KEY,
        max_results=max_results
    )
    return search.run(query)

def get_evidence(queries: List[str]) -> List[dict]:
    """Execute research queries and return collected evidence."""
    all_raw_results = []
    for q in queries:
        try:
            results = run_tavily_search(q)
            if isinstance(results, list):
                all_raw_results.extend(results)
        except Exception as e:
            print(f"Research error for query '{q}': {e}")
    
    if not all_raw_results:
        return []

    # Use LLM to extract high-signal evidence pack
    llm = get_llm().with_structured_output(EvidencePack)
    try:
        pack = llm.invoke([
            SystemMessage(content=RESEARCH_SYSTEM),
            HumanMessage(content=f"Raw results from web search:\n{all_raw_results[:15]}") # Limit results for token efficiency
        ])
        return [item.model_dump() for item in pack.evidence]
    except Exception as e:
        print(f"Evidence extraction error: {e}")
        return all_raw_results[:5] # Fallback to raw results if LLM fails
