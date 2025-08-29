from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, and_
from typing import List, Optional, cast
from datetime import datetime
import json

from ....core.database import get_db
from ....models.newsletter import Newsletter, NewsletterSubscription, NewsletterLike, NewsletterComment
from ....models.entities import Field
from ....models.user import User
from ....schemas.newsletter import (
    NewsletterCreate, NewsletterUpdate, NewsletterResponse, NewsletterListResponse,
    NewsletterSubscriptionCreate, NewsletterSubscriptionResponse,
    NewsletterCommentCreate, NewsletterCommentResponse,
    AILetterRequest, AILetterResponse
)
from ....core.security import get_current_user, get_optional_user
from ....core.ai import is_gemini_configured, generate_gemini_text
from ....services.external_newsletters import fetch_external_newsletters

router = APIRouter()

@router.get("/external", response_model=List[dict])
async def get_external_newsletters_endpoint(
    category: str = Query("tech", description="Newsletter category: tech, ai, webdev"),
    limit: int = Query(10, ge=1, le=50, description="Number of newsletters to fetch")
):
    """Get external newsletters from RSS feeds"""
    try:
        newsletters = await fetch_external_newsletters(category, limit)
        return newsletters
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch external newsletters: {str(e)}")

@router.get("/", response_model=NewsletterListResponse)
async def get_newsletters(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    field_id: Optional[int] = Query(None),
    status: str = Query("published"),
    search: Optional[str] = Query(None),
    include_external: bool = Query(False, description="Include external newsletters"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get paginated list of newsletters"""
    query = db.query(Newsletter).options(
        joinedload(Newsletter.author),
        joinedload(Newsletter.field)
    )
    
    # Filter by status
    query = query.filter(Newsletter.status == status)
    
    # Filter by field if specified
    if field_id:
        query = query.filter(Newsletter.field_id == field_id)
    
    # Search functionality
    if search:
        query = query.filter(Newsletter.title.ilike(f"%{search}%"))
    
    # Order by creation date (newest first)
    query = query.order_by(desc(Newsletter.created_at))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    newsletters = query.offset(offset).limit(per_page).all()
    
    # Prepare response data
    newsletter_responses = []
    for newsletter in newsletters:
        # Get comments count
        comments_count = db.query(NewsletterComment).filter(
            NewsletterComment.newsletter_id == newsletter.id
        ).count()
        
        # Check if current user liked this newsletter
        is_liked = False
        if current_user:
            is_liked = db.query(NewsletterLike).filter(
                and_(
                    NewsletterLike.newsletter_id == newsletter.id,
                    NewsletterLike.user_id == current_user.id
                )
            ).first() is not None
        
        newsletter_dict = {
            "id": newsletter.id,
            "title": newsletter.title,
            "content": newsletter.content,
            "field_id": newsletter.field_id,
            "tags": newsletter.tags,
            "author_id": newsletter.author_id,
            "is_ai_generated": newsletter.is_ai_generated,
            "status": newsletter.status,
            "views": newsletter.views,
            "likes": newsletter.likes,
            "created_at": newsletter.created_at,
            "published_at": newsletter.published_at,
            "updated_at": newsletter.updated_at,
            "author_name": newsletter.author.full_name,
            "field_name": newsletter.field.display_name,
            "is_liked": is_liked,
            "comments_count": comments_count,
            "is_external": False
        }
        newsletter_responses.append(NewsletterResponse(**newsletter_dict))
    
    # Add external newsletters if requested
    if include_external:
        try:
            # Get user's tech stack if available
            user_tech_stack = None
            if current_user and current_user.selected_field:
                user_tech_stack = current_user.selected_field
            
            external_newsletters = await fetch_external_newsletters("tech", 5, user_tech_stack)
            for ext_newsletter in external_newsletters:
                newsletter_responses.append(NewsletterResponse(**ext_newsletter))
        except Exception:
            pass  # Silently fail if external fetch fails
    
    total_pages = (total + per_page - 1) // per_page
    
    return NewsletterListResponse(
        newsletters=newsletter_responses,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{newsletter_id}", response_model=NewsletterResponse)
def get_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get a specific newsletter by ID"""
    newsletter = db.query(Newsletter).options(
        joinedload(Newsletter.author),
        joinedload(Newsletter.field)
    ).filter(Newsletter.id == newsletter_id).first()
    
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    # Increment view count
    db.query(Newsletter).filter(Newsletter.id == newsletter_id).update(
        {Newsletter.views: Newsletter.views + 1}
    )
    db.commit()
    db.refresh(newsletter)
    
    # Get comments count
    comments_count = db.query(NewsletterComment).filter(
        NewsletterComment.newsletter_id == newsletter.id
    ).count()
    
    # Check if current user liked this newsletter
    is_liked = False
    if current_user:
        is_liked = db.query(NewsletterLike).filter(
            and_(
                NewsletterLike.newsletter_id == newsletter.id,
                NewsletterLike.user_id == current_user.id
            )
        ).first() is not None
    
    newsletter_dict = {
        "id": newsletter.id,
        "title": newsletter.title,
        "content": newsletter.content,
        "field_id": newsletter.field_id,
        "tags": newsletter.tags,
        "author_id": newsletter.author_id,
        "is_ai_generated": newsletter.is_ai_generated,
        "status": newsletter.status,
        "views": newsletter.views,
        "likes": newsletter.likes,
        "created_at": newsletter.created_at,
        "published_at": newsletter.published_at,
        "updated_at": newsletter.updated_at,
        "author_name": newsletter.author.full_name,
        "field_name": newsletter.field.display_name,
        "is_liked": is_liked,
        "comments_count": comments_count
    }
    
    return NewsletterResponse(**newsletter_dict)

@router.post("/", response_model=NewsletterResponse)
def create_newsletter(
    newsletter_data: NewsletterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new newsletter"""
    # Verify field exists
    field = db.query(Field).filter(Field.id == newsletter_data.field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    newsletter = Newsletter(
        title=newsletter_data.title,
        content=newsletter_data.content,
        field_id=newsletter_data.field_id,
        author_id=current_user.id,
        tags=newsletter_data.tags or [],
        status="draft"
    )
    
    db.add(newsletter)
    db.commit()
    db.refresh(newsletter)
    
    newsletter_dict = {
        "id": newsletter.id,
        "title": newsletter.title,
        "content": newsletter.content,
        "field_id": newsletter.field_id,
        "tags": newsletter.tags,
        "author_id": newsletter.author_id,
        "is_ai_generated": newsletter.is_ai_generated,
        "status": newsletter.status,
        "views": newsletter.views,
        "likes": newsletter.likes,
        "created_at": newsletter.created_at,
        "published_at": newsletter.published_at,
        "updated_at": newsletter.updated_at,
        "author_name": current_user.full_name,
        "field_name": field.display_name,
        "is_liked": False,
        "comments_count": 0
    }
    
    return NewsletterResponse(**newsletter_dict)

@router.put("/{newsletter_id}", response_model=NewsletterResponse)
def update_newsletter(
    newsletter_id: int,
    newsletter_data: NewsletterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a newsletter"""
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    # Cast mapped attributes to concrete types for static type checkers
    author_id_value = cast(int, newsletter.author_id)
    if author_id_value != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this newsletter")
    
    # Update fields
    update_data = newsletter_data.model_dump(exclude_unset=True)
    
    # Handle status change to published
    current_status = cast(str, newsletter.status)
    if "status" in update_data and update_data["status"] == "published" and current_status != "published":
        update_data["published_at"] = datetime.utcnow()
    
    # Update the newsletter by setting attributes directly to avoid type issues with Query.update
    for field_name, field_value in update_data.items():
        setattr(newsletter, field_name, field_value)
    db.commit()
    db.refresh(newsletter)
    
    # Get related data
    field = db.query(Field).filter(Field.id == newsletter.field_id).first()
    comments_count = db.query(NewsletterComment).filter(
        NewsletterComment.newsletter_id == newsletter.id
    ).count()
    
    newsletter_dict = {
        "id": newsletter.id,
        "title": newsletter.title,
        "content": newsletter.content,
        "field_id": newsletter.field_id,
        "tags": newsletter.tags,
        "author_id": newsletter.author_id,
        "is_ai_generated": newsletter.is_ai_generated,
        "status": newsletter.status,
        "views": newsletter.views,
        "likes": newsletter.likes,
        "created_at": newsletter.created_at,
        "published_at": newsletter.published_at,
        "updated_at": newsletter.updated_at,
        "author_name": current_user.full_name,
        "field_name": field.display_name if field else None,
        "is_liked": False,
        "comments_count": comments_count
    }
    
    return NewsletterResponse(**newsletter_dict)

@router.post("/{newsletter_id}/like")
def toggle_newsletter_like(
    newsletter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle like/unlike for a newsletter"""
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    existing_like = db.query(NewsletterLike).filter(
        and_(
            NewsletterLike.newsletter_id == newsletter_id,
            NewsletterLike.user_id == current_user.id
        )
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        db.query(Newsletter).filter(Newsletter.id == newsletter_id).update(
            {Newsletter.likes: Newsletter.likes - 1}
        )
        liked = False
    else:
        # Like
        new_like = NewsletterLike(
            newsletter_id=newsletter_id,
            user_id=current_user.id
        )
        db.add(new_like)
        db.query(Newsletter).filter(Newsletter.id == newsletter_id).update(
            {Newsletter.likes: Newsletter.likes + 1}
        )
        liked = True
    
    db.commit()
    db.refresh(newsletter)
    
    return {"liked": liked, "total_likes": newsletter.likes}

@router.get("/{newsletter_id}/comments", response_model=List[NewsletterCommentResponse])
def get_newsletter_comments(
    newsletter_id: int,
    db: Session = Depends(get_db)
):
    """Get comments for a newsletter"""
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    # Get top-level comments with their replies
    comments = db.query(NewsletterComment).options(
        joinedload(NewsletterComment.user)
    ).filter(
        and_(
            NewsletterComment.newsletter_id == newsletter_id,
            NewsletterComment.parent_id.is_(None)
        )
    ).order_by(NewsletterComment.created_at).all()
    
    comment_responses = []
    for comment in comments:
        # Get replies
        replies = db.query(NewsletterComment).options(
            joinedload(NewsletterComment.user)
        ).filter(
            NewsletterComment.parent_id == comment.id
        ).order_by(NewsletterComment.created_at).all()
        
        reply_responses = []
        for reply in replies:
            reply_dict = {
                "id": reply.id,
                "newsletter_id": reply.newsletter_id,
                "user_id": reply.user_id,
                "content": reply.content,
                "parent_id": reply.parent_id,
                "created_at": reply.created_at,
                "updated_at": reply.updated_at,
                "author_name": reply.user.full_name,
                "replies": None
            }
            reply_responses.append(NewsletterCommentResponse(**reply_dict))
        
        comment_dict = {
            "id": comment.id,
            "newsletter_id": comment.newsletter_id,
            "user_id": comment.user_id,
            "content": comment.content,
            "parent_id": comment.parent_id,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "author_name": comment.user.full_name,
            "replies": reply_responses
        }
        comment_responses.append(NewsletterCommentResponse(**comment_dict))
    
    return comment_responses

@router.post("/{newsletter_id}/comments", response_model=NewsletterCommentResponse)
def create_newsletter_comment(
    newsletter_id: int,
    comment_data: NewsletterCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a comment on a newsletter"""
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    # If parent_id is provided, verify it exists
    if comment_data.parent_id:
        parent_comment = db.query(NewsletterComment).filter(
            and_(
                NewsletterComment.id == comment_data.parent_id,
                NewsletterComment.newsletter_id == newsletter_id
            )
        ).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    comment = NewsletterComment(
        newsletter_id=newsletter_id,
        user_id=current_user.id,
        content=comment_data.content,
        parent_id=comment_data.parent_id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    comment_dict = {
        "id": comment.id,
        "newsletter_id": comment.newsletter_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "parent_id": comment.parent_id,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "author_name": current_user.full_name,
        "replies": None
    }
    
    return NewsletterCommentResponse(**comment_dict)

@router.post("/subscriptions", response_model=NewsletterSubscriptionResponse)
def create_subscription(
    subscription_data: NewsletterSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subscribe to newsletters for a specific field"""
    # Check if field exists
    field = db.query(Field).filter(Field.id == subscription_data.field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Check if subscription already exists
    existing_subscription = db.query(NewsletterSubscription).filter(
        and_(
            NewsletterSubscription.user_id == current_user.id,
            NewsletterSubscription.field_id == subscription_data.field_id
        )
    ).first()
    
    if existing_subscription:
        is_active_value = cast(bool, existing_subscription.is_active)
        if not is_active_value:
            db.query(NewsletterSubscription).filter(
                NewsletterSubscription.id == existing_subscription.id
            ).update({"is_active": True})
            db.commit()
            db.refresh(existing_subscription)
        
        subscription_dict = {
            "id": existing_subscription.id,
            "user_id": existing_subscription.user_id,
            "field_id": existing_subscription.field_id,
            "is_active": existing_subscription.is_active,
            "created_at": existing_subscription.created_at,
            "field_name": field.display_name
        }
        return NewsletterSubscriptionResponse(**subscription_dict)
    
    subscription = NewsletterSubscription(
        user_id=current_user.id,
        field_id=subscription_data.field_id
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    subscription_dict = {
        "id": subscription.id,
        "user_id": subscription.user_id,
        "field_id": subscription.field_id,
        "is_active": subscription.is_active,
        "created_at": subscription.created_at,
        "field_name": field.display_name
    }
    
    return NewsletterSubscriptionResponse(**subscription_dict)

@router.delete("/subscriptions/{field_id}")
def unsubscribe(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unsubscribe from newsletters for a specific field"""
    subscription = db.query(NewsletterSubscription).filter(
        and_(
            NewsletterSubscription.user_id == current_user.id,
            NewsletterSubscription.field_id == field_id
        )
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.query(NewsletterSubscription).filter(
        NewsletterSubscription.id == subscription.id
    ).update({"is_active": False})
    db.commit()
    
    return {"message": "Successfully unsubscribed"}

@router.post("/ai-generate", response_model=AILetterResponse)
def generate_ai_letter(
    request: AILetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate an AI letter/newsletter"""
    # Verify field exists
    field = db.query(Field).filter(Field.id == request.field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Prefer Gemini if configured, fallback to mock content
    topic = request.topic or f"Latest trends in {field.display_name}"

    content_text = None
    if is_gemini_configured():
        prompt = (
            f"Write a {request.tone} {request.length} newsletter about '{topic}' for the field "
            f"{field.display_name}. { 'Include practical examples.' if request.include_examples else '' }"
            " Use headings, bullet points where helpful, and keep it concise but insightful."
        )
        content_text, _err = generate_gemini_text(prompt)

    if not content_text:
        # Fallback mock content
        if request.length == "short":
            content_length = "brief overview"
        elif request.length == "long":
            content_length = "comprehensive deep-dive"
        else:
            content_length = "detailed exploration"
        content_text = f"""
# {topic}

Welcome to this {request.tone} {content_length} of {topic.lower()}.

## Introduction

In the rapidly evolving field of {field.display_name}, staying updated with the latest trends and developments is crucial for professionals and enthusiasts alike.

## Key Points

1. **Current Trends**: The field is experiencing significant growth in several areas.
2. **Best Practices**: Industry experts recommend following established guidelines.
3. **Future Outlook**: The next few years promise exciting developments.

## Practical Applications

{"Here are some practical examples and use cases:" if request.include_examples else "The concepts discussed have wide-ranging applications."}

## Conclusion

Understanding these concepts is essential for anyone working in {field.display_name}. Stay tuned for more updates and insights.

---

*This newsletter was generated using AI to provide you with the latest insights in {field.display_name}.*
        """.strip()

    # Generate suggested tags
    suggested_tags = [field.name, "newsletter", "ai-generated"]
    if request.topic:
        topic_words = request.topic.lower().split()
        suggested_tags.extend([word for word in topic_words if len(word) > 3])

    return AILetterResponse(
        title=f"{topic} - {field.display_name} Newsletter",
        content=content_text,
        suggested_tags=suggested_tags[:5],
        field_id=request.field_id
    )
