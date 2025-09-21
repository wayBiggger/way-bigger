/**
 * FileExplorer Component
 * Provides file tree navigation with drag & drop, context menus, and file operations
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileNode, ProjectFolder } from '@/services/fileSystem';

interface FileExplorerProps {
  projectFolder: ProjectFolder | null;
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (name: string, language: string, parentId?: string) => void;
  onFolderCreate: (name: string, parentId?: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFolderRename: (fileId: string, newName: string) => void;
  onFolderDelete: (fileId: string) => void;
  isDark: boolean;
  className?: string;
}

interface FileItemProps {
  file: FileNode;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: (fileId: string) => void;
  onSelect: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => void;
  onDelete: (fileId: string) => void;
  onCreateFile: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
  isDark: boolean;
}

const SUPPORTED_LANGUAGES = [
  { name: 'Python', value: 'python', extension: '.py', icon: '🐍' },
  { name: 'JavaScript', value: 'javascript', extension: '.js', icon: '🟨' },
  { name: 'TypeScript', value: 'typescript', extension: '.ts', icon: '🔷' },
  { name: 'Java', value: 'java', extension: '.java', icon: '☕' },
  { name: 'C++', value: 'cpp', extension: '.cpp', icon: '⚡' },
  { name: 'C#', value: 'csharp', extension: '.cs', icon: '🔷' },
  { name: 'Go', value: 'go', extension: '.go', icon: '🐹' },
  { name: 'Rust', value: 'rust', extension: '.rs', icon: '🦀' },
  { name: 'HTML', value: 'html', extension: '.html', icon: '🌐' },
  { name: 'CSS', value: 'css', extension: '.css', icon: '🎨' },
  { name: 'JSON', value: 'json', extension: '.json', icon: '📄' },
  { name: 'Markdown', value: 'markdown', extension: '.md', icon: '📝' }
];

const FileItem: React.FC<FileItemProps> = ({
  file,
  level,
  isActive,
  isExpanded,
  onToggle,
  onSelect,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  isDark
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createMenuPosition, setCreateMenuPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleCreateMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCreateMenuPosition({ x: e.clientX, y: e.clientY });
    setShowCreateMenu(true);
  };

  const handleRename = () => {
    setIsRenaming(true);
    setNewName(file.name);
    setShowContextMenu(false);
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewName(file.name);
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onDelete(file.id);
    }
    setShowContextMenu(false);
  };

  const handleCreateFile = (language: string) => {
    const name = prompt('Enter file name:');
    if (name) {
      const extension = SUPPORTED_LANGUAGES.find(l => l.value === language)?.extension || '';
      const fileName = name.includes('.') ? name : `${name}${extension}`;
      // Store the file details in a way that can be accessed by the parent
      // For now, just call onCreateFile with the parent ID
      onCreateFile(file.id);
    }
    setShowCreateMenu(false);
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name) {
      onCreateFolder(file.id);
    }
    setShowCreateMenu(false);
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') {
      return isExpanded ? '📂' : '📁';
    }
    
    const language = SUPPORTED_LANGUAGES.find(l => l.value === file.language);
    return language?.icon || '📄';
  };

  const getFileExtension = (fileName: string) => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot) : '';
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 rounded cursor-pointer group hover:bg-opacity-50 transition-colors ${
          isActive
            ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'
            : isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => file.type === 'file' ? onSelect(file.id) : onToggle(file.id)}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center flex-1 min-w-0">
          {file.type === 'folder' && (
            <button
              className="mr-1 p-0.5 hover:bg-opacity-20 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(file.id);
              }}
            >
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          <span className="mr-2 text-sm">{getFileIcon(file)}</span>
          
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              className={`flex-1 px-1 py-0.5 text-sm rounded border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          ) : (
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
          )}
          
          {file.isDirty && (
            <span className="ml-2 text-orange-500 text-xs">●</span>
          )}
        </div>

        {file.type === 'folder' && (
          <button
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-opacity-20 rounded transition-opacity"
            onClick={handleCreateMenu}
            title="Create new file/folder"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className={`fixed z-50 py-1 rounded-lg shadow-lg border ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={handleRename}
          >
            Rename
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}

      {/* Create Menu */}
      {showCreateMenu && (
        <div
          ref={contextMenuRef}
          className={`fixed z-50 py-1 rounded-lg shadow-lg border ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
          style={{
            left: createMenuPosition.x,
            top: createMenuPosition.y,
          }}
        >
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            Create File
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
              onClick={() => handleCreateFile(lang.value)}
            >
              <span className="mr-2">{lang.icon}</span>
              {lang.name}
            </button>
          ))}
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-1">
            Create Folder
          </div>
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
            onClick={handleCreateFolder}
          >
            <span className="mr-2">📁</span>
            New Folder
          </button>
        </div>
      )}

      {/* Children */}
      {file.type === 'folder' && isExpanded && file.children && (
        <div>
          {file.children.map((child) => (
            <FileItem
              key={child.id}
              file={child}
              level={level + 1}
              isActive={isActive}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({
  projectFolder,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFolderCreate,
  onFileDelete,
  onFileRename,
  onFolderRename,
  onFolderDelete,
  isDark,
  className = ''
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const toggleFolder = useCallback((fileId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const handleFileCreate = useCallback((name: string, language: string, parentId?: string) => {
    onFileCreate(name, language, parentId);
  }, [onFileCreate]);

  const handleFolderCreate = useCallback((name: string, parentId?: string) => {
    onFolderCreate(name, parentId);
  }, [onFolderCreate]);

  // Wrapper functions for the FileNode component interface
  const handleFileCreateWrapper = useCallback((parentId: string) => {
    const name = prompt('Enter file name:');
    if (name) {
      const language = 'javascript'; // Default language
      onFileCreate(name, language, parentId);
    }
  }, [onFileCreate]);

  const handleFolderCreateWrapper = useCallback((parentId: string) => {
    const name = prompt('Enter folder name:');
    if (name) {
      onFolderCreate(name, parentId);
    }
  }, [onFolderCreate]);

  const handleFileRename = useCallback((fileId: string, newName: string) => {
    onFileRename(fileId, newName);
  }, [onFileRename]);

  const handleFolderRename = useCallback((fileId: string, newName: string) => {
    onFolderRename(fileId, newName);
  }, [onFolderRename]);

  const handleFileDelete = useCallback((fileId: string) => {
    onFileDelete(fileId);
  }, [onFileDelete]);

  const handleFolderDelete = useCallback((fileId: string) => {
    onFolderDelete(fileId);
  }, [onFolderDelete]);

  const handleCreateProject = useCallback(() => {
    setIsCreatingProject(true);
    const name = prompt('Enter project name:');
    if (name) {
      // This will be handled by the parent component
      // For now, we'll just close the dialog
    }
    setIsCreatingProject(false);
  }, []);

  if (!projectFolder) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className={`p-8 rounded-lg border-2 border-dashed ${
          isDark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'
        }`}>
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
          <p className="text-sm mb-4">Choose a project folder to start coding</p>
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Choose Project Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">
            {projectFolder.name}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFileCreate('new-file.py', 'python')}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              title="New File"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => onFolderCreate('New Folder')}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              title="New Folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {projectFolder.files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            level={0}
            isActive={activeFileId === file.id}
            isExpanded={expandedFolders.has(file.id)}
            onToggle={toggleFolder}
            onSelect={onFileSelect}
            onRename={file.type === 'file' ? handleFileRename : handleFolderRename}
            onDelete={file.type === 'file' ? handleFileDelete : handleFolderDelete}
            onCreateFile={handleFileCreateWrapper}
            onCreateFolder={handleFolderCreateWrapper}
            isDark={isDark}
          />
        ))}
      </div>

      {/* Footer */}
      <div className={`p-2 border-t ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {projectFolder.files.length} items
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
