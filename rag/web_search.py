import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any
from utils.logging import logger

class WebSearchEngine:
    """Provides lightweight web search capability for general knowledge & real-time information."""

    @staticmethod
    def search(query: str, max_results: int = 5) -> List[Dict[str, str]]:
        results: List[Dict[str, str]] = []

        try:
            params = urllib.parse.urlencode({"q": query, "format": "json", "no_html": "1", "no_redirect": "1"})
            url = f"https://api.duckduckgo.com/?{params}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode())
                
                abstract = data.get("AbstractText")
                abstract_url = data.get("AbstractURL")
                heading = data.get("Heading")

                if abstract:
                    results.append({
                        "title": heading or query,
                        "snippet": abstract,
                        "url": abstract_url or "https://duckduckgo.com"
                    })

                related_topics = data.get("RelatedTopics", [])
                for topic in related_topics[:max_results]:
                    if isinstance(topic, dict) and "Text" in topic:
                        results.append({
                            "title": topic.get("Text", "")[:60] + "...",
                            "snippet": topic.get("Text", ""),
                            "url": topic.get("FirstURL", "https://duckduckgo.com")
                        })
        except Exception as e:
            logger.warning(f"DuckDuckGo API search error: {e}")

        if not results:
            try:
                wiki_params = urllib.parse.urlencode({
                    "action": "query",
                    "list": "search",
                    "srsearch": query,
                    "format": "json"
                })
                wiki_url = f"https://en.wikipedia.org/w/api.php?{wiki_params}"
                req = urllib.request.Request(wiki_url, headers={"User-Agent": "CogniaAI-AcademicBot/1.0"})
                with urllib.request.urlopen(req, timeout=4) as resp:
                    wiki_data = json.loads(resp.read().decode())
                    search_hits = wiki_data.get("query", {}).get("search", [])
                    for hit in search_hits[:max_results]:
                        snippet_clean = hit.get("snippet", "").replace('<span class="searchmatch">', '').replace('</span>', '')
                        results.append({
                            "title": hit.get("title", ""),
                            "snippet": snippet_clean,
                            "url": f"https://en.wikipedia.org/wiki/{urllib.parse.quote(hit.get('title', ''))}"
                        })
            except Exception as e:
                logger.warning(f"Wikipedia search fallback error: {e}")

        logger.info(f"WebSearchEngine retrieved {len(results)} search results for query '{query}'.")
        return results

web_search_engine = WebSearchEngine()
