from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from ..core.ai import get_gemini_response
from ..models.mentorship import (
    MentorshipContext, MentorshipSession, LearningStyleProfile, 
    MentorshipResource, ProactiveIntervention
)
from ..models.gamification import UserProgress

class MentorshipEngine:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_mentorship_context(self, user_id: str) -> MentorshipContext:
        """Get or create mentorship context for user"""
        context = self.db.query(MentorshipContext).filter(
            MentorshipContext.user_id == user_id
        ).first()
        
        if not context:
            context = MentorshipContext(
                user_id=user_id,
                skill_level="beginner",
                learning_style="mixed",
                preferred_help_style="detailed"
            )
            self.db.add(context)
            self.db.commit()
            self.db.refresh(context)
        
        return context
    
    async def update_context(self, user_id: str, updates: Dict) -> MentorshipContext:
        """Update mentorship context with new information"""
        context = await self.get_mentorship_context(user_id)
        
        for key, value in updates.items():
            if hasattr(context, key):
                setattr(context, key, value)
        
        context.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(context)
        return context
    
    async def assess_learning_style(self, user_id: str, responses: Dict) -> LearningStyleProfile:
        """Assess user's learning style based on quiz responses"""
        # Calculate scores for each learning style
        visual_score = self._calculate_visual_score(responses)
        auditory_score = self._calculate_auditory_score(responses)
        kinesthetic_score = self._calculate_kinesthetic_score(responses)
        reading_score = self._calculate_reading_score(responses)
        
        # Determine primary and secondary styles
        scores = {
            'visual': visual_score,
            'auditory': auditory_score,
            'kinesthetic': kinesthetic_score,
            'reading': reading_score
        }
        
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary_style = sorted_scores[0][0]
        secondary_style = sorted_scores[1][0] if len(sorted_scores) > 1 else None
        
        # Create or update learning style profile
        profile = self.db.query(LearningStyleProfile).filter(
            LearningStyleProfile.user_id == user_id
        ).first()
        
        if not profile:
            profile = LearningStyleProfile(user_id=user_id)
            self.db.add(profile)
        
        profile.visual_score = visual_score
        profile.auditory_score = auditory_score
        profile.kinesthetic_score = kinesthetic_score
        profile.reading_score = reading_score
        profile.primary_style = primary_style
        profile.secondary_style = secondary_style
        profile.assessment_completed = True
        profile.assessment_date = datetime.utcnow()
        profile.confidence_level = max(scores.values()) / 100.0
        
        # Set preferences based on learning style
        profile.prefers_diagrams = primary_style == 'visual'
        profile.prefers_examples = primary_style == 'kinesthetic'
        profile.prefers_explanations = primary_style == 'auditory'
        profile.prefers_hands_on = primary_style == 'kinesthetic'
        
        self.db.commit()
        self.db.refresh(profile)
        return profile
    
    def _calculate_visual_score(self, responses: Dict) -> float:
        """Calculate visual learning score from responses"""
        visual_questions = [
            'prefer_diagrams', 'like_charts', 'visual_examples', 
            'color_coding', 'mind_maps'
        ]
        return sum(responses.get(q, 0) for q in visual_questions) * 20
    
    def _calculate_auditory_score(self, responses: Dict) -> float:
        """Calculate auditory learning score from responses"""
        auditory_questions = [
            'prefer_explanations', 'like_discussions', 'verbal_instructions',
            'audio_content', 'group_study'
        ]
        return sum(responses.get(q, 0) for q in auditory_questions) * 20
    
    def _calculate_kinesthetic_score(self, responses: Dict) -> float:
        """Calculate kinesthetic learning score from responses"""
        kinesthetic_questions = [
            'hands_on_learning', 'practical_examples', 'trial_and_error',
            'physical_activities', 'interactive_content'
        ]
        return sum(responses.get(q, 0) for q in kinesthetic_questions) * 20
    
    def _calculate_reading_score(self, responses: Dict) -> float:
        """Calculate reading/writing learning score from responses"""
        reading_questions = [
            'prefer_reading', 'like_notes', 'written_instructions',
            'documentation', 'text_content'
        ]
        return sum(responses.get(q, 0) for q in reading_questions) * 20
    
    async def generate_mentor_response(
        self, 
        user_id: str, 
        user_message: str,
        project_context: Optional[Dict] = None
    ) -> Dict:
        """Generate contextual mentor response"""
        context = await self.get_mentorship_context(user_id)
        learning_profile = self.db.query(LearningStyleProfile).filter(
            LearningStyleProfile.user_id == user_id
        ).first()
        
        # Build context-aware prompt
        prompt = self._build_mentor_prompt(
            user_message, context, learning_profile, project_context
        )
        
        # Get AI response
        response = await get_gemini_response(prompt)
        
        # Parse response and determine type
        response_data = self._parse_mentor_response(response)
        
        # Save session
        session = MentorshipSession(
            user_id=user_id,
            context_id=context.id,
            session_type="reactive",
            user_message=user_message,
            mentor_response=response_data['message'],
            response_type=response_data['type'],
            difficulty_level=response_data['difficulty'],
            concepts_covered=response_data.get('concepts', []),
            resources_provided=response_data.get('resources', []),
            follow_up_questions=response_data.get('follow_up_questions', [])
        )
        self.db.add(session)
        self.db.commit()
        
        return response_data
    
    def _build_mentor_prompt(
        self, 
        user_message: str, 
        context: MentorshipContext, 
        learning_profile: Optional[LearningStyleProfile],
        project_context: Optional[Dict]
    ) -> str:
        """Build context-aware prompt for mentor"""
        
        # Base context
        prompt_parts = [
            "You are an AI coding mentor with deep expertise in programming education.",
            "Your role is to provide personalized, contextual guidance to help students learn effectively.",
            "",
            f"STUDENT CONTEXT:",
            f"- Skill Level: {context.skill_level}",
            f"- Learning Style: {context.learning_style}",
            f"- Preferred Help Style: {context.preferred_help_style}",
            f"- Current Project: {context.current_project_name or 'None'}",
            f"- Current Language: {context.current_language or 'None'}",
            f"- Struggling Areas: {', '.join(context.struggling_areas) if context.struggling_areas else 'None'}",
            f"- Strong Areas: {', '.join(context.strong_areas) if context.strong_areas else 'None'}",
        ]
        
        # Add learning style preferences
        if learning_profile:
            prompt_parts.extend([
                "",
                "LEARNING PREFERENCES:",
                f"- Primary Style: {learning_profile.primary_style}",
                f"- Prefers Diagrams: {learning_profile.prefers_diagrams}",
                f"- Prefers Examples: {learning_profile.prefers_examples}",
                f"- Prefers Explanations: {learning_profile.prefers_explanations}",
                f"- Prefers Hands-on: {learning_profile.prefers_hands_on}",
                f"- Detail Level: {learning_profile.detail_level}",
            ])
        
        # Add project context
        if project_context:
            prompt_parts.extend([
                "",
                "CURRENT PROJECT CONTEXT:",
                f"- Project: {project_context.get('name', 'Unknown')}",
                f"- Current File: {project_context.get('current_file', 'Unknown')}",
                f"- Language: {project_context.get('language', 'Unknown')}",
                f"- Recent Activity: {project_context.get('recent_activity', 'None')}",
            ])
        
        # Add recent context
        if context.recent_errors:
            prompt_parts.extend([
                "",
                "RECENT ERRORS:",
                *[f"- {error}" for error in context.recent_errors[-3:]]
            ])
        
        if context.recent_questions:
            prompt_parts.extend([
                "",
                "RECENT QUESTIONS:",
                *[f"- {q}" for q in context.recent_questions[-3:]]
            ])
        
        # Add instructions
        prompt_parts.extend([
            "",
            "RESPONSE GUIDELINES:",
            "1. Adapt your language complexity to the student's skill level",
            "2. Use their preferred learning style (visual, auditory, kinesthetic, reading)",
            "3. Provide appropriate help style (detailed explanations, hints, or questions)",
            "4. Be encouraging and supportive",
            "5. Suggest specific next steps",
            "6. Provide relevant resources when helpful",
            "7. Ask follow-up questions to deepen understanding",
            "",
            f"STUDENT MESSAGE: {user_message}",
            "",
            "Respond with a JSON object containing:",
            "- message: Your response to the student",
            "- type: 'explanation', 'hint', 'question', or 'encouragement'",
            "- difficulty: 1-5 scale",
            "- concepts: List of concepts covered",
            "- resources: List of helpful resources",
            "- follow_up_questions: List of follow-up questions"
        ])
        
        return "\n".join(prompt_parts)
    
    def _parse_mentor_response(self, response: str) -> Dict:
        """Parse mentor response and extract structured data"""
        try:
            # Try to parse as JSON first
            if response.strip().startswith('{'):
                return json.loads(response)
        except json.JSONDecodeError:
            pass
        
        # Fallback to simple parsing
        return {
            'message': response,
            'type': 'explanation',
            'difficulty': 3,
            'concepts': [],
            'resources': [],
            'follow_up_questions': []
        }
    
    async def detect_struggle_patterns(self, user_id: str) -> List[Dict]:
        """Detect if user is struggling and needs help"""
        context = await self.get_mentorship_context(user_id)
        
        # Check for various struggle indicators
        interventions = []
        
        # Check for long idle time
        if context.last_activity:
            idle_time = datetime.utcnow() - context.last_activity
            if idle_time > timedelta(minutes=15):
                interventions.append({
                    'type': 'idle',
                    'message': "I notice you've been away for a while. Would you like some help getting back on track?",
                    'priority': 2
                })
        
        # Check for repeated errors
        if len(context.recent_errors) >= 3:
            interventions.append({
                'type': 'error_pattern',
                'message': f"I see you're encountering some challenges with {', '.join(set(context.recent_errors[-3:]))}. Let me help you work through this!",
                'priority': 3
            })
        
        # Check for struggling areas
        if context.struggling_areas:
            interventions.append({
                'type': 'struggling',
                'message': f"I remember you've been working on {', '.join(context.struggling_areas[:2])}. How can I help you make progress?",
                'priority': 2
            })
        
        return interventions
    
    async def get_recommended_resources(
        self, 
        user_id: str, 
        topic: str, 
        limit: int = 5
    ) -> List[MentorshipResource]:
        """Get recommended resources based on user's learning style and needs"""
        context = await self.get_mentorship_context(user_id)
        learning_profile = self.db.query(LearningStyleProfile).filter(
            LearningStyleProfile.user_id == user_id
        ).first()
        
        # Build query based on user preferences
        query = self.db.query(MentorshipResource).filter(
            MentorshipResource.skill_level == context.skill_level
        )
        
        # Filter by learning style if available
        if learning_profile and learning_profile.primary_style != 'mixed':
            query = query.filter(
                MentorshipResource.learning_style.in_([
                    learning_profile.primary_style, 
                    'mixed'
                ])
            )
        
        # Filter by topic
        query = query.filter(
            MentorshipResource.topics.contains([topic])
        )
        
        # Order by quality and relevance
        resources = query.order_by(
            desc(MentorshipResource.quality_score),
            desc(MentorshipResource.success_rate)
        ).limit(limit).all()
        
        return resources
    
    async def update_learning_progress(
        self, 
        user_id: str, 
        concept: str, 
        mastery_level: float
    ) -> None:
        """Update user's learning progress for a concept"""
        context = await self.get_mentorship_context(user_id)
        
        # Update struggling/strong areas based on mastery
        if mastery_level >= 0.7:  # Good mastery
            if concept in context.struggling_areas:
                context.struggling_areas.remove(concept)
            if concept not in context.strong_areas:
                context.strong_areas.append(concept)
        elif mastery_level <= 0.3:  # Poor mastery
            if concept not in context.struggling_areas:
                context.struggling_areas.append(concept)
            if concept in context.strong_areas:
                context.strong_areas.remove(concept)
        
        # Update learning velocity based on progress
        if mastery_level > 0.8:
            context.learning_velocity = min(context.learning_velocity * 1.1, 2.0)
        elif mastery_level < 0.2:
            context.learning_velocity = max(context.learning_velocity * 0.9, 0.5)
        
        context.updated_at = datetime.utcnow()
        self.db.commit()
