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
      
      // 有効なメールアドレス形式を使用
      const testEmail = `test${Date.now()}@gmail.com`
      const testPassword = 'testPassword123!'
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
      
      // トリガー関数の存在確認
      const { data, error } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'handle_new_user')
      
      if (error) {
        setResult(`Trigger Check Error: ${error.message}\nCode: ${error.code}`)
      } else {
        setResult(`Trigger Function Check: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (err) {
      setResult(`Trigger Check Exception: ${JSON.stringify(err, null, 2)}`)
    }
  }

  const checkUsers = async () => {
    try {
      const supabase = createClient()
      
      // 現在のユーザー状態を確認
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setResult(`User Check Error: ${userError.message}`)
        return
      }
      
      // プロファイルを確認
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)
      
      if (profileError) {
        setResult(`Profile Check Error: ${profileError.message}`)
        return
      }
      
      setResult(`Current User: ${JSON.stringify(user, null, 2)}\n\nProfiles: ${JSON.stringify(profiles, null, 2)}`)
    } catch (err) {
      setResult(`Check Users Exception: ${JSON.stringify(err, null, 2)}`)
    }
  }

  const manualProfileCreation = async () => {
    try {
      const supabase = createClient()
      
      // 正しいUUID形式を生成
      const testUserId = crypto.randomUUID()
      const testUsername = 'manual_test_' + Date.now()
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          { id: testUserId, username: testUsername }
        ])
        .select()
      
      if (error) {
        setResult(`Manual Profile Creation Error: ${error.message}\nCode: ${error.code}`)
      } else {
        setResult(`Manual Profile Creation Success: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (err) {
      setResult(`Manual Profile Exception: ${JSON.stringify(err, null, 2)}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug</h1>
      
      <div className="mb-4">
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
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
        
        <button 
          onClick={checkUsers}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Check Current Users
        </button>
        
        <button 
          onClick={manualProfileCreation}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Manual Profile Creation
        </button>
      </div>
      
      <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
        {result}
      </pre>
    </div>
  )
}