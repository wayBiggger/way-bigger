/**
 * File System Service
 * Handles file operations, auto-save, and backend synchronization
 */

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  isDirty?: boolean;
  lastModified?: Date;
  children?: FileNode[];
  parentId?: string;
  path: string;
}

export interface ProjectFolder {
  id: string;
  name: string;
  files: FileNode[];
  lastSync?: Date;
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'error' | 'offline';
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  maxRetries: number;
  retryDelay: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  error: string | null;
}

class FileSystemService {
  private static instance: FileSystemService;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private config: AutoSaveConfig = {
    enabled: true,
    interval: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 5000 // 5 seconds
  };
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
    error: null
  };
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {
    this.setupEventListeners();
    this.startAutoSave();
    this.startSyncTimer();
  }

  public static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.syncWithBackend();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.syncStatus.syncInProgress = false;
      this.notifyListeners();
    });

    // Before unload - save pending changes
    window.addEventListener('beforeunload', () => {
      this.savePendingChanges();
    });

    // Visibility change - pause/resume auto-save
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoSave();
      } else {
        this.resumeAutoSave();
      }
    });
  }

  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      if (this.config.enabled && !document.hidden) {
        this.autoSave();
      }
    }, this.config.interval);
  }

  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        this.syncWithBackend();
      }
    }, 60000); // Sync every minute
  }

  private pauseAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private resumeAutoSave(): void {
    this.startAutoSave();
  }

  private async autoSave(): Promise<void> {
    try {
      const projectFolder = this.getCurrentProjectFolder();
      if (!projectFolder) return;

      const dirtyFiles = projectFolder.files.filter(file => file.isDirty);
      if (dirtyFiles.length === 0) return;

      // Save to localStorage first
      await this.saveToLocalStorage(projectFolder);

      // Try to sync with backend
      if (this.syncStatus.isOnline) {
        await this.syncWithBackend();
      }

      console.log(`Auto-saved ${dirtyFiles.length} files`);
    } catch (error) {
      console.error('Auto-save failed:', error);
      this.syncStatus.error = `Auto-save failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.notifyListeners();
    }
  }

  private async savePendingChanges(): Promise<void> {
    try {
      const projectFolder = this.getCurrentProjectFolder();
      if (!projectFolder) return;

      await this.saveToLocalStorage(projectFolder);
      
      if (this.syncStatus.isOnline) {
        await this.syncWithBackend();
      }
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  }

  public async createProjectFolder(name: string): Promise<ProjectFolder> {
    const projectFolder: ProjectFolder = {
      id: `project_${Date.now()}`,
      name,
      files: [],
      lastSync: undefined,
      isOnline: navigator.onLine,
      syncStatus: 'offline'
    };

    // Create default files
    const defaultFiles: FileNode[] = [
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        content: `# ${name}\n\nWelcome to your project!\n\n## Getting Started\n\nThis is your project workspace. Start coding!`,
        language: 'markdown',
        isDirty: false,
        lastModified: new Date(),
        path: '/README.md'
      },
      {
        id: 'main',
        name: 'main.py',
        type: 'file',
        content: '# Welcome to your project!\nprint("Hello, World!")',
        language: 'python',
        isDirty: false,
        lastModified: new Date(),
        path: '/main.py'
      }
    ];

    projectFolder.files = defaultFiles;
    await this.saveToLocalStorage(projectFolder);
    this.setCurrentProjectFolder(projectFolder);

    return projectFolder;
  }

  public async loadProjectFolder(projectId: string): Promise<ProjectFolder | null> {
    try {
      const stored = localStorage.getItem(`project_${projectId}`);
      if (!stored) return null;

      const projectFolder = JSON.parse(stored) as ProjectFolder;
      projectFolder.isOnline = navigator.onLine;
      projectFolder.syncStatus = projectFolder.isOnline ? 'pending' : 'offline';
      
      this.setCurrentProjectFolder(projectFolder);
      return projectFolder;
    } catch (error) {
      console.error('Failed to load project folder:', error);
      return null;
    }
  }

  public async saveFile(fileId: string, content: string): Promise<void> {
    const projectFolder = this.getCurrentProjectFolder();
    if (!projectFolder) throw new Error('No project folder selected');

    const file = this.findFileById(projectFolder.files, fileId);
    if (!file) throw new Error('File not found');

    file.content = content;
    file.isDirty = true;
    file.lastModified = new Date();

    await this.saveToLocalStorage(projectFolder);
    this.syncStatus.pendingChanges++;
    this.notifyListeners();

    // Trigger auto-save
    if (this.config.enabled) {
      setTimeout(() => this.autoSave(), 1000);
    }
  }

  public async createFile(name: string, language: string, parentId?: string): Promise<FileNode> {
    const projectFolder = this.getCurrentProjectFolder();
    if (!projectFolder) throw new Error('No project folder selected');

    const file: FileNode = {
      id: `file_${Date.now()}`,
      name,
      type: 'file',
      content: this.getDefaultContent(language),
      language,
      isDirty: false,
      lastModified: new Date(),
      parentId,
      path: parentId ? `${this.getFilePath(projectFolder.files, parentId)}/${name}` : `/${name}`
    };

    if (parentId) {
      const parent = this.findFileById(projectFolder.files, parentId);
      if (parent && parent.type === 'folder') {
        if (!parent.children) parent.children = [];
        parent.children.push(file);
      }
    } else {
      projectFolder.files.push(file);
    }

    await this.saveToLocalStorage(projectFolder);
    this.syncStatus.pendingChanges++;
    this.notifyListeners();

    return file;
  }

  public async createFolder(name: string, parentId?: string): Promise<FileNode> {
    const projectFolder = this.getCurrentProjectFolder();
    if (!projectFolder) throw new Error('No project folder selected');

    const folder: FileNode = {
      id: `folder_${Date.now()}`,
      name,
      type: 'folder',
      children: [],
      isDirty: false,
      lastModified: new Date(),
      parentId,
      path: parentId ? `${this.getFilePath(projectFolder.files, parentId)}/${name}` : `/${name}`
    };

    if (parentId) {
      const parent = this.findFileById(projectFolder.files, parentId);
      if (parent && parent.type === 'folder') {
        if (!parent.children) parent.children = [];
        parent.children.push(folder);
      }
    } else {
      projectFolder.files.push(folder);
    }

    await this.saveToLocalStorage(projectFolder);
    this.syncStatus.pendingChanges++;
    this.notifyListeners();

    return folder;
  }

  public async deleteFile(fileId: string): Promise<void> {
    const projectFolder = this.getCurrentProjectFolder();
    if (!projectFolder) throw new Error('No project folder selected');

    this.removeFileById(projectFolder.files, fileId);
    await this.saveToLocalStorage(projectFolder);
    this.syncStatus.pendingChanges++;
    this.notifyListeners();
  }

  public async renameFile(fileId: string, newName: string): Promise<void> {
    const projectFolder = this.getCurrentProjectFolder();
    if (!projectFolder) throw new Error('No project folder selected');

    const file = this.findFileById(projectFolder.files, fileId);
    if (!file) throw new Error('File not found');

    file.name = newName;
    file.isDirty = true;
    file.lastModified = new Date();

    await this.saveToLocalStorage(projectFolder);
    this.syncStatus.pendingChanges++;
    this.notifyListeners();
  }

  public async syncWithBackend(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.syncInProgress) return;

    const projectFolder = this.getCurrentProjectFolder();
    if (!projectFolder) return;

    this.syncStatus.syncInProgress = true;
    this.syncStatus.error = null;
    this.notifyListeners();

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/code-editor/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectId: projectFolder.id,
          projectName: projectFolder.name,
          files: projectFolder.files,
          lastSync: projectFolder.lastSync
        }),
      });

      if (response.ok) {
        const result = await response.json();
        projectFolder.lastSync = new Date();
        projectFolder.syncStatus = 'synced';
        this.syncStatus.lastSync = new Date();
        this.syncStatus.pendingChanges = 0;
        this.syncStatus.error = null;

        // Update local storage
        await this.saveToLocalStorage(projectFolder);
        
        console.log('Successfully synced with backend');
      } else {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Backend sync failed:', error);
      projectFolder.syncStatus = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Sync failed';
    } finally {
      this.syncStatus.syncInProgress = false;
      this.notifyListeners();
    }
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public subscribeToSyncStatus(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public updateConfig(config: Partial<AutoSaveConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.enabled !== undefined || config.interval !== undefined) {
      this.startAutoSave();
    }
  }

  public getConfig(): AutoSaveConfig {
    return { ...this.config };
  }

  private async saveToLocalStorage(projectFolder: ProjectFolder): Promise<void> {
    try {
      localStorage.setItem(`project_${projectFolder.id}`, JSON.stringify(projectFolder));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save project data');
    }
  }

  private getCurrentProjectFolder(): ProjectFolder | null {
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (!currentProjectId) return null;

    const stored = localStorage.getItem(`project_${currentProjectId}`);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as ProjectFolder;
    } catch {
      return null;
    }
  }

  private setCurrentProjectFolder(projectFolder: ProjectFolder): void {
    localStorage.setItem('currentProjectId', projectFolder.id);
  }

  private findFileById(files: FileNode[], fileId: string): FileNode | null {
    for (const file of files) {
      if (file.id === fileId) return file;
      if (file.children) {
        const found = this.findFileById(file.children, fileId);
        if (found) return found;
      }
    }
    return null;
  }

  private removeFileById(files: FileNode[], fileId: string): boolean {
    for (let i = 0; i < files.length; i++) {
      if (files[i].id === fileId) {
        files.splice(i, 1);
        return true;
      }
      if (files[i].children) {
        if (this.removeFileById(files[i].children!, fileId)) {
          return true;
        }
      }
    }
    return false;
  }

  private getFilePath(files: FileNode[], fileId: string): string {
    const file = this.findFileById(files, fileId);
    return file ? file.path : '';
  }

  private getDefaultContent(language: string): string {
    const defaults: { [key: string]: string } = {
      python: '# Python file\nprint("Hello, World!")',
      javascript: '// JavaScript file\nconsole.log("Hello, World!");',
      typescript: '// TypeScript file\nconsole.log("Hello, World!");',
      java: '// Java file\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '// C++ file\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
      csharp: '// C# file\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
      go: '// Go file\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
      rust: '// Rust file\nfn main() {\n    println!("Hello, World!");\n}',
      html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
      css: '/* CSS file */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}',
      json: '{\n    "name": "my-project",\n    "version": "1.0.0",\n    "description": "My awesome project"\n}',
      markdown: '# My Project\n\nThis is a markdown file.\n\n## Features\n\n- Feature 1\n- Feature 2'
    };

    return defaults[language] || `// ${language} file\n// Start coding here...`;
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.syncStatus));
  }

  public destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.listeners.clear();
  }
}

export default FileSystemService;
