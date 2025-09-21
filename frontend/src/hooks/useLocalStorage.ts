/**
 * useLocalStorage Hook
 * Provides a React hook for localStorage with error handling and browser compatibility
 */

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions {
  defaultValue?: any;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  onError?: (error: Error) => void;
}

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prevValue: T) => T)) => void;
  removeValue: () => void;
  isSupported: boolean;
  error: Error | null;
}

/**
 * Custom hook for localStorage with error handling and browser compatibility
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const {
    defaultValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError
  } = options;

  // Check if localStorage is supported
  const isSupported = typeof window !== 'undefined' && 'localStorage' in window;

  // Initialize state
  const [value, setValueState] = useState<T>(() => {
    if (!isSupported) {
      return defaultValue as T;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to read from localStorage');
      onError?.(err);
      return defaultValue as T;
    }
  });

  const [error, setError] = useState<Error | null>(null);

  // Set value function
  const setValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prevValue: T) => T)(value)
        : newValue;

      setValueState(valueToStore);

      if (isSupported) {
        window.localStorage.setItem(key, serialize(valueToStore));
        setError(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save to localStorage');
      setError(error);
      onError?.(error);
    }
  }, [key, serialize, value, isSupported, onError]);

  // Remove value function
  const removeValue = useCallback(() => {
    try {
      setValueState(defaultValue as T);
      
      if (isSupported) {
        window.localStorage.removeItem(key);
        setError(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove from localStorage');
      setError(error);
      onError?.(error);
    }
  }, [key, defaultValue, isSupported, onError]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    if (!isSupported) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          setValueState(newValue);
          setError(null);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to parse localStorage value');
          setError(error);
          onError?.(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, onError, isSupported]);

  return {
    value,
    setValue,
    removeValue,
    isSupported,
    error
  };
}

/**
 * Hook for managing multiple localStorage values
 */
export function useLocalStorageMulti<T extends Record<string, any>>(
  keys: (keyof T)[],
  options: UseLocalStorageOptions = {}
) {
  const results = {} as { [K in keyof T]: UseLocalStorageReturn<T[K]> };

  keys.forEach(key => {
    results[key] = useLocalStorage<T[keyof T]>(key as string, options);
  });

  return results;
}

/**
 * Hook for managing project data with auto-save
 */
export function useProjectStorage(projectId: string) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const projectData = useLocalStorage(`project_${projectId}`, {
    defaultValue: null,
    onError: (error) => {
      console.error('Project storage error:', error);
    }
  });

  const autoSave = useCallback(async (data: any) => {
    if (!projectData.isSupported) return;

    setIsAutoSaving(true);
    try {
      projectData.setValue(data);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [projectData]);

  return {
    ...projectData,
    autoSave,
    isAutoSaving,
    lastSaved
  };
}

/**
 * Hook for managing editor settings
 */
export function useEditorSettings() {
  const settings = useLocalStorage('editorSettings', {
    defaultValue: {
      theme: 'vs-dark',
      fontSize: 14,
      wordWrap: true,
      minimap: true,
      showLineNumbers: true,
      showWhitespace: false,
      tabSize: 4,
      insertSpaces: true,
      autoSave: true,
      autoSaveInterval: 30000
    },
    onError: (error) => {
      console.error('Editor settings error:', error);
    }
  });

  const updateSetting = useCallback((key: string, value: any) => {
    settings.setValue((prev: any) => ({
      ...prev,
      [key]: value
    }));
  }, [settings]);

  return {
    ...settings,
    updateSetting
  };
}

/**
 * Hook for managing recent projects
 */
export function useRecentProjects() {
  const recentProjects = useLocalStorage('recentProjects', {
    defaultValue: [] as Array<{
      id: string;
      name: string;
      lastOpened: Date;
      path: string;
    }>,
    onError: (error) => {
      console.error('Recent projects error:', error);
    }
  });

  const addRecentProject = useCallback((project: {
    id: string;
    name: string;
    path: string;
  }) => {
    const newProject = {
      ...project,
      lastOpened: new Date()
    };

    recentProjects.setValue((prev: any[]) => {
      const filtered = prev.filter(p => p.id !== project.id);
      return [newProject, ...filtered].slice(0, 10); // Keep only 10 recent projects
    });
  }, [recentProjects]);

  const removeRecentProject = useCallback((projectId: string) => {
    recentProjects.setValue((prev: any[]) => 
      prev.filter(p => p.id !== projectId)
    );
  }, [recentProjects]);

  return {
    ...recentProjects,
    addRecentProject,
    removeRecentProject
  };
}

/**
 * Hook for managing file history (undo/redo)
 */
export function useFileHistory(fileId: string, maxHistory: number = 50) {
  const history = useLocalStorage(`fileHistory_${fileId}`, {
    defaultValue: {
      past: [] as string[],
      present: '',
      future: [] as string[]
    },
    onError: (error) => {
      console.error('File history error:', error);
    }
  });

  const pushState = useCallback((content: string) => {
    if (content === (history.value as any).present) return;

    history.setValue((prev: any) => ({
      past: [...prev.past.slice(-maxHistory + 1), prev.present],
      present: content,
      future: []
    }));
  }, [history, maxHistory]);

  const undo = useCallback(() => {
    if ((history.value as any).past.length === 0) return null;

    const previous = (history.value as any).past[(history.value as any).past.length - 1];
    history.setValue((prev: any) => ({
      past: prev.past.slice(0, -1),
      present: previous,
      future: [prev.present, ...prev.future]
    }));

    return previous;
  }, [history]);

  const redo = useCallback(() => {
    if ((history.value as any).future.length === 0) return null;

    const next = (history.value as any).future[0];
    history.setValue((prev: any) => ({
      past: [...prev.past, prev.present],
      present: next,
      future: prev.future.slice(1)
    }));

    return next;
  }, [history]);

  const canUndo = (history.value as any).past.length > 0;
  const canRedo = (history.value as any).future.length > 0;

  return {
    currentContent: (history.value as any).present,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize: (history.value as any).past.length + (history.value as any).future.length
  };
}

export default useLocalStorage;
