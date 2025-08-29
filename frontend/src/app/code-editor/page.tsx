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
}

type ExecutionResult = {
  success: boolean
  output: string
  error?: string
  execution_time?: number
  memory_used?: string
}

const SUPPORTED_LANGUAGES: Language[] = [
  { name: 'Python', value: 'python', extension: '.py' },
  { name: 'JavaScript', value: 'javascript', extension: '.js' },
  { name: 'Java', value: 'java', extension: '.java' },
  { name: 'C++', value: 'cpp', extension: '.cpp' }
]

export default function CodeEditorPage() {
  const [isDark, setIsDark] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python')
  const [code, setCode] = useState<string>('')
  const [inputData, setInputData] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [showInput, setShowInput] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    // Load template for selected language
    loadTemplate(selectedLanguage)
  }, [selectedLanguage])

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
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/code-editor/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          input_data: inputData
        }),
      })

      const result: ExecutionResult = await response.json()
      setExecutionResult(result)

      if (result.success) {
        setOutput(result.output || 'Code executed successfully!')
      } else {
        setOutput(`Error: ${result.error || 'Unknown error occurred'}`)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to execute code'}`)
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
          filename: `code${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.extension}`
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Code Editor</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Write, run, and test your code in multiple programming languages
          </p>
        </div>

        {/* Language Selection and Controls */}
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-md font-medium transition-colors"
              >
                {isExecuting ? 'Running...' : '▶ Run Code'}
              </button>

              <button
                onClick={saveCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                💾 Save
              </button>

              <button
                onClick={clearCode}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
              >
                🗑️ Clear
              </button>

              <button
                onClick={() => setShowInput(!showInput)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showInput 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                📝 Input
              </button>
            </div>

            {isSaved && (
              <span className="text-green-600 font-medium">✓ Saved!</span>
            )}
          </div>

          {/* Input Data Section */}
          {showInput && (
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Input Data (for stdin)
              </label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Enter input data that your program will read from stdin..."
                className={`w-full h-20 p-3 border rounded-md resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className={`rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Code Editor</span>
                <span className="text-sm opacity-70">{selectedLanguage.toUpperCase()}</span>
              </div>
            </div>
            <div className="h-96">
              <MonacoEditor
                height="100%"
                language={selectedLanguage}
                theme={isDark ? 'vs-dark' : 'light'}
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                }}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className={`rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Output</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-sm px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => setOutput('')}
                    className="text-sm px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <pre className={`whitespace-pre-wrap font-mono text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {output || 'Output will appear here...'}
              </pre>
              
              {executionResult && (
                <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-700">
                  <div className="text-sm">
                    <div className="flex items-center gap-4">
                      <span>⏱️ Time: {executionResult.execution_time?.toFixed(3)}s</span>
                      {executionResult.memory_used && (
                        <span>💾 Memory: {executionResult.memory_used}</span>
                      )}
                    </div>
                    <div className={`mt-2 ${executionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {executionResult.success ? '✅ Execution successful' : '❌ Execution failed'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className="font-semibold mb-2">Features:</h3>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Syntax highlighting and IntelliSense for all supported languages</li>
            <li>• Safe code execution in isolated Docker containers</li>
            <li>• Support for Python, JavaScript, Java, and C++</li>
            <li>• Input/output handling for interactive programs</li>
            <li>• Code templates and examples</li>
            <li>• Save and load your code snippets</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
