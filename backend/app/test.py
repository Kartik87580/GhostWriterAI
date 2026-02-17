from langchain_community.tools.tavily_search import TavilySearchResults
tool = TavilySearchResults(max_results=1)
response = tool.invoke({"query":"hot topics for Electronics and communication in 2025"})
print(response)