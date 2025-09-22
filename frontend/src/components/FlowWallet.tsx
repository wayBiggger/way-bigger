"use client"
import { useEffect, useState } from 'react'
import useFlow from '@/hooks/useFlow'

export default function FlowWallet() {
  const { user, initialised, logIn, logOut } = useFlow()
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    // auto-link on login
    const link = async () => {
      if (!user?.addr) return
      try {
        setLinking(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
        await fetch(`${API_BASE_URL}/flow/wallet/link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ address: user.addr, provider: 'fcl', network: 'testnet' })
        })
      } finally {
        setLinking(false)
      }
    }
    link()
  }, [user?.addr])

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-white">
          <div className="text-sm opacity-80">Flow Wallet</div>
          <div className="font-semibold">{user?.addr ? user.addr : 'Not connected'}</div>
        </div>
        {user?.addr ? (
          <button onClick={logOut} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Disconnect</button>
        ) : (
          <button onClick={logIn} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Connect</button>
        )}
      </div>
      {linking && <div className="mt-2 text-xs text-gray-300">Linking wallet…</div>}
    </div>
  )
}


