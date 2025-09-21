export interface MentorshipContext {
  user_id: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  preferred_help_style: 'detailed' | 'hints' | 'questions';
  current_project: {
    id: string | null;
    name: string | null;
    file: string | null;
    language: string | null;
  };
  struggling_areas: string[];
  strong_areas: string[];
  learning_velocity: number;
  session_duration: number;
  last_activity: string;
  recent_errors: string[];
  recent_questions: string[];
}

export interface LearningStyleProfile {
  primary_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  secondary_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  scores: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
  preferences: {
    prefers_diagrams: boolean;
    prefers_examples: boolean;
    prefers_explanations: boolean;
    prefers_hands_on: boolean;
  };
  detail_level: 'low' | 'medium' | 'high';
  explanation_style: 'theoretical' | 'practical' | 'mixed';
  confidence_level: number;
  assessment_completed: boolean;
}

export interface MentorshipResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'tutorial' | 'exercise' | 'diagram';
  url?: string;
  difficulty_level: number;
  time_required: number;
  topics: string[];
  languages: string[];
}

export interface MentorshipSession {
  id: string;
  session_type: 'proactive' | 'reactive' | 'assessment' | 'review';
  topic?: string;
  user_message?: string;
  mentor_response: string;
  response_type: 'explanation' | 'hint' | 'question' | 'encouragement';
  difficulty_level: number;
  concepts_covered: string[];
  resources_provided: string[];
  follow_up_questions: string[];
  was_helpful?: boolean;
  learning_achieved: boolean;
  created_at: string;
}

export interface MentorResponse {
  message: string;
  type: 'explanation' | 'hint' | 'question' | 'encouragement';
  difficulty: number;
  concepts: string[];
  resources: string[];
  follow_up_questions: string[];
}

export interface ProactiveIntervention {
  type: 'idle' | 'error_pattern' | 'struggling' | 'success';
  message: string;
  priority: number;
}

export interface LearningStyleQuestion {
  id: string;
  question: string;
  category: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export interface ProjectContext {
  name?: string;
  current_file?: string;
  language?: string;
  recent_activity?: string;
}

export interface MentorshipStats {
  total_sessions: number;
  concepts_learned: number;
  resources_used: number;
  average_satisfaction: number;
  learning_velocity: number;
  current_streak: number;
  struggling_areas: string[];
  strong_areas: string[];
}
