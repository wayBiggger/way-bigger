import feedparser
import httpx
from bs4 import BeautifulSoup
from typing import List, Optional
from datetime import datetime

# External newsletter sources with comprehensive tech stacks
EXTERNAL_NEWSLETTERS = {
    "tech": [
        {
            "name": "TechCrunch",
            "url": "https://techcrunch.com/feed/",
            "description": "Latest technology news and startup information",
            "tech_stack": ["general", "startup", "tech", "business", "innovation"]
        },
        {
            "name": "The Verge",
            "url": "https://www.theverge.com/rss/index.xml",
            "description": "Technology, science, art, and culture",
            "tech_stack": ["general", "tech", "culture", "science", "design"]
        },
        {
            "name": "Ars Technica",
            "url": "https://feeds.arstechnica.com/arstechnica/index",
            "description": "Technology news and analysis",
            "tech_stack": ["general", "tech", "analysis", "science", "hardware"]
        },
        {
            "name": "Wired",
            "url": "https://www.wired.com/feed/rss",
            "description": "Technology, science, and culture insights",
            "tech_stack": ["general", "tech", "culture", "science", "innovation"]
        }
    ],
    "ai": [
        {
            "name": "MIT Technology Review",
            "url": "https://www.technologyreview.com/feed/",
            "description": "AI and emerging technology insights",
            "tech_stack": ["ai", "ml", "research", "deep-learning", "neural-networks"]
        },
        {
            "name": "AI News",
            "url": "https://artificialintelligence-news.com/feed/",
            "description": "Latest AI developments and research",
            "tech_stack": ["ai", "ml", "research", "automation", "intelligence"]
        },
        {
            "name": "OpenAI Blog",
            "url": "https://openai.com/blog/rss.xml",
            "description": "OpenAI research and developments",
            "tech_stack": ["ai", "ml", "openai", "gpt", "research"]
        },
        {
            "name": "Google AI Blog",
            "url": "https://ai.googleblog.com/feeds/posts/default",
            "description": "Google AI research and innovations",
            "tech_stack": ["ai", "ml", "google", "research", "deep-learning"]
        }
    ],
    "webdev": [
        {
            "name": "CSS-Tricks",
            "url": "https://css-tricks.com/feed/",
            "description": "Web design and development tips",
            "tech_stack": ["web", "css", "frontend", "html", "javascript", "react", "vue"]
        },
        {
            "name": "Smashing Magazine",
            "url": "https://www.smashingmagazine.com/feed/",
            "description": "Web design and development resources",
            "tech_stack": ["web", "design", "frontend", "ux", "ui", "css", "javascript"]
        },
        {
            "name": "React Blog",
            "url": "https://react.dev/blog/rss.xml",
            "description": "Official React blog and updates",
            "tech_stack": ["react", "javascript", "frontend", "web", "framework"]
        },
        {
            "name": "Vue.js Blog",
            "url": "https://blog.vuejs.org/feed.xml",
            "description": "Vue.js framework updates and tutorials",
            "tech_stack": ["vue", "javascript", "frontend", "web", "framework"]
        }
    ],
    "mobile": [
        {
            "name": "iOS Dev Weekly",
            "url": "https://iosdevweekly.com/feed/",
            "description": "iOS development news and resources",
            "tech_stack": ["ios", "swift", "mobile", "apple", "development"]
        },
        {
            "name": "Android Developers Blog",
            "url": "https://android-developers.googleblog.com/feeds/posts/default",
            "description": "Android development insights and updates",
            "tech_stack": ["android", "kotlin", "mobile", "google", "development"]
        }
    ],
    "data-science": [
        {
            "name": "Towards Data Science",
            "url": "https://towardsdatascience.com/feed",
            "description": "Data science articles and tutorials",
            "tech_stack": ["data-science", "python", "ml", "statistics", "analytics"]
        },
        {
            "name": "Kaggle Blog",
            "url": "https://www.kaggle.com/blog/feed",
            "description": "Data science competitions and insights",
            "tech_stack": ["data-science", "kaggle", "ml", "competitions", "python"]
        }
    ]
}

async def fetch_external_newsletters(category: str = "tech", limit: int = 10, tech_stack_filter: Optional[str] = None) -> List[dict]:
    """
    Fetch external newsletters from RSS feeds with improved tech stack filtering
    
    Args:
        category: Newsletter category (tech, ai, webdev, mobile, data-science)
        limit: Number of newsletters to fetch
        tech_stack_filter: Optional tech stack to filter by
    """
    
    # Get all sources for the category
    all_sources = EXTERNAL_NEWSLETTERS.get(category, EXTERNAL_NEWSLETTERS["tech"])
    
    # If tech stack filtering is requested, prioritize matching sources
    if tech_stack_filter:
        # Split the filter into individual terms
        filter_terms = [term.strip().lower() for term in tech_stack_filter.split(',')]
        
        # Score sources based on how well they match the filter
        scored_sources = []
        for source in all_sources:
            source_tech_stack = [tech.lower() for tech in source.get("tech_stack", [])]
            score = sum(1 for term in filter_terms if any(term in tech for tech in source_tech_stack))
            if score > 0:
                scored_sources.append((score, source))
        
        # Sort by score (highest first) and take top sources
        scored_sources.sort(key=lambda x: x[0], reverse=True)
        sources = [source for score, source in scored_sources[:5]]  # Take top 5 matching sources
        
        # If no matches found, fall back to all sources
        if not sources:
            sources = all_sources
    else:
        sources = all_sources
    
    newsletters = []
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for source in sources:
            try:
                response = await client.get(source["url"])
                response.raise_for_status()
                
                feed = feedparser.parse(response.content)
                
                # Calculate how many entries to take from this source
                entries_per_source = max(1, limit // len(sources))
                
                for entry in feed.entries[:entries_per_source]:
                    # Clean content
                    content = ""
                    if hasattr(entry, 'summary'):
                        soup = BeautifulSoup(entry.summary, 'html.parser')
                        content = soup.get_text()[:300] + "..." if len(soup.get_text()) > 300 else soup.get_text()
                    
                    # Extract tags from categories
                    tags = []
                    if hasattr(entry, 'tags'):
                        tags = [tag.term for tag in entry.tags[:3]]
                    
                    # Add source tech stack tags
                    tags.extend(source.get("tech_stack", [])[:3])
                    
                    # Handle datetime conversion
                    published_date = entry.get("published")
                    if published_date:
                        try:
                            # Try to parse the date string
                            from email.utils import parsedate_to_datetime
                            parsed_date = parsedate_to_datetime(published_date)
                            date_str = parsed_date.isoformat()
                        except:
                            date_str = datetime.now().isoformat()
                    else:
                        date_str = datetime.now().isoformat()
                    
                    newsletter = {
                        "id": f"ext_{len(newsletters)}",
                        "title": entry.title,
                        "content": content,
                        "field_id": None,
                        "tags": tags,
                        "author_id": None,
                        "is_ai_generated": False,
                        "status": "published",
                        "views": 0,
                        "likes": 0,
                        "created_at": date_str,
                        "published_at": date_str,
                        "updated_at": date_str,
                        "author_name": source["name"],
                        "field_name": category.replace("-", " ").title(),
                        "is_liked": False,
                        "comments_count": 0,
                        "is_external": True,
                        "external_url": entry.link,
                        "source_description": source["description"]
                    }
                    
                    newsletters.append(newsletter)
                    
                    if len(newsletters) >= limit:
                        break
                        
            except Exception as e:
                print(f"Failed to fetch from {source['name']}: {str(e)}")
                continue
                
            if len(newsletters) >= limit:
                break
    
    return newsletters
