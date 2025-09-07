import google.generativeai as genai
from typing import List, Dict, Any, Optional
from .config import settings
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = None
        
        if not self.api_key:
            logger.warning("Gemini API key not configured")
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Gemini Flash service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini service: {e}")
            self.model = None

    def generate_project_ideas(self, field: str, difficulty: str, user_interests: List[str] = None) -> List[Dict[str, Any]]:
        """Generate project ideas based on field, difficulty, and user interests"""
        if not self.model:
            return []
        
        try:
            prompt = f"""
            Generate 3 creative project ideas for {field} at {difficulty} level.
            
            User interests: {', '.join(user_interests) if user_interests else 'General programming'}
            
            For each project, provide:
            - Title
            - Brief description (2-3 sentences)
            - Key learning objectives
            - Estimated time commitment
            - Required skills
            - Why this project is valuable
            
            Format as a structured list.
            """
            
            response = self.model.generate_content(prompt)
            return self._parse_project_ideas(response.text)
        except Exception as e:
            logger.error(f"Error generating project ideas: {e}")
            return []

    def generate_learning_path(self, field: str, current_skill_level: str, goal: str) -> Dict[str, Any]:
        """Generate a personalized learning path"""
        if not self.model:
            return {}
        
        try:
            prompt = f"""
            Create a personalized learning path for someone learning {field}.
            
            Current skill level: {current_skill_level}
            Learning goal: {goal}
            
            Provide:
            - 5-7 learning milestones
            - Resources for each milestone
            - Estimated time for each milestone
            - Practice projects for each milestone
            - Tips for staying motivated
            
            Format as a structured learning plan.
            """
            
            response = self.model.generate_content(prompt)
            return self._parse_learning_path(response.text)
        except Exception as e:
            logger.error(f"Error generating learning path: {e}")
            return {}

    def code_review_and_suggestions(self, code: str, language: str, context: str = "") -> Dict[str, Any]:
        """Provide code review and improvement suggestions"""
        if not self.model:
            return {}
        
        try:
            prompt = f"""
            Review this {language} code and provide constructive feedback:
            
            Code:
            {code}
            
            Context: {context}
            
            Provide:
            - Code quality assessment
            - Specific improvement suggestions
            - Best practices recommendations
            - Security considerations (if applicable)
            - Performance optimizations (if applicable)
            
            Be constructive and educational.
            """
            
            response = self.model.generate_content(prompt)
            return {
                "review": response.text,
                "language": language,
                "context": context
            }
        except Exception as e:
            logger.error(f"Error in code review: {e}")
            return {}

    def generate_project_description(self, title: str, field: str, difficulty: str) -> Dict[str, Any]:
        """Generate detailed project description and milestones"""
        if not self.model:
            return {}
        
        try:
            prompt = f"""
            Create a detailed project description for: {title}
            
            Field: {field}
            Difficulty: {difficulty}
            
            Provide:
            - Comprehensive description
            - 5-7 detailed milestones with time estimates
            - Required skills and technologies
            - Learning outcomes
            - Tips for success
            - Common challenges and solutions
            
            Make it engaging and educational.
            """
            
            response = self.model.generate_content(prompt)
            return self._parse_project_description(response.text)
        except Exception as e:
            logger.error(f"Error generating project description: {e}")
            return {}

    def ai_tutor_response(self, question: str, context: str = "", user_level: str = "beginner") -> str:
        """Provide AI tutoring for programming questions"""
        if not self.model:
            return "Gemini AI service is not available. Please check your configuration."
        
        try:
            prompt = f"""
            You are a helpful programming tutor. Answer this question for a {user_level} level student:
            
            Question: {question}
            Context: {context}
            
            Provide:
            - Clear, beginner-friendly explanation
            - Code examples if relevant
            - Related concepts to explore
            - Common mistakes to avoid
            - Next steps for learning
            
            Keep it concise but comprehensive.
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error in AI tutoring: {e}")
            return "Sorry, I encountered an error. Please try again."

    def _parse_project_ideas(self, text: str) -> List[Dict[str, Any]]:
        """Parse AI-generated project ideas into structured format"""
        # This is a simplified parser - you might want to enhance it
        try:
            # Basic parsing logic - you can make this more sophisticated
            projects = []
            lines = text.split('\n')
            current_project = {}
            
            for line in lines:
                line = line.strip()
                if line.startswith('-') or line.startswith('*'):
                    if current_project:
                        projects.append(current_project)
                    current_project = {'title': line[1:].strip()}
                elif ':' in line and current_project:
                    key, value = line.split(':', 1)
                    current_project[key.strip().lower().replace(' ', '_')] = value.strip()
            
            if current_project:
                projects.append(current_project)
            
            return projects
        except Exception as e:
            logger.error(f"Error parsing project ideas: {e}")
            return []

    def _parse_learning_path(self, text: str) -> Dict[str, Any]:
        """Parse AI-generated learning path into structured format"""
        try:
            # Basic parsing - enhance as needed
            return {
                "raw_content": text,
                "parsed": True,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        except Exception as e:
            logger.error(f"Error parsing learning path: {e}")
            return {}

    def _parse_project_description(self, text: str) -> Dict[str, Any]:
        """Parse AI-generated project description into structured format"""
        try:
            # Basic parsing - enhance as needed
            return {
                "raw_content": text,
                "parsed": True,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        except Exception as e:
            logger.error(f"Error parsing project description: {e}")
            return {}

# Global instance
gemini_service = GeminiService()
