from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Union
from datetime import datetime

class NewsletterBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    field_id: int
    tags: Optional[List[str]] = None

class NewsletterCreate(NewsletterBase):
    pass

class NewsletterUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    field_id: Optional[int] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in ['draft', 'published', 'archived']:
            raise ValueError('Status must be one of: draft, published, archived')
        return v

class NewsletterResponse(BaseModel):
    id: Union[int, str]
    title: str
    content: str
    field_id: Optional[int]
    tags: List[str]
    author_id: Optional[int]
    is_ai_generated: bool
    status: str
    views: int
    likes: int
    created_at: Union[str, datetime]
    published_at: Optional[Union[str, datetime]]
    updated_at: Union[str, datetime]
    author_name: str
    field_name: str
    is_liked: bool
    comments_count: int
    is_external: bool = False
    external_url: Optional[str] = None
    source_description: Optional[str] = None

    class Config:
        from_attributes = True

class NewsletterListResponse(BaseModel):
    newsletters: List[NewsletterResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class NewsletterSubscriptionCreate(BaseModel):
    field_id: int

class NewsletterSubscriptionResponse(BaseModel):
    id: int
    user_id: int
    field_id: int
    is_active: bool
    created_at: datetime
    field_name: Optional[str] = None

    class Config:
        from_attributes = True

class NewsletterCommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    parent_id: Optional[int] = None

class NewsletterCommentResponse(BaseModel):
    id: int
    newsletter_id: int
    user_id: int
    content: str
    parent_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    author_name: Optional[str] = None
    replies: Optional[List['NewsletterCommentResponse']] = None

    class Config:
        from_attributes = True

class AILetterRequest(BaseModel):
    field_id: int
    topic: Optional[str] = None
    length: Optional[str] = "medium"
    tone: Optional[str] = "professional"
    include_examples: Optional[bool] = True
    target_audience: Optional[str] = "beginner"
    
    @field_validator('length')
    @classmethod
    def validate_length(cls, v):
        if v not in ['short', 'medium', 'long']:
            raise ValueError('Length must be one of: short, medium, long')
        return v
    
    @field_validator('tone')
    @classmethod
    def validate_tone(cls, v):
        if v not in ['professional', 'casual', 'technical', 'friendly']:
            raise ValueError('Tone must be one of: professional, casual, technical, friendly')
        return v
    
    @field_validator('target_audience')
    @classmethod
    def validate_target_audience(cls, v):
        if v not in ['beginner', 'intermediate', 'advanced', 'all']:
            raise ValueError('Target audience must be one of: beginner, intermediate, advanced, all')
        return v

class AILetterResponse(BaseModel):
    title: str
    content: str
    suggested_tags: List[str]
    field_id: int

# Update forward references
NewsletterCommentResponse.model_rebuild()
