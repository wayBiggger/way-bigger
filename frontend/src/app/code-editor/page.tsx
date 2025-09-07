'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
)

type Language = {
  name: string
  value: string
  extension: string
  icon: string
}

type File = {
  id: string
  name: string
  content: string
  language: string
  isDirty: boolean
}

type ExecutionResult = {
  success: boolean
  output: string
  error?: string
  execution_time?: number
  memory_used?: string
}

const SUPPORTED_LANGUAGES: Language[] = [
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
]

const THEMES = [
  { name: 'VS Code Dark', value: 'vs-dark' },
  { name: 'VS Code Light', value: 'light' },
  { name: 'Monokai', value: 'monokai' },
  { name: 'GitHub Dark', value: 'github-dark' },
  { name: 'GitHub Light', value: 'github-light' },
  { name: 'Solarized Dark', value: 'solarized-dark' },
  { name: 'Solarized Light', value: 'solarized-light' }
]

export default function CodeEditorPage() {
  const [isDark, setIsDark] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<string>('vs-dark')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python')
  const [code, setCode] = useState<string>('')
  const [inputData, setInputData] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [showInput, setShowInput] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [projectContext, setProjectContext] = useState<{ id: string; title?: string } | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showTerminal, setShowTerminal] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [minimap, setMinimap] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showWhitespace, setShowWhitespace] = useState(false)
  const [tabSize, setTabSize] = useState(4)
  const [insertSpaces, setInsertSpaces] = useState(true)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
    
    // Initialize with a default file
    const defaultFile: File = {
      id: '1',
      name: 'main.py',
      content: '# Welcome to the Code Editor!\nprint("Hello, World!")',
      language: 'python',
      isDirty: false
    }
    setFiles([defaultFile])
    setActiveFileId('1')
    setCode(defaultFile.content)
  }, [])

  useEffect(() => {
    // Check for project context in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const projectId = urlParams.get('project')
    
    if (projectId) {
      setProjectContext({ id: projectId })
      console.log('Project context:', projectId)
    }
  }, [])

  useEffect(() => {
    // Update code when active file changes
    const activeFile = files.find(f => f.id === activeFileId)
    if (activeFile) {
      setCode(activeFile.content)
      setSelectedLanguage(activeFile.language)
    }
  }, [activeFileId, files])

  // File management functions
  const createNewFile = () => {
    const newFile: File = {
      id: Date.now().toString(),
      name: `untitled${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.extension || '.txt'}`,
      content: '',
      language: selectedLanguage,
      isDirty: false
    }
    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
  }

  const saveFile = (fileId: string) => {
    setFiles(files.map(f => 
      f.id === fileId 
        ? { ...f, content: code, isDirty: false }
        : f
    ))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const closeFile = (fileId: string) => {
    const newFiles = files.filter(f => f.id !== fileId)
    setFiles(newFiles)
    
    if (activeFileId === fileId) {
      if (newFiles.length > 0) {
        setActiveFileId(newFiles[0].id)
      } else {
        setActiveFileId(null)
        setCode('')
      }
    }
  }

  const updateActiveFile = (content: string) => {
    if (activeFileId) {
      setFiles(files.map(f => 
        f.id === activeFileId 
          ? { ...f, content, isDirty: true }
          : f
      ))
    }
    setCode(content)
  }

  const loadTemplate = async (language: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/code-editor/templates/${language}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (response.ok) {
        const template = await response.json()
        setCode(template.code || '')
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    }
  }

  const executeCode = async () => {
    if (!code.trim()) {
      setOutput('Please enter some code to execute.')
      return
    }

    setIsExecuting(true)
    setOutput('Executing code...')
    setExecutionResult(null)

    try {
      // Simulate code execution with mock results
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)) // 1-3 second delay
      
      const mockResults: { [key: string]: string } = {
        python: `Hello, World!
Welcome to Python!
Code executed successfully in 1.234 seconds.`,
        javascript: `Hello, World!
Welcome to JavaScript!
Code executed successfully in 0.856 seconds.`,
        typescript: `Hello, World!
Welcome to TypeScript!
Code executed successfully in 1.123 seconds.`,
        java: `Hello, World!
Welcome to Java!
Code executed successfully in 2.456 seconds.`,
        cpp: `Hello, World!
Welcome to C++!
Code executed successfully in 0.789 seconds.`,
        csharp: `Hello, World!
Welcome to C#!
Code executed successfully in 1.567 seconds.`,
        go: `Hello, World!
Welcome to Go!
Code executed successfully in 0.345 seconds.`,
        rust: `Hello, World!
Welcome to Rust!
Code executed successfully in 0.678 seconds.`,
        html: `<!DOCTYPE html>
<html>
<head><title>My Page</title></head>
<body><h1>Hello, World!</h1></body>
</html>
HTML rendered successfully!`,
        css: `body {
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
}
CSS compiled successfully!`,
        json: `{
  "message": "Hello, World!",
  "status": "success",
  "timestamp": "${new Date().toISOString()}"
}
JSON parsed successfully!`,
        markdown: `# Hello, World!

Welcome to **Markdown**!

- This is a list item
- Another list item

> This is a blockquote

Markdown rendered successfully!`
      }

      const output = mockResults[selectedLanguage] || 'Code executed successfully!'
      const executionTime = 0.5 + Math.random() * 2 // 0.5-2.5 seconds
      
      setOutput(output)
      setExecutionResult({
        success: true,
        output: output,
        execution_time: executionTime,
        memory_used: `${Math.floor(Math.random() * 50 + 10)}MB`
      })
      
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to execute code'}`)
      setExecutionResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        execution_time: 0
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const saveCode = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/code-editor/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          filename: `code${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.extension}`,
          project_id: projectContext?.id || null
        }),
      })

      if (response.ok) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save code:', error)
    }
  }

  const clearCode = () => {
    setCode('')
    setOutput('')
    setExecutionResult(null)
    setInputData('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Monaco Editor options - VS Code like
  const getMonacoOptions = () => ({
    minimap: { enabled: minimap },
    fontSize: fontSize,
    lineNumbers: showLineNumbers ? 'on' as const : 'off' as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: wordWrap ? 'on' as const : 'off' as const,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    quickSuggestionsDelay: 100,
    // Enable all VS Code features
    copyWithSyntaxHighlighting: true,
    contextmenu: true,
    folding: true,
    foldingStrategy: 'indentation' as const,
    showFoldingControls: 'always' as const,
    dragAndDrop: true,
    // Enable find and replace
    find: {
      addExtraSpaceOnTop: true,
      autoFindInSelection: 'multiline' as const,
      caseSensitive: 'off' as const,
      findInComments: true,
      findInSelection: false,
      findInStrings: true,
      matchAccent: false,
      matchCase: false,
      matchWholeWord: false,
      regex: false,
      replaceAll: true,
      replaceInComments: true,
      replaceInSelection: false,
      replaceInStrings: true,
      searchScope: null,
      seedSearchStringFromSelection: 'always' as const,
      showExtraSpaceOnTop: true,
      showSearchScope: true,
      useGlobalFindAndReplace: true,
      wholeWord: false
    },
    // Tab settings
    tabSize: tabSize,
    insertSpaces: insertSpaces,
    // Whitespace settings
    renderWhitespace: showWhitespace ? 'all' as const : 'none' as const,
    // Bracket matching
    matchBrackets: 'always' as const,
    // Auto closing
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    autoSurround: 'languageDefined' as const,
    // Indentation
    indentSize: tabSize,
    // Cursor settings
    cursorBlinking: 'blink' as const,
    cursorSmoothCaretAnimation: true,
    cursorStyle: 'line' as const,
    // Selection
    selectOnLineNumbers: true,
    // Accessibility
    accessibilitySupport: 'auto' as const,
    // Smooth scrolling
    smoothScrolling: true,
    // Mouse wheel
    mouseWheelZoom: true,
    // Multi cursor
    multiCursorModifier: 'ctrlCmd' as const,
    // Parameter hints
    parameterHints: {
      enabled: true,
      cycle: true
    },
    // Hover
    hover: {
      enabled: true,
      delay: 300
    },
    // Links
    links: true,
    // Color decorators
    colorDecorators: true,
    // Lightbulb
    lightbulb: {
      enabled: true
    },
    // Code lens
    codeLens: true,
    // Breadcrumbs
    breadcrumbs: {
      enabled: true
    }
  })

  // Handle Monaco Editor beforeMount
  const handleBeforeMount = (monaco: any) => {
    // Configure themes and languages
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#aeafad',
        'editorWhitespace.foreground': '#404040',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorLineHighlight.background': '#2a2d2e',
        'editorLineHighlight.border': '#282828',
        'editorBracketMatch.background': '#0e639c50',
        'editorBracketMatch.border': '#888888',
        'editorBracketHighlight.foreground1': '#ffd700',
        'editorBracketHighlight.foreground2': '#da70d6',
        'editorBracketHighlight.foreground3': '#87ceeb',
        'editorBracketHighlight.foreground4': '#ffd700',
        'editorBracketHighlight.foreground5': '#da70d6',
        'editorBracketHighlight.foreground6': '#87ceeb',
        'editorBracketHighlight.unexpectedBracket.foreground': '#ff0000',
        'editorBracketPairGuide.background1': '#ffd700',
        'editorBracketPairGuide.background2': '#da70d6',
        'editorBracketPairGuide.background3': '#87ceeb',
        'editorBracketPairGuide.background4': '#ffd700',
        'editorBracketPairGuide.background5': '#da70d6',
        'editorBracketPairGuide.background6': '#87ceeb',
        'editorBracketPairGuide.activeBackground1': '#ffd700',
        'editorBracketPairGuide.activeBackground2': '#da70d6',
        'editorBracketPairGuide.activeBackground3': '#87ceeb',
        'editorBracketPairGuide.activeBackground4': '#ffd700',
        'editorBracketPairGuide.activeBackground5': '#da70d6',
        'editorBracketPairGuide.activeBackground6': '#87ceeb',
        'editorBracketPairGuide.unexpectedBracket.background': '#ff0000',
        'editorUnnecessaryCode.opacity': '#000000aa',
        'editorGhostText.foreground': '#6a9955aa',
        'editorOverviewRuler.border': '#7c7c7c',
        'editorOverviewRuler.findMatchForeground': '#d18616',
        'editorOverviewRuler.rangeHighlightForeground': '#007acc',
        'editorOverviewRuler.selectionForeground': '#a9a9a9',
        'editorOverviewRuler.wordHighlightForeground': '#a9a9a9',
        'editorOverviewRuler.bracketMatchForeground': '#a9a9a9',
        'editorOverviewRuler.errorForeground': '#f48771',
        'editorOverviewRuler.warningForeground': '#cca700',
        'editorOverviewRuler.infoForeground': '#75beff',
        'editorError.foreground': '#f48771',
        'editorError.border': '#f48771',
        'editorWarning.foreground': '#cca700',
        'editorWarning.border': '#cca700',
        'editorInfo.foreground': '#75beff',
        'editorInfo.border': '#75beff',
        'editorHint.foreground': '#eeeeee',
        'editorHint.border': '#eeeeee',
        'editorGutter.background': '#1e1e1e',
        'editorUnnecessaryCode.border': '#cccccc',
        'editorBracketHighlight.unexpectedBracket.border': '#ff0000',
        'editorBracketPairGuide.unexpectedBracket.border': '#ff0000',
        'editorUnnecessaryCode.opacity': '#000000aa',
        'editorGhostText.foreground': '#6a9955aa',
        'editorOverviewRuler.border': '#7c7c7c',
        'editorOverviewRuler.findMatchForeground': '#d18616',
        'editorOverviewRuler.rangeHighlightForeground': '#007acc',
        'editorOverviewRuler.selectionForeground': '#a9a9a9',
        'editorOverviewRuler.wordHighlightForeground': '#a9a9a9',
        'editorOverviewRuler.bracketMatchForeground': '#a9a9a9',
        'editorOverviewRuler.errorForeground': '#f48771',
        'editorOverviewRuler.warningForeground': '#cca700',
        'editorOverviewRuler.infoForeground': '#75beff',
        'editorError.foreground': '#f48771',
        'editorError.border': '#f48771',
        'editorWarning.foreground': '#cca700',
        'editorWarning.border': '#cca700',
        'editorInfo.foreground': '#75beff',
        'editorInfo.border': '#75beff',
        'editorHint.foreground': '#eeeeee',
        'editorHint.border': '#eeeeee',
        'editorGutter.background': '#1e1e1e',
        'editorUnnecessaryCode.border': '#cccccc',
        'editorBracketHighlight.unexpectedBracket.border': '#ff0000',
        'editorBracketPairGuide.unexpectedBracket.border': '#ff0000'
      }
    })
  }

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Enable all standard VS Code features
    editor.focus()
    
    // Add custom keybindings
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        if (activeFileId) {
          saveFile(activeFileId)
        }
      }
    })

    editor.addAction({
      id: 'new-file',
      label: 'New File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN],
      run: () => {
        createNewFile()
      }
    })

    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        executeCode()
      }
    })
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Professional Top Bar */}
      <div className={`${isDark ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-200'} px-6 py-3 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Code Editor</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Toggle Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-500">Theme:</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {THEMES.map(theme => (
                  <option key={theme.value} value={theme.value}>{theme.name}</option>
                ))}
              </select>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-500">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.icon} {lang.name}</option>
                ))}
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={createNewFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                title="New File (Ctrl+N)"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
              <button
                onClick={() => activeFileId && saveFile(activeFileId)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                title="Save (Ctrl+S)"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save
              </button>
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                title="Run Code (Ctrl+Enter)"
              >
                {isExecuting ? (
                  <>
                    <svg className="w-4 h-4 inline mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Run
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Professional Sidebar */}
        {showSidebar && (
          <div className={`w-72 ${isDark ? 'bg-slate-800 border-r border-slate-700' : 'bg-white border-r border-slate-200'} flex flex-col shadow-lg`}>
            {/* File Explorer */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Explorer</h3>
                <button
                  onClick={createNewFile}
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  title="New File"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeFileId === file.id
                        ? isDark ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        : isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {SUPPORTED_LANGUAGES.find(l => l.value === file.language)?.icon || '📄'}
                      </span>
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      {file.isDirty && <span className="text-orange-500 text-lg">●</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeFile(file.id)
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Settings Panel */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex-1">
              <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Editor Settings</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block mb-2 text-slate-600 dark:text-slate-400 font-medium">Font Size</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-8">{fontSize}px</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="wordWrap" className="text-slate-600 dark:text-slate-400 font-medium">Word Wrap</label>
                    <input
                      type="checkbox"
                      id="wordWrap"
                      checked={wordWrap}
                      onChange={(e) => setWordWrap(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="minimap" className="text-slate-600 dark:text-slate-400 font-medium">Minimap</label>
                    <input
                      type="checkbox"
                      id="minimap"
                      checked={minimap}
                      onChange={(e) => setMinimap(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="lineNumbers" className="text-slate-600 dark:text-slate-400 font-medium">Line Numbers</label>
                    <input
                      type="checkbox"
                      id="lineNumbers"
                      checked={showLineNumbers}
                      onChange={(e) => setShowLineNumbers(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="whitespace" className="text-slate-600 dark:text-slate-400 font-medium">Show Whitespace</label>
                    <input
                      type="checkbox"
                      id="whitespace"
                      checked={showWhitespace}
                      onChange={(e) => setShowWhitespace(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Professional Tab Bar */}
          <div className={`${isDark ? 'bg-slate-800 border-b border-slate-700' : 'bg-slate-50 border-b border-slate-200'} flex shadow-sm`}>
            {files.map(file => (
              <div
                key={file.id}
                className={`flex items-center px-6 py-3 border-r border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-200 ${
                  activeFileId === file.id
                    ? isDark ? 'bg-slate-900 text-white border-b-2 border-blue-500' : 'bg-white text-slate-900 border-b-2 border-blue-500'
                    : isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <span className="mr-3 text-lg">
                  {SUPPORTED_LANGUAGES.find(l => l.value === file.language)?.icon || '📄'}
                </span>
                <span className="text-sm font-medium">{file.name}</span>
                {file.isDirty && <span className="ml-3 text-orange-500 text-lg">●</span>}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeFile(file.id)
                  }}
                  className="ml-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Editor and Output */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <MonacoEditor
                  height="100%"
                  language={selectedLanguage}
                  theme={selectedTheme}
                  value={code}
                  onChange={updateActiveFile}
                  options={getMonacoOptions()}
                  beforeMount={handleBeforeMount}
                  onMount={handleEditorDidMount}
                />
              </div>
            </div>

            {/* Professional Output Panel */}
            <div className={`w-96 ${isDark ? 'bg-slate-800 border-l border-slate-700' : 'bg-white border-l border-slate-200'} flex flex-col shadow-lg`}>
              <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900`}>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Output</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={() => setOutput('')}
                    className="px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-auto bg-slate-50 dark:bg-slate-900">
                <pre className={`whitespace-pre-wrap font-mono text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {output || (
                    <span className="text-slate-500 dark:text-slate-400 italic">
                      Click "Run" to execute your code and see the output here...
                    </span>
                  )}
                </pre>
                
                {executionResult && (
                  <div className={`mt-6 p-4 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'} shadow-sm`}>
                    <div className="text-sm">
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-slate-600 dark:text-slate-400">Time: {executionResult.execution_time?.toFixed(3)}s</span>
                        </div>
                        {executionResult.memory_used && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                            <span className="text-slate-600 dark:text-slate-400">Memory: {executionResult.memory_used}</span>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 ${executionResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                        {executionResult.success ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Execution successful</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="font-medium">Execution failed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
