import redis
import json
import pickle
from typing import Any, Optional, Union
from functools import wraps
import logging
from .config import settings

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_client = None
        self.memory_cache = {}
        self.cache_enabled = True
        
        try:
            if settings.redis_url:
                self.redis_client = redis.from_url(
                    settings.redis_url,
                    decode_responses=False,  # We'll handle encoding ourselves
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Redis cache connected successfully")
            else:
                logger.warning("Redis URL not configured, using memory cache only")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}, using memory cache only")
            self.redis_client = None

    def _serialize(self, data: Any) -> bytes:
        """Serialize data for storage"""
        try:
            return pickle.dumps(data)
        except Exception as e:
            logger.error(f"Serialization error: {e}")
            return json.dumps(data).encode('utf-8')

    def _deserialize(self, data: bytes) -> Any:
        """Deserialize data from storage"""
        try:
            return pickle.loads(data)
        except Exception as e:
            logger.error(f"Deserialization error: {e}")
            return json.loads(data.decode('utf-8'))

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.cache_enabled:
            return None
            
        try:
            # Try Redis first
            if self.redis_client:
                data = self.redis_client.get(key)
                if data:
                    return self._deserialize(data)
            
            # Fallback to memory cache
            return self.memory_cache.get(key)
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        if not self.cache_enabled:
            return False
            
        try:
            serialized_data = self._serialize(value)
            
            # Try Redis first
            if self.redis_client:
                self.redis_client.setex(key, ttl, serialized_data)
                return True
            
            # Fallback to memory cache
            self.memory_cache[key] = value
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            if self.redis_client:
                self.redis_client.delete(key)
            
            if key in self.memory_cache:
                del self.memory_cache[key]
            
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        try:
            deleted_count = 0
            
            if self.redis_client:
                keys = self.redis_client.keys(pattern)
                if keys:
                    deleted_count = self.redis_client.delete(*keys)
            
            # Clear memory cache
            memory_keys = [k for k in self.memory_cache.keys() if pattern.replace('*', '') in k]
            for key in memory_keys:
                del self.memory_cache[key]
                deleted_count += 1
            
            return deleted_count
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return 0

    def get_stats(self) -> dict:
        """Get cache statistics"""
        try:
            stats = {
                'memory_cache_size': len(self.memory_cache),
                'redis_connected': self.redis_client is not None,
                'cache_enabled': self.cache_enabled
            }
            
            if self.redis_client:
                info = self.redis_client.info()
                stats.update({
                    'redis_memory_used': info.get('used_memory_human', 'N/A'),
                    'redis_connected_clients': info.get('connected_clients', 0),
                    'redis_keyspace_hits': info.get('keyspace_hits', 0),
                    'redis_keyspace_misses': info.get('keyspace_misses', 0)
                })
            
            return stats
        except Exception as e:
            logger.error(f"Cache stats error: {e}")
            return {'error': str(e)}

# Global cache instance
cache = CacheService()

def cached(ttl: int = 3600, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            logger.debug(f"Cached result for {cache_key}")
            return result
        
        return wrapper
    return decorator

def invalidate_cache(pattern: str):
    """Invalidate cache entries matching pattern"""
    return cache.clear_pattern(pattern)
