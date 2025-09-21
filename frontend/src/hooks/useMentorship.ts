'use client';

import { useState, useEffect, useCallback } from 'react';
import { MentorshipContext, LearningStyleProfile, MentorResponse, ProactiveIntervention } from '../types/mentorship';
import { mentorshipService } from '../services/mentorshipService';

interface UseMentorshipReturn {
  context: MentorshipContext | null;
  learningProfile: LearningStyleProfile | null;
  interventions: ProactiveIntervention[];
  loading: boolean;
  error: string | null;
  chatWithMentor: (message: string, projectContext?: any) => Promise<MentorResponse>;
  updateContext: (updates: Partial<MentorshipContext>) => Promise<void>;
  updateProjectContext: (projectId: string, projectName: string, currentFile: string, language: string) => Promise<void>;
  recordError: (error: string) => Promise<void>;
  recordQuestion: (question: string) => Promise<void>;
  refreshInterventions: () => Promise<void>;
  assessLearningStyle: (responses: Record<string, number>) => Promise<LearningStyleProfile>;
}

export const useMentorship = (userId: string): UseMentorshipReturn => {
  const [context, setContext] = useState<MentorshipContext | null>(null);
  const [learningProfile, setLearningProfile] = useState<LearningStyleProfile | null>(null);
  const [interventions, setInterventions] = useState<ProactiveIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    try {
      const data = await mentorshipService.getMentorshipContext(userId);
      setContext(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentorship context');
      console.error('Failed to load context:', err);
    }
  }, [userId]);

  const loadLearningProfile = useCallback(async () => {
    try {
      const data = await mentorshipService.getLearningStyle(userId);
      setLearningProfile(data);
    } catch (err) {
      // Learning profile might not exist yet, that's okay
      console.log('No learning profile found:', err);
    }
  }, [userId]);

  const loadInterventions = useCallback(async () => {
    try {
      const data = await mentorshipService.getProactiveInterventions(userId);
      setInterventions(data as ProactiveIntervention[]);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadContext(),
        loadLearningProfile(),
        loadInterventions()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentorship data');
    } finally {
      setLoading(false);
    }
  }, [loadContext, loadLearningProfile, loadInterventions]);

  const chatWithMentor = useCallback(async (message: string, projectContext?: any): Promise<MentorResponse> => {
    try {
      const response = await mentorshipService.chatWithMentor(userId, message, projectContext);
      
      // Refresh context after interaction
      await loadContext();
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to chat with mentor');
      throw err;
    }
  }, [userId, loadContext]);

  const updateContext = useCallback(async (updates: Partial<MentorshipContext>) => {
    try {
      const updatedContext = await mentorshipService.updateMentorshipContext(userId, updates);
      setContext(updatedContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update context');
      throw err;
    }
  }, [userId]);

  const updateProjectContext = useCallback(async (
    projectId: string, 
    projectName: string, 
    currentFile: string, 
    language: string
  ) => {
    try {
      await mentorshipService.updateProjectContext(userId, projectId, projectName, currentFile, language);
      await loadContext(); // Refresh context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project context');
      throw err;
    }
  }, [userId, loadContext]);

  const recordError = useCallback(async (error: string) => {
    try {
      await mentorshipService.recordError(userId, error);
      await loadContext(); // Refresh context
    } catch (err) {
      console.error('Failed to record error:', err);
    }
  }, [userId, loadContext]);

  const recordQuestion = useCallback(async (question: string) => {
    try {
      await mentorshipService.recordQuestion(userId, question);
      await loadContext(); // Refresh context
    } catch (err) {
      console.error('Failed to record question:', err);
    }
  }, [userId, loadContext]);

  const refreshInterventions = useCallback(async () => {
    try {
      await loadInterventions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh interventions');
    }
  }, [loadInterventions]);

  const assessLearningStyle = useCallback(async (responses: Record<string, number>): Promise<LearningStyleProfile> => {
    try {
      const profile = await mentorshipService.assessLearningStyle(userId, responses);
      setLearningProfile(profile);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assess learning style');
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  // Auto-refresh interventions every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadInterventions();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loadInterventions]);

  return {
    context,
    learningProfile,
    interventions,
    loading,
    error,
    chatWithMentor,
    updateContext,
    updateProjectContext,
    recordError,
    recordQuestion,
    refreshInterventions,
    assessLearningStyle
  };
};

export default useMentorship;
