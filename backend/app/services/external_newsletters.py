import feedparser
import httpx
from bs4 import BeautifulSoup
from typing import List
from datetime import datetime

# External newsletter sources
EXTERNAL_NEWSLETTERS = {
    "tech": [
        {
            "name": "TechCrunch",
            "url": "https://techcrunch.com/feed/",
            "description": "Latest technology news and startup information"
        },
        {
            "name": "The Verge",
            "url": "https://www.theverge.com/rss/index.xml",
            "description": "Technology, science, art, and culture"
        },
        {
            "name": "Ars Technica",
            "url": "https://feeds.arstechnica.com/arstechnica/index",
            "description": "Technology news and analysis"
        }
    ],
    "ai": [
        {
            "name": "MIT Technology Review",
            "url": "https://www.technologyreview.com/feed/",
            "description": "AI and emerging technology insights"
        },
        {
            "name": "AI News",
            "url": "https://artificialintelligence-news.com/feed/",
            "description": "Latest AI developments and research"
        }
    ],
    "webdev": [
        {
            "name": "CSS-Tricks",
            "url": "https://css-tricks.com/feed/",
            "description": "Web design and development tips"
        },
        {
            "name": "Smashing Magazine",
            "url": "https://www.smashingmagazine.com/feed/",
            "description": "Web design and development resources"
        }
    ]
}

async def fetch_external_newsletters(category: str = "tech", limit: int = 10) -> List[dict]:
    """Fetch newsletters from external RSS feeds"""
    sources = EXTERNAL_NEWSLETTERS.get(category, EXTERNAL_NEWSLETTERS["tech"])
    newsletters = []
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for source in sources[:3]:  # Limit to 3 sources to avoid rate limiting
            try:
                response = await client.get(source["url"])
                response.raise_for_status()
                
                feed = feedparser.parse(response.content)
                
                for entry in feed.entries[:limit//len(sources)]:
                    # Clean content
                    content = ""
                    if hasattr(entry, 'summary'):
                        soup = BeautifulSoup(entry.summary, 'html.parser')
                        content = soup.get_text()[:300] + "..." if len(soup.get_text()) > 300 else soup.get_text()
                    
                    # Extract tags from categories
                    tags = []
                    if hasattr(entry, 'tags'):
                        tags = [tag.term for tag in entry.tags[:3]]
                    
                    newsletters.append({
                        "id": f"ext_{hash(entry.link)}",
                        "title": entry.title,
                        "content": content,
                        "field_id": None,
                        "tags": tags,
                        "author_id": None,
                        "is_ai_generated": False,
                        "status": "published",
                        "views": 0,
                        "likes": 0,
                        "created_at": datetime.now(),
                        "published_at": datetime.now(),
                        "updated_at": datetime.now(),
                        "author_name": source["name"],
                        "field_name": category.title(),
                        "is_liked": False,
                        "comments_count": 0,
                        "external_url": entry.link,
                        "is_external": True
                    })
                    
            except Exception as e:
                print(f"Error fetching from {source['name']}: {e}")
                continue
    
    return newsletters[:limit]
