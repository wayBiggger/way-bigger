'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ProjectParticipant } from '../types/collaboration';
import { useCollaboration } from '../hooks/useCollaboration';

interface TeamChatProps {
  projectId: string;
  userId: string;
  participants: ProjectParticipant[];
}

export const TeamChat: React.FC<TeamChatProps> = ({
  projectId,
  userId,
  participants
}) => {
  const { chatMessages, sendMessage, isConnected } = useCollaboration(userId, projectId);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    sendMessage(message.trim());
    setMessage('');
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    if (!isTyping) {
      setIsTyping(true);
      // Send typing indicator (this would be implemented in the service)
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getParticipantInfo = (userId: string) => {
    const participant = participants.find(p => p.user_id === userId);
    return {
      username: participant ? `User ${userId.slice(-4)}` : 'Unknown',
      role: participant?.role || 'contributor',
      status: participant?.status || 'offline'
    };
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'system': return '🔧';
      case 'file_shared': return '📎';
      case 'voice_note': return '🎤';
      default: return '💬';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Team Chat</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {/* Online Participants */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-400">Online:</span>
          {participants
            .filter(p => p.status === 'online')
            .slice(0, 5)
            .map(participant => (
              <div
                key={participant.user_id}
                className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white font-bold"
                title={`${getParticipantInfo(participant.user_id).username} (${participant.role})`}
              >
                {getParticipantInfo(participant.user_id).username.slice(-1)}
              </div>
            ))}
          {participants.filter(p => p.status === 'online').length > 5 && (
            <span className="text-xs text-gray-400">
              +{participants.filter(p => p.status === 'online').length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const participantInfo = getParticipantInfo(msg.user_id);
            const isOwnMessage = msg.user_id === userId;
            const isSystemMessage = msg.message_type === 'system';
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                  isSystemMessage ? 'justify-center' : ''
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    isSystemMessage
                      ? 'bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm'
                      : isOwnMessage
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  } rounded-lg p-3`}
                >
                  {!isSystemMessage && !isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-lg">{getMessageTypeIcon(msg.message_type)}</div>
                      <span className="text-xs font-semibold text-purple-300">
                        {participantInfo.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {participantInfo.role}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(msg.created_at)}
                    </div>
                    {msg.edited_at && (
                      <div className="text-xs text-gray-500">(edited)</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-300 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs">
                  {typingUsers.length === 1 
                    ? `${getParticipantInfo(typingUsers[0]).username} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-2">
          <button
            className="text-gray-400 hover:text-white text-sm"
            title="Send file"
          >
            📎 File
          </button>
          <button
            className="text-gray-400 hover:text-white text-sm"
            title="Voice message"
          >
            🎤 Voice
          </button>
          <button
            className="text-gray-400 hover:text-white text-sm"
            title="Code snippet"
          >
            💻 Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
