import { 
  TeamProject, ProjectParticipant, CollaborationSession, 
  ProjectFile, ChatMessage, TeamInvitation, ProjectRole, ParticipantStatus 
} from '../types/collaboration';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';

class CollaborationService {
  private ws: WebSocket | null = null;
  private wsListeners: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/collaboration${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Collaboration API error: ${response.statusText}`);
    }

    return response.json();
  }

  // WebSocket Management
  connectWebSocket(userId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(`${WS_BASE_URL}/ws/${userId}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect(userId);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private reconnect(userId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
        this.connectWebSocket(userId);
      }, delay);
    }
  }

  private handleWebSocketMessage(data: any): void {
    const { type } = data;
    
    // Call registered listeners
    this.wsListeners.forEach((listener, eventType) => {
      if (eventType === type || eventType === '*') {
        listener(data);
      }
    });
  }

  addWebSocketListener(eventType: string, listener: (data: any) => void): void {
    this.wsListeners.set(eventType, listener);
  }

  removeWebSocketListener(eventType: string): void {
    this.wsListeners.delete(eventType);
  }

  sendWebSocketMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.wsListeners.clear();
  }

  // Project Management
  async createTeamProject(data: {
    name: string;
    description: string;
    difficulty_level: string;
    max_team_size?: number;
    min_team_size?: number;
    is_public?: boolean;
  }): Promise<TeamProject> {
    const response = await this.makeRequest<{ project: TeamProject }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.project;
  }

  async getTeamProjects(type: 'my_projects' | 'available' | 'active' = 'active'): Promise<TeamProject[]> {
    const response = await this.makeRequest<{ projects: TeamProject[] }>(`/projects?status=${type}`);
    return response.projects;
  }

  async getTeamProject(projectId: string): Promise<TeamProject> {
    const response = await this.makeRequest<{ project: TeamProject }>(`/projects/${projectId}`);
    return response.project;
  }

  async joinTeamProject(projectId: string, role: string = 'contributor'): Promise<void> {
    await this.makeRequest(`/projects/${projectId}/join`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async leaveTeamProject(projectId: string): Promise<void> {
    // This would need to be implemented in the backend
    console.log('Leaving project:', projectId);
  }

  // Invitations
  async inviteToProject(
    projectId: string, 
    invitedUserId: string, 
    role: string = 'contributor',
    message?: string
  ): Promise<TeamInvitation> {
    const response = await this.makeRequest<{ invitation: TeamInvitation }>('/projects/' + projectId + '/invite', {
      method: 'POST',
      body: JSON.stringify({
        invited_user_id: invitedUserId,
        role,
        message,
      }),
    });
    return response.invitation;
  }

  async respondToInvitation(invitationId: string, response: 'accept' | 'decline'): Promise<void> {
    await this.makeRequest(`/invitations/${invitationId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  async getUserInvitations(status: 'pending' | 'all' = 'pending'): Promise<TeamInvitation[]> {
    const response = await this.makeRequest<{ invitations: TeamInvitation[] }>(`/user/user-123/invitations?status=${status}`);
    return response.invitations;
  }

  // File Management
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    const response = await this.makeRequest<{ files: ProjectFile[] }>(`/projects/${projectId}/files`);
    return response.files;
  }

  async createProjectFile(
    projectId: string,
    filename: string,
    filePath: string,
    content: string = '',
    language?: string
  ): Promise<ProjectFile> {
    const response = await this.makeRequest<{ file: ProjectFile }>('/projects/' + projectId + '/files', {
      method: 'POST',
      body: JSON.stringify({
        filename,
        file_path: filePath,
        content,
        language,
      }),
    });
    return response.file;
  }

  async updateProjectFile(
    projectId: string,
    fileId: string,
    content: string,
    version: number
  ): Promise<void> {
    // This would typically be handled via WebSocket for real-time updates
    console.log('Updating file:', fileId, 'with content length:', content.length);
  }

  // Chat
  async getChatMessages(projectId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    const response = await this.makeRequest<{ messages: ChatMessage[] }>(`/projects/${projectId}/chat?limit=${limit}&offset=${offset}`);
    return response.messages;
  }

  sendChatMessage(projectId: string, content: string, messageType: string = 'text'): void {
    this.sendWebSocketMessage({
      type: 'chat_message',
      project_id: projectId,
      content,
      message_type: messageType,
    });
  }

  // Real-time Collaboration
  joinProject(projectId: string): void {
    this.sendWebSocketMessage({
      type: 'join_project',
      project_id: projectId,
    });
  }

  leaveProject(projectId: string): void {
    this.sendWebSocketMessage({
      type: 'leave_project',
      project_id: projectId,
    });
  }

  sendCodeChange(projectId: string, fileId: string, change: any): void {
    this.sendWebSocketMessage({
      type: 'code_change',
      project_id: projectId,
      file_id: fileId,
      change,
    });
  }

  sendCursorMove(projectId: string, fileId: string, position: { line: number; column: number }): void {
    this.sendWebSocketMessage({
      type: 'cursor_move',
      project_id: projectId,
      file_id: fileId,
      position,
    });
  }

  sendFileSwitch(projectId: string, fileId: string): void {
    this.sendWebSocketMessage({
      type: 'file_switch',
      project_id: projectId,
      file_id: fileId,
    });
  }

  // Voice and Screen Share
  joinVoiceChannel(projectId: string): void {
    this.sendWebSocketMessage({
      type: 'voice_join',
      project_id: projectId,
    });
  }

  leaveVoiceChannel(projectId: string): void {
    this.sendWebSocketMessage({
      type: 'voice_leave',
      project_id: projectId,
    });
  }

  startScreenShare(projectId: string): void {
    this.sendWebSocketMessage({
      type: 'screen_share_start',
      project_id: projectId,
    });
  }

  stopScreenShare(projectId: string): void {
    this.sendWebSocketMessage({
      type: 'screen_share_stop',
      project_id: projectId,
    });
  }

  // Utility Methods
  checkCollaborationUnlocked(userLevel: number, completedProjects: number): boolean {
    return userLevel >= 3 && completedProjects >= 5;
  }

  getRolePermissions(role: ProjectRole): string[] {
    const rolePermissions: Record<ProjectRole, string[]> = {
      [ProjectRole.LEADER]: ['admin', 'manage_users', 'manage_roles', 'write', 'read'],
      [ProjectRole.FRONTEND_DEVELOPER]: ['write', 'read'],
      [ProjectRole.BACKEND_DEVELOPER]: ['write', 'read'],
      [ProjectRole.UI_UX_DESIGNER]: ['write', 'read'],
      [ProjectRole.DATA_SCIENTIST]: ['write', 'read'],
      [ProjectRole.DEVOPS_ENGINEER]: ['write', 'read'],
      [ProjectRole.CONTRIBUTOR]: ['read'],
    };
    
    return rolePermissions[role] || ['read'];
  }

  formatRoleName(role: ProjectRole): string {
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
  }
}

export const collaborationService = new CollaborationService();
export default collaborationService;
