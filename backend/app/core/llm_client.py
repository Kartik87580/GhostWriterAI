from langchain_groq import ChatGroq
from app.core.config import settings

def get_llm(temperature=0.7):
    return ChatGroq(
        model=settings.MODEL_NAME,
        api_key=settings.GROQ_API_KEY,
        temperature=temperature
    )
