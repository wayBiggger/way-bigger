export enum ProjectRole {
  LEADER = 'leader',
  FRONTEND_DEVELOPER = 'frontend_developer',
  BACKEND_DEVELOPER = 'backend_developer',
  UI_UX_DESIGNER = 'ui_ux_designer',
  DATA_SCIENTIST = 'data_scientist',
  DEVOPS_ENGINEER = 'devops_engineer',
  CONTRIBUTOR = 'contributor'
}

export enum ParticipantStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export enum ProjectPermission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles'
}

export interface TeamProject {
  id: string;
  name: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  max_team_size: number;
  min_team_size: number;
  is_public: boolean;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage: number;
  created_by: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  participants?: ProjectParticipant[];
}

export interface ProjectParticipant {
  user_id: string;
  role: ProjectRole;
  permissions: ProjectPermission[];
  status: ParticipantStatus;
  joined_at: string;
  last_active: string;
  lines_contributed: number;
  commits_made: number;
  hours_contributed: number;
}

export interface CollaborationSession {
  id: string;
  project_id: string;
  session_name?: string;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
  active_participants: string[];
  active_files: string[];
  voice_channel_active: boolean;
  screen_share_active: boolean;
  screen_share_user?: string;
}

export interface ProjectFile {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  language?: string;
  content: string;
  version: number;
  last_modified_by?: string;
  last_modified_at: string;
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
}

export interface FileChange {
  id: string;
  file_id: string;
  user_id: string;
  change_type: 'insert' | 'delete' | 'replace';
  start_position: number;
  end_position: number;
  old_content?: string;
  new_content?: string;
  operation_id: string;
  parent_operation_id?: string;
  created_at: string;
  applied_at?: string;
}

export interface CursorPosition {
  id: string;
  participant_id: string;
  file_id: string;
  line: number;
  column: number;
  selection_start?: number;
  selection_end?: number;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message_type: 'text' | 'system' | 'file_shared' | 'voice_note';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  edited_at?: string;
}

export interface TeamInvitation {
  id: string;
  project_id: string;
  invited_user_id: string;
  invited_by: string;
  role: ProjectRole;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at?: string;
  responded_at?: string;
}

export interface CollaborationStats {
  user_id: string;
  project_id: string;
  total_sessions: number;
  total_hours: number;
  last_session_at?: string;
  lines_written: number;
  lines_deleted: number;
  files_created: number;
  files_modified: number;
  messages_sent: number;
  voice_minutes: number;
  screen_share_minutes: number;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  timestamp: string;
}

export interface UserJoinedEvent extends WebSocketEvent {
  type: 'user_joined';
  user_id: string;
  project_id: string;
}

export interface UserLeftEvent extends WebSocketEvent {
  type: 'user_left';
  user_id: string;
  project_id: string;
}

export interface CodeChangeEvent extends WebSocketEvent {
  type: 'code_change';
  user_id: string;
  project_id: string;
  file_id: string;
  change: {
    type: 'insert' | 'delete' | 'replace';
    start: number;
    end: number;
    text: string;
  };
}

export interface CursorMoveEvent extends WebSocketEvent {
  type: 'cursor_move';
  user_id: string;
  project_id: string;
  file_id: string;
  position: {
    line: number;
    column: number;
    selection_start?: number;
    selection_end?: number;
  };
}

export interface FileSwitchEvent extends WebSocketEvent {
  type: 'file_switch';
  user_id: string;
  project_id: string;
  file_id: string;
}

export interface ChatMessageEvent extends WebSocketEvent {
  type: 'chat_message';
  user_id: string;
  project_id: string;
  content: string;
  message_type: string;
}

export interface VoiceJoinedEvent extends WebSocketEvent {
  type: 'voice_joined';
  user_id: string;
  project_id: string;
}

export interface VoiceLeftEvent extends WebSocketEvent {
  type: 'voice_left';
  user_id: string;
  project_id: string;
}

export interface ScreenShareStartedEvent extends WebSocketEvent {
  type: 'screen_share_started';
  user_id: string;
  project_id: string;
}

export interface ScreenShareStoppedEvent extends WebSocketEvent {
  type: 'screen_share_stopped';
  user_id: string;
  project_id: string;
}

// Union type for all WebSocket events
export type CollaborationEvent = 
  | UserJoinedEvent
  | UserLeftEvent
  | CodeChangeEvent
  | CursorMoveEvent
  | FileSwitchEvent
  | ChatMessageEvent
  | VoiceJoinedEvent
  | VoiceLeftEvent
  | ScreenShareStartedEvent
  | ScreenShareStoppedEvent;

// Team Formation Types
export interface TeamMatchingCriteria {
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_roles: ProjectRole[];
  timezone: string;
  availability_hours: number;
  project_difficulty: 'beginner' | 'intermediate' | 'advanced';
  team_size_preference: number;
}

export interface TeamMatch {
  user_id: string;
  compatibility_score: number;
  matching_skills: string[];
  timezone_compatibility: number;
  role_fit: ProjectRole;
}

// Project Creation Wizard Types
export interface ProjectCreationStep {
  step: number;
  title: string;
  description: string;
  fields: ProjectCreationField[];
}

export interface ProjectCreationField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ProjectCreationData {
  name: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  max_team_size: number;
  min_team_size: number;
  is_public: boolean;
  required_roles: ProjectRole[];
  skills_needed: string[];
  estimated_duration: number; // in days
  project_goals: string[];
}
