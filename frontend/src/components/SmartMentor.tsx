'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MentorshipContext, MentorResponse, ProactiveIntervention } from '../types/mentorship';
import { mentorshipService } from '../services/mentorshipService';

interface SmartMentorProps {
  userId: string;
  projectContext?: {
    name?: string;
    current_file?: string;
    language?: string;
    recent_activity?: string;
  };
  isVisible: boolean;
  onToggle: () => void;
}

export const SmartMentor: React.FC<SmartMentorProps> = ({
  userId,
  projectContext,
  isVisible,
  onToggle
}) => {
  const [context, setContext] = useState<MentorshipContext | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'mentor';
    content: string;
    responseType?: 'explanation' | 'hint' | 'question' | 'encouragement';
    timestamp: Date;
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interventions, setInterventions] = useState<ProactiveIntervention[]>([]);
  const [showInterventions, setShowInterventions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContext();
    loadInterventions();
  }, [userId]);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContext = async () => {
    try {
      const data = await mentorshipService.getMentorshipContext(userId);
      setContext(data);
    } catch (error) {
      console.error('Failed to load mentorship context:', error);
    }
  };

  const loadInterventions = async () => {
    try {
      const data = await mentorshipService.getProactiveInterventions(userId);
      setInterventions(data as ProactiveIntervention[]);
      if (data.length > 0) {
        setShowInterventions(true);
      }
    } catch (error) {
      console.error('Failed to load interventions:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    const newUserMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    setIsLoading(true);

    try {
      // Record question
      await mentorshipService.recordQuestion(userId, userMessage);

      // Get mentor response
      const response = await mentorshipService.chatWithMentor(
        userId, 
        userMessage, 
        projectContext
      );

      // Add mentor response
      const mentorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'mentor' as const,
        content: response.message,
        responseType: response.type,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, mentorMessage]);

      // Update context
      await loadContext();

    } catch (error) {
      console.error('Failed to get mentor response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'mentor' as const,
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        responseType: 'encouragement' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getResponseTypeIcon = (type?: string) => {
    switch (type) {
      case 'explanation': return '📚';
      case 'hint': return '💡';
      case 'question': return '❓';
      case 'encouragement': return '🎉';
      default: return '🤖';
    }
  };

  const getResponseTypeColor = (type?: string) => {
    switch (type) {
      case 'explanation': return 'text-blue-400';
      case 'hint': return 'text-yellow-400';
      case 'question': return 'text-purple-400';
      case 'encouragement': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 p-4 rounded-full shadow-xl hover:scale-105 transition-all duration-200 border border-purple-400/20"
        title="Open Smart Mentor"
      >
        <div className="text-2xl">🤖</div>
        {interventions.length > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🤖</div>
          <div>
            <h3 className="font-semibold text-white">Smart Mentor</h3>
            {context && (
              <p className="text-xs text-gray-400">
                {context.skill_level} • {context.learning_style} • Level {Math.floor(context.learning_velocity * 10)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {interventions.length > 0 && (
            <button
              onClick={() => setShowInterventions(!showInterventions)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
              title="View Help Suggestions"
            >
              <div className="relative">
                <div className="text-xl">💡</div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Interventions */}
      {showInterventions && interventions.length > 0 && (
        <div className="p-4 border-b border-gray-700 bg-yellow-900/20">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">Help Suggestions</h4>
          <div className="space-y-2">
            {interventions.map((intervention, index) => (
              <div
                key={index}
                className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded"
              >
                {intervention.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm">Hi! I'm your Smart Mentor. How can I help you today?</p>
            {context && (
              <div className="mt-4 text-xs">
                <p>I know you're working on: <span className="text-purple-400">{context.current_project.name || 'No project'}</span></p>
                {context.struggling_areas.length > 0 && (
                  <p>I can help with: <span className="text-red-400">{context.struggling_areas.join(', ')}</span></p>
                )}
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'mentor' && (
                    <div className="text-lg">{getResponseTypeIcon(message.responseType)}</div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getResponseTypeColor(message.responseType)}`}>
                        {message.responseType || 'mentor'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-lg">🤖</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your mentor anything..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartMentor;
