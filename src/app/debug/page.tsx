'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [result, setResult] = useState<string>('')

  const testConnection = async () => {
    try {
      const supabase = createClient()
      
      // 基本的な接続テスト
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (error) {
        setResult(`Error: ${error.message}\nCode: ${error.code}\nHint: ${error.hint}`)
      } else {
        setResult(`Success: Connection established!\nData: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (err) {
      setResult(`Exception: ${JSON.stringify(err, null, 2)}`)
    }
  }

  const testUserRegistration = async () => {
    try {
      const supabase = createClient()
      
      // テストユーザーの登録を試行
      const testEmail = `test_${Date.now()}@example.com`
      const testPassword = 'testPassword123'
      const testUsername = `test_user_${Date.now()}`
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            username: testUsername,
          },
        },
      })
      
      if (error) {
        setResult(`Registration Error: ${error.message}\nCode: ${error.code}\nStatus: ${error.status}`)
      } else {
        setResult(`Registration Success!\nUser: ${JSON.stringify(data.user, null, 2)}`)
      }
    } catch (err) {
      setResult(`Registration Exception: ${JSON.stringify(err, null, 2)}`)
    }
  }

  const testDatabaseTrigger = async () => {
    try {
      const supabase = createClient()
      
      // データベースの関数を直接テスト
      const { data, error } = await supabase.rpc('handle_new_user')
      
      if (error) {
        setResult(`Trigger Test Error: ${error.message}\nCode: ${error.code}`)
      } else {
        setResult(`Trigger Test Success: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (err) {
      setResult(`Trigger Test Exception: ${JSON.stringify(err, null, 2)}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug</h1>
      
      <div className="mb-4">
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
      </div>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
        
        <button 
          onClick={testUserRegistration}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test User Registration
        </button>
        
        <button 
          onClick={testDatabaseTrigger}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Database Trigger
        </button>
      </div>
      
      <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
        {result}
      </pre>
    </div>
  )
}