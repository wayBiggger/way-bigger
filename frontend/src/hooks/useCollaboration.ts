'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TeamProject, ProjectParticipant, ProjectFile, ChatMessage, TeamInvitation,
  ProjectRole, ParticipantStatus 
} from '../types/collaboration';

interface UseCollaborationReturn {
  // State
  projects: TeamProject[];
  currentProject: TeamProject | null;
  participants: ProjectParticipant[];
  files: ProjectFile[];
  chatMessages: ChatMessage[];
  invitations: TeamInvitation[];
  
  // WebSocket state
  isConnected: boolean;
  activeUsers: string[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Project management
  createProject: (data: any) => Promise<TeamProject>;
  joinProject: (projectId: string, role?: string) => Promise<void>;
  leaveProject: (projectId: string) => Promise<void>;
  getProject: (projectId: string) => Promise<TeamProject>;
  
  // File management
  createFile: (filename: string, filePath: string, content?: string, language?: string) => Promise<ProjectFile>;
  updateFile: (fileId: string, content: string) => void;
  switchFile: (fileId: string) => void;
  
  // Chat
  sendMessage: (content: string, messageType?: string) => void;
  
  // Real-time collaboration
  sendCodeChange: (fileId: string, change: any) => void;
  sendCursorMove: (fileId: string, position: { line: number; column: number }) => void;
  
  // Voice and screen share
  joinVoiceChannel: () => void;
  leaveVoiceChannel: () => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  
  // Invitations
  inviteUser: (userId: string, role: string, message?: string) => Promise<TeamInvitation>;
  respondToInvitation: (invitationId: string, response: 'accept' | 'decline') => Promise<void>;
  
  // Utility
  checkCollaborationUnlocked: (level: number, completedProjects: number) => boolean;
  formatRoleName: (role: ProjectRole) => string;
}

export const useCollaboration = (userId: string, currentProjectId?: string): UseCollaborationReturn => {
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [currentProject, setCurrentProject] = useState<TeamProject | null>(null);
  const [participants, setParticipants] = useState<ProjectParticipant[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock implementation for now
  const createProject = useCallback(async (data: any): Promise<TeamProject> => {
    const project: TeamProject = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      difficulty_level: data.difficulty_level,
      max_team_size: data.max_team_size,
      min_team_size: data.min_team_size,
      is_public: data.is_public,
      status: 'active',
      progress_percentage: 0,
      created_by: userId,
      created_at: new Date().toISOString()
    };
    setProjects(prev => [project, ...prev]);
    return project;
  }, [userId]);

  const joinProject = useCallback(async (projectId: string, role: string = 'contributor'): Promise<void> => {
    console.log('Joining project:', projectId, 'with role:', role);
    // Mock implementation
  }, []);

  const leaveProject = useCallback(async (projectId: string): Promise<void> => {
    console.log('Leaving project:', projectId);
    setCurrentProject(null);
    setParticipants([]);
    setFiles([]);
    setChatMessages([]);
  }, []);

  const getProject = useCallback(async (projectId: string): Promise<TeamProject> => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    setCurrentProject(project);
    return project;
  }, [projects]);

  const createFile = useCallback(async (
    filename: string, 
    filePath: string, 
    content: string = '', 
    language?: string
  ): Promise<ProjectFile> => {
    const file: ProjectFile = {
      id: Date.now().toString(),
      filename,
      file_path: filePath,
      file_type: filename.split('.').pop() || 'txt',
      language,
      content,
      version: 1,
      last_modified_by: userId,
      last_modified_at: new Date().toISOString(),
      is_locked: false
    };
    setFiles(prev => [...prev, file]);
    return file;
  }, [userId]);

  const updateFile = useCallback((fileId: string, content: string) => {
    console.log('Updating file:', fileId, 'with content length:', content.length);
  }, []);

  const switchFile = useCallback((fileId: string) => {
    console.log('Switching to file:', fileId);
  }, []);

  const sendMessage = useCallback((content: string, messageType: string = 'text') => {
    console.log('Sending message:', content, 'type:', messageType);
  }, []);

  const sendCodeChange = useCallback((fileId: string, change: any) => {
    console.log('Sending code change:', fileId, change);
  }, []);

  const sendCursorMove = useCallback((fileId: string, position: { line: number; column: number }) => {
    console.log('Sending cursor move:', fileId, position);
  }, []);

  const joinVoiceChannel = useCallback(() => {
    console.log('Joining voice channel');
  }, []);

  const leaveVoiceChannel = useCallback(() => {
    console.log('Leaving voice channel');
  }, []);

  const startScreenShare = useCallback(() => {
    console.log('Starting screen share');
  }, []);

  const stopScreenShare = useCallback(() => {
    console.log('Stopping screen share');
  }, []);

  const inviteUser = useCallback(async (
    userId: string, 
    role: string, 
    message?: string
  ): Promise<TeamInvitation> => {
    const invitation: TeamInvitation = {
      id: Date.now().toString(),
      project_id: currentProject?.id || '',
      invited_user_id: userId,
      invited_by: userId,
      role: role as ProjectRole,
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    return invitation;
  }, [currentProject]);

  const respondToInvitation = useCallback(async (
    invitationId: string, 
    response: 'accept' | 'decline'
  ): Promise<void> => {
    console.log('Responding to invitation:', invitationId, response);
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  }, []);

  const checkCollaborationUnlocked = useCallback((level: number, completedProjects: number): boolean => {
    return level >= 3 && completedProjects >= 5;
  }, []);

  const formatRoleName = useCallback((role: ProjectRole): string => {
    const roleNames: Record<ProjectRole, string> = {
      [ProjectRole.LEADER]: 'Project Leader',
      [ProjectRole.FRONTEND_DEVELOPER]: 'Frontend Developer',
      [ProjectRole.BACKEND_DEVELOPER]: 'Backend Developer',
      [ProjectRole.UI_UX_DESIGNER]: 'UI/UX Designer',
      [ProjectRole.DATA_SCIENTIST]: 'Data Scientist',
      [ProjectRole.DEVOPS_ENGINEER]: 'DevOps Engineer',
      [ProjectRole.CONTRIBUTOR]: 'Contributor',
    };
    return roleNames[role] || 'Unknown Role';
  }, []);

  // Load initial data
  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    // State
    projects,
    currentProject,
    participants,
    files,
    chatMessages,
    invitations,
    isConnected,
    activeUsers,
    loading,
    error,
    
    // Project management
    createProject,
    joinProject,
    leaveProject,
    getProject,
    
    // File management
    createFile,
    updateFile,
    switchFile,
    
    // Chat
    sendMessage,
    
    // Real-time collaboration
    sendCodeChange,
    sendCursorMove,
    
    // Voice and screen share
    joinVoiceChannel,
    leaveVoiceChannel,
    startScreenShare,
    stopScreenShare,
    
    // Invitations
    inviteUser,
    respondToInvitation,
    
    // Utility
    checkCollaborationUnlocked,
    formatRoleName
  };
};

export default useCollaboration;
