'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ProjectFile, ProjectParticipant, CursorPosition } from '../types/collaboration';
import { useCollaboration } from '../hooks/useCollaboration';

// Dynamically import Monaco Editor
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

interface CollaborationEditorProps {
  projectId: string;
  userId: string;
  onFileChange?: (fileId: string, content: string) => void;
  onFileSelect?: (fileId: string) => void;
}

interface UserCursor {
  userId: string;
  username: string;
  color: string;
  position: { line: number; column: number };
  selection?: { start: number; end: number };
}

export const CollaborationEditor: React.FC<CollaborationEditorProps> = ({
  projectId,
  userId,
  onFileChange,
  onFileSelect
}) => {
  const {
    files,
    participants,
    activeUsers,
    createFile,
    updateFile,
    switchFile,
    sendCodeChange,
    sendCursorMove,
    loading,
    error
  } = useCollaboration(userId, projectId);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [userCursors, setUserCursors] = useState<Map<string, UserCursor>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [lastChangeTime, setLastChangeTime] = useState<number>(0);
  
  const editorRef = useRef<any>(null);
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];

  // Load files when project changes
  useEffect(() => {
    if (files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id);
      setFileContent(files[0].content || '');
    }
  }, [files, selectedFileId]);

  // Handle file selection
  const handleFileSelect = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setSelectedFileId(fileId);
      setFileContent(file.content || '');
      switchFile(fileId);
      onFileSelect?.(fileId);
    }
  }, [files, switchFile, onFileSelect]);

  // Handle content changes
  const handleContentChange = useCallback((value: string | undefined) => {
    if (!selectedFileId || !value) return;
    
    setFileContent(value);
    setIsEditing(true);
    setLastChangeTime(Date.now());
    
    // Debounce changes to avoid too many WebSocket messages
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    
    changeTimeoutRef.current = setTimeout(() => {
      updateFile(selectedFileId, value);
      onFileChange?.(selectedFileId, value);
      setIsEditing(false);
    }, 500);
  }, [selectedFileId, updateFile, onFileChange]);

  // Handle cursor position changes
  const handleCursorPositionChange = useCallback((e: any) => {
    if (!selectedFileId) return;
    
    const position = e.position;
    sendCursorMove(selectedFileId, {
      line: position.lineNumber,
      column: position.column
    });
  }, [selectedFileId, sendCursorMove]);

  // Handle selection changes
  const handleSelectionChange = useCallback((e: any) => {
    if (!selectedFileId) return;
    
    const selection = e.selection;
    if (selection && selection.startLineNumber !== selection.endLineNumber) {
      // Handle text selection
      console.log('Selection changed:', selection);
    }
  }, [selectedFileId]);

  // Create new file
  const handleCreateFile = async () => {
    const filename = prompt('Enter filename:');
    if (filename) {
      try {
        const file = await createFile(filename, `/${filename}`, '', 'javascript');
        handleFileSelect(file.id);
      } catch (error) {
        console.error('Failed to create file:', error);
      }
    }
  };

  // Get user color
  const getUserColor = useCallback((userId: string): string => {
    const userIndex = participants.findIndex(p => p.user_id === userId);
    return cursorColors[userIndex % cursorColors.length];
  }, [participants]);

  // Get username
  const getUsername = useCallback((userId: string): string => {
    const participant = participants.find(p => p.user_id === userId);
    return participant ? `User ${userId.slice(-4)}` : 'Unknown';
  }, [participants]);

  // Render user cursors
  const renderUserCursors = () => {
    return Array.from(userCursors.values()).map(cursor => (
      <div
        key={cursor.userId}
        className="absolute pointer-events-none z-10"
        style={{
          left: `${cursor.position.column * 8}px`, // Approximate character width
          top: `${(cursor.position.line - 1) * 20}px`, // Approximate line height
          color: cursor.color,
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        <div className="flex items-center gap-1">
          <div 
            className="w-0.5 h-5"
            style={{ backgroundColor: cursor.color }}
          />
          <span className="bg-black/50 px-1 rounded text-xs">
            {cursor.username}
          </span>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">⚠️</div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="flex h-full">
      {/* File Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Files</h3>
            <button
              onClick={handleCreateFile}
              className="text-green-400 hover:text-green-300 text-sm"
              title="Create new file"
            >
              + New File
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {files.map(file => (
            <div
              key={file.id}
              onClick={() => handleFileSelect(file.id)}
              className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                selectedFileId === file.id ? 'bg-purple-900/30 border-purple-500' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  {file.language === 'javascript' ? '📄' : 
                   file.language === 'python' ? '🐍' :
                   file.language === 'html' ? '🌐' :
                   file.language === 'css' ? '🎨' : '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{file.filename}</div>
                  <div className="text-gray-400 text-xs">{file.language || 'text'}</div>
                </div>
                {file.is_locked && (
                  <div className="text-yellow-400 text-xs">🔒</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-white font-medium">
                {selectedFile?.filename || 'No file selected'}
              </h4>
              {isEditing && (
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Editing...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Active Users */}
              <div className="flex items-center gap-1">
                {activeUsers.slice(0, 3).map((activeUserId, index) => (
                  <div
                    key={activeUserId}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: getUserColor(activeUserId) }}
                    title={getUsername(activeUserId)}
                  >
                    {getUsername(activeUserId).slice(-1)}
                  </div>
                ))}
                {activeUsers.length > 3 && (
                  <div className="text-gray-400 text-xs">
                    +{activeUsers.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative">
          {selectedFile ? (
            <MonacoEditor
              height="100%"
              language={selectedFile.language || 'javascript'}
              value={fileContent}
              onChange={handleContentChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                cursorSmoothCaretAnimation: 'on',
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'all',
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  useShadows: false,
                  verticalHasArrows: true,
                  horizontalHasArrows: true
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <p>Select a file to start editing</p>
              </div>
            </div>
          )}
          
          {/* User Cursors Overlay */}
          {renderUserCursors()}
        </div>
      </div>
    </div>
  );
};

export default CollaborationEditor;
