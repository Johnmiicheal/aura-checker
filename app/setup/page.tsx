'use client'

import { setupDatabase } from '@/app/actions/setup'
import { useState } from 'react'

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSetup = async () => {
    try {
      setStatus('loading')
      const result = await setupDatabase()
      setStatus('success')
      setMessage(result.message)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Setup failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-medium text-center">Database Setup</h1>
        
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleSetup}
            disabled={status === 'loading' || status === 'success'}
            className={`w-full h-12 rounded-xl text-white transition-colors ${
              status === 'loading' 
                ? 'bg-gray-500 cursor-not-allowed'
                : status === 'success'
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {status === 'loading' 
              ? 'Setting up...' 
              : status === 'success'
              ? 'Setup Complete'
              : 'Setup Database'}
          </button>

          {message && (
            <p className={`text-sm ${
              status === 'error' ? 'text-red-500' : 'text-green-500'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 