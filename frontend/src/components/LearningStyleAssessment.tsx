'use client';

import React, { useState, useEffect } from 'react';
import { LearningStyleQuestion, LearningStyleProfile } from '../types/mentorship';
import { mentorshipService } from '../services/mentorshipService';

interface LearningStyleAssessmentProps {
  userId: string;
  onComplete: (profile: LearningStyleProfile) => void;
  onSkip: () => void;
}

export const LearningStyleAssessment: React.FC<LearningStyleAssessmentProps> = ({
  userId,
  onComplete,
  onSkip
}) => {
  const [questions, setQuestions] = useState<LearningStyleQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await mentorshipService.getLearningStyleQuiz();
      setQuestions(data as LearningStyleQuestion[]);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const profile = await mentorshipService.assessLearningStyle(userId, responses);
      onComplete(profile);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      // Still call onComplete with a default profile
      onComplete({
        primary_style: 'mixed',
        scores: { visual: 50, auditory: 50, kinesthetic: 50, reading: 50 },
        preferences: {
          prefers_diagrams: false,
          prefers_examples: false,
          prefers_explanations: false,
          prefers_hands_on: false
        },
        detail_level: 'medium',
        explanation_style: 'mixed',
        confidence_level: 0.5,
        assessment_completed: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'visual': return 'text-blue-400';
      case 'auditory': return 'text-green-400';
      case 'kinesthetic': return 'text-orange-400';
      case 'reading': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'visual': return '👁️';
      case 'auditory': return '👂';
      case 'kinesthetic': return '✋';
      case 'reading': return '📖';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 text-center max-w-lg mx-auto">
        <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-gray-300">Loading assessment...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="glass-card p-6 text-center max-w-lg mx-auto">
        <div className="text-4xl mb-3">😞</div>
        <h3 className="text-lg font-semibold text-white mb-2">Assessment Unavailable</h3>
        <p className="text-sm text-gray-300 mb-4">We couldn't load the learning style assessment.</p>
        <button
          onClick={onSkip}
          className="glass-button-primary px-4 py-2 text-sm"
        >
          Continue Without Assessment
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentResponse = responses[question.id] || 0;

  return (
    <div className="glass-card p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🎓</div>
        <h2 className="text-2xl font-bold text-white mb-2">Learning Style Assessment</h2>
        <p className="text-sm text-gray-300">
          Help us understand how you learn best so we can personalize your mentorship experience.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(getProgress())}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{getCategoryIcon(question.category)}</span>
          <span className={`text-xs font-semibold ${getCategoryColor(question.category)}`}>
            {question.category.toUpperCase()}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-4">
          {question.question}
        </h3>

        {/* Response Scale */}
        <div className="space-y-2">
          {[
            { value: 1, label: 'Strongly Disagree', color: 'text-red-400' },
            { value: 2, label: 'Disagree', color: 'text-orange-400' },
            { value: 3, label: 'Neutral', color: 'text-yellow-400' },
            { value: 4, label: 'Agree', color: 'text-green-400' },
            { value: 5, label: 'Strongly Agree', color: 'text-blue-400' }
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                currentResponse === option.value
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.value}
                checked={currentResponse === option.value}
                onChange={() => handleResponse(question.id, option.value)}
                className="sr-only"
              />
              <div className={`w-3 h-3 rounded-full border-2 ${
                currentResponse === option.value
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-400'
              }`}>
                {currentResponse === option.value && (
                  <div className="w-1 h-1 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <span className={`text-sm font-medium ${option.color}`}>
                {option.value}
              </span>
              <span className="text-sm text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="glass-button px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="glass-button px-4 py-2 text-sm"
          >
            Skip Assessment
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentResponse === 0 || isSubmitting}
            className="glass-button-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                Analyzing...
              </div>
            ) : currentQuestion === questions.length - 1 ? (
              'Complete Assessment'
            ) : (
              'Next Question'
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong>Tip:</strong> There are no right or wrong answers. Choose the option that best describes your learning preferences. 
          This helps us tailor your mentorship experience to your unique learning style.
        </p>
      </div>
    </div>
  );
};

export default LearningStyleAssessment;
