import { MentorshipContext, LearningStyleProfile, MentorshipResource, MentorshipSession } from '../types/mentorship';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class MentorshipService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/mentorship${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Mentorship API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Context Management
  async getMentorshipContext(userId: string): Promise<MentorshipContext> {
    return this.makeRequest<MentorshipContext>(`/context/${userId}`);
  }

  async updateMentorshipContext(userId: string, updates: Partial<MentorshipContext>): Promise<MentorshipContext> {
    return this.makeRequest<MentorshipContext>(`/context/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Learning Style Assessment
  async assessLearningStyle(userId: string, responses: Record<string, number>): Promise<LearningStyleProfile> {
    return this.makeRequest<LearningStyleProfile>(`/assess-learning-style/${userId}`, {
      method: 'POST',
      body: JSON.stringify(responses),
    });
  }

  async getLearningStyle(userId: string): Promise<LearningStyleProfile> {
    return this.makeRequest<LearningStyleProfile>(`/learning-style/${userId}`);
  }

  async getLearningStyleQuiz(): Promise<Array<{
    id: string;
    question: string;
    category: string;
  }>> {
    const response = await this.makeRequest<{ questions: Array<{ id: string; question: string; category: string }> }>('/quiz/questions');
    return response.questions;
  }

  // Chat with Mentor
  async chatWithMentor(
    userId: string, 
    message: string, 
    projectContext?: {
      name?: string;
      current_file?: string;
      language?: string;
      recent_activity?: string;
    }
  ): Promise<{
    message: string;
    type: 'explanation' | 'hint' | 'question' | 'encouragement';
    difficulty: number;
    concepts: string[];
    resources: string[];
    follow_up_questions: string[];
  }> {
    const response = await this.makeRequest<{ response: any }>('/chat/' + userId, {
      method: 'POST',
      body: JSON.stringify({
        message,
        project_context: projectContext
      }),
    });
    return response.response;
  }

  // Proactive Interventions
  async getProactiveInterventions(userId: string): Promise<Array<{
    type: string;
    message: string;
    priority: number;
  }>> {
    const response = await this.makeRequest<{ interventions: any[] }>(`/interventions/${userId}`);
    return response.interventions;
  }

  // Resources
  async getRecommendedResources(
    userId: string, 
    topic: string, 
    limit: number = 5
  ): Promise<MentorshipResource[]> {
    const response = await this.makeRequest<{ resources: MentorshipResource[] }>(`/resources/${userId}?topic=${encodeURIComponent(topic)}&limit=${limit}`);
    return response.resources;
  }

  // Progress Tracking
  async updateLearningProgress(
    userId: string, 
    concept: string, 
    masteryLevel: number
  ): Promise<void> {
    await this.makeRequest(`/progress/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        concept,
        mastery_level: masteryLevel
      }),
    });
  }

  // Session History
  async getMentorshipSessions(userId: string, limit: number = 20): Promise<MentorshipSession[]> {
    const response = await this.makeRequest<{ sessions: MentorshipSession[] }>(`/sessions/${userId}?limit=${limit}`);
    return response.sessions;
  }

  async submitSessionFeedback(
    sessionId: string,
    satisfaction: number,
    wasHelpful: boolean,
    learningAchieved: boolean
  ): Promise<void> {
    await this.makeRequest(`/feedback/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({
        satisfaction,
        was_helpful: wasHelpful,
        learning_achieved: learningAchieved
      }),
    });
  }

  // Utility Methods
  async updateProjectContext(
    userId: string, 
    projectId: string, 
    projectName: string, 
    currentFile: string, 
    language: string
  ): Promise<void> {
    await this.updateMentorshipContext(userId, {
      current_project: {
        id: projectId,
        name: projectName,
        file: currentFile,
        language: language
      },
      last_activity: new Date().toISOString()
    });
  }

  async recordError(userId: string, error: string): Promise<void> {
    const context = await this.getMentorshipContext(userId);
    const recentErrors = context.recent_errors || [];
    recentErrors.unshift(error);
    
    await this.updateMentorshipContext(userId, {
      recent_errors: recentErrors.slice(0, 10) // Keep only last 10 errors
    });
  }

  async recordQuestion(userId: string, question: string): Promise<void> {
    const context = await this.getMentorshipContext(userId);
    const recentQuestions = context.recent_questions || [];
    recentQuestions.unshift(question);
    
    await this.updateMentorshipContext(userId, {
      recent_questions: recentQuestions.slice(0, 10) // Keep only last 10 questions
    });
  }

  // Learning Style Detection
  detectLearningStyleFromBehavior(behavior: {
    prefersVisualAids: boolean;
    asksForExamples: boolean;
    requestsExplanations: boolean;
    likesHandsOn: boolean;
  }): string {
    const scores = {
      visual: behavior.prefersVisualAids ? 1 : 0,
      kinesthetic: behavior.likesHandsOn ? 1 : 0,
      auditory: behavior.requestsExplanations ? 1 : 0,
      reading: !behavior.prefersVisualAids && !behavior.likesHandsOn && !behavior.requestsExplanations ? 1 : 0
    };

    const maxScore = Math.max(...Object.values(scores));
    const detectedStyle = Object.keys(scores).find(style => scores[style as keyof typeof scores] === maxScore);
    
    return detectedStyle || 'mixed';
  }
}

export const mentorshipService = new MentorshipService();
export default mentorshipService;
