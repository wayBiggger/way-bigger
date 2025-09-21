import asyncio
import aiohttp
import feedparser
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from urllib.parse import urljoin, urlparse
import re

logger = logging.getLogger(__name__)

class NewsletterFetcher:
    def __init__(self):
        self.newsletter_sources = {
            "tech": [
                {
                    "name": "Hacker News",
                    "url": "https://hnrss.org/frontpage",
                    "description": "Top stories from Hacker News",
                    "category": "tech",
                    "icon": "🔥"
                },
                {
                    "name": "TechCrunch",
                    "url": "https://techcrunch.com/feed/",
                    "description": "Latest tech news and startup coverage",
                    "category": "tech",
                    "icon": "📱"
                },
                {
                    "name": "The Verge",
                    "url": "https://www.theverge.com/rss/index.xml",
                    "description": "Technology, science, art, and culture",
                    "category": "tech",
                    "icon": "🔬"
                },
                {
                    "name": "Ars Technica",
                    "url": "http://feeds.arstechnica.com/arstechnica/index/",
                    "description": "Technology news and analysis",
                    "category": "tech",
                    "icon": "⚡"
                },
                {
                    "name": "Wired",
                    "url": "https://www.wired.com/feed/rss",
                    "description": "Technology, business, culture, and science",
                    "category": "tech",
                    "icon": "🌐"
                }
            ],
            "startup": [
                {
                    "name": "Y Combinator",
                    "url": "https://blog.ycombinator.com/feed/",
                    "description": "Startup advice and YC company updates",
                    "category": "startup",
                    "icon": "🚀"
                },
                {
                    "name": "First Round Review",
                    "url": "https://review.firstround.com/feed",
                    "description": "Startup insights and founder stories",
                    "category": "startup",
                    "icon": "💡"
                },
                {
                    "name": "a16z",
                    "url": "https://a16z.com/feed/",
                    "description": "Andreessen Horowitz insights",
                    "category": "startup",
                    "icon": "🎯"
                },
                {
                    "name": "Product Hunt",
                    "url": "https://www.producthunt.com/feed",
                    "description": "New products and startups",
                    "category": "startup",
                    "icon": "🛠️"
                },
                {
                    "name": "Indie Hackers",
                    "url": "https://www.indiehackers.com/feed",
                    "description": "Independent entrepreneurs and makers",
                    "category": "startup",
                    "icon": "🏗️"
                }
            ],
            "ai": [
                {
                    "name": "OpenAI Blog",
                    "url": "https://openai.com/blog/rss.xml",
                    "description": "Latest AI research and developments",
                    "category": "ai",
                    "icon": "🤖"
                },
                {
                    "name": "AI News",
                    "url": "https://www.artificialintelligence-news.com/feed/",
                    "description": "AI industry news and analysis",
                    "category": "ai",
                    "icon": "🧠"
                }
            ],
            "webdev": [
                {
                    "name": "CSS-Tricks",
                    "url": "https://css-tricks.com/feed/",
                    "description": "Web development tips and tricks",
                    "category": "webdev",
                    "icon": "🎨"
                },
                {
                    "name": "Smashing Magazine",
                    "url": "https://www.smashingmagazine.com/feed/",
                    "description": "Web design and development",
                    "category": "webdev",
                    "icon": "💥"
                },
                {
                    "name": "MDN Web Docs",
                    "url": "https://developer.mozilla.org/en-US/blog/rss.xml",
                    "description": "Web standards and documentation",
                    "category": "webdev",
                    "icon": "📚"
                }
            ]
        }

    async def fetch_rss_feed(self, session: aiohttp.ClientSession, source: Dict) -> List[Dict]:
        """Fetch and parse RSS feed from a source"""
        try:
            async with session.get(source["url"], timeout=10) as response:
                if response.status == 200:
                    content = await response.text()
                    feed = feedparser.parse(content)
                    
                    articles = []
                    for entry in feed.entries[:5]:  # Limit to 5 articles per source
                        # Clean and format the content
                        content_text = ""
                        if hasattr(entry, 'content') and entry.content:
                            content_text = entry.content[0].value
                        elif hasattr(entry, 'summary'):
                            content_text = entry.summary
                        
                        # Clean HTML tags
                        content_text = re.sub(r'<[^>]+>', '', content_text)
                        content_text = content_text.strip()[:500] + "..." if len(content_text) > 500 else content_text
                        
                        # Parse date
                        published_date = datetime.now()
                        if hasattr(entry, 'published_parsed') and entry.published_parsed:
                            published_date = datetime(*entry.published_parsed[:6])
                        elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                            published_date = datetime(*entry.updated_parsed[:6])
                        
                        article = {
                            "title": entry.title if hasattr(entry, 'title') else "Untitled",
                            "content": content_text,
                            "url": entry.link if hasattr(entry, 'link') else "",
                            "published_at": published_date.isoformat(),
                            "author": source["name"],
                            "source": source["name"],
                            "category": source["category"],
                            "icon": source["icon"],
                            "description": source["description"],
                            "is_external": True,
                            "external_url": entry.link if hasattr(entry, 'link') else ""
                        }
                        articles.append(article)
                    
                    return articles
                else:
                    logger.warning(f"Failed to fetch {source['name']}: HTTP {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching {source['name']}: {str(e)}")
            return []

    async def fetch_all_newsletters(self, category: Optional[str] = None) -> List[Dict]:
        """Fetch newsletters from all sources or a specific category"""
        sources = []
        
        if category and category in self.newsletter_sources:
            sources = self.newsletter_sources[category]
        else:
            # Fetch from all categories
            for cat_sources in self.newsletter_sources.values():
                sources.extend(cat_sources)
        
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch_rss_feed(session, source) for source in sources]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Flatten results and filter out exceptions
        all_articles = []
        for result in results:
            if isinstance(result, list):
                all_articles.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Task failed: {result}")
        
        # Sort by published date (newest first)
        all_articles.sort(key=lambda x: x.get('published_at', ''), reverse=True)
        
        return all_articles[:20]  # Return top 20 articles

    def get_categories(self) -> List[Dict]:
        """Get available newsletter categories"""
        categories = []
        for category, sources in self.newsletter_sources.items():
            categories.append({
                "id": category,
                "name": category.title(),
                "count": len(sources),
                "description": f"Latest {category} newsletters and articles"
            })
        return categories

    def get_sources(self, category: Optional[str] = None) -> List[Dict]:
        """Get newsletter sources for a category or all categories"""
        if category and category in self.newsletter_sources:
            return self.newsletter_sources[category]
        else:
            all_sources = []
            for sources in self.newsletter_sources.values():
                all_sources.extend(sources)
            return all_sources

# Global instance
newsletter_fetcher = NewsletterFetcher()
