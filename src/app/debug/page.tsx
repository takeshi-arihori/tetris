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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug</h1>
      
      <div className="mb-4">
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
      </div>
      
      <button 
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Connection
      </button>
      
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {result}
      </pre>
    </div>
  )
}