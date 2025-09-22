"use client"
import { useEffect, useState } from 'react'

type FlowAsset = {
  id: string
  asset_type: string
  token_id?: string
  preview_image?: string
  metadata?: any
  created_at: string
}

export default function FlowNFTGallery() {
  const [assets, setAssets] = useState<FlowAsset[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
        const res = await fetch(`${API_BASE_URL}/flow/assets`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setAssets(Array.isArray(data) ? data : [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="glass-card p-4">
      <div className="text-white font-semibold mb-3">Your On‑Chain Achievements</div>
      {loading ? (
        <div className="text-gray-300">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map(a => (
            <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="aspect-square bg-black/40 flex items-center justify-center">
                {a.preview_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.preview_image} alt={a.metadata?.name || 'NFT'} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-sm p-3 text-center">{a.metadata?.name || 'NFT'}
                    {a.token_id ? ` #${a.token_id}` : ''}
                  </div>
                )}
              </div>
              <div className="p-3 text-gray-200 text-sm truncate">{a.metadata?.name || a.asset_type}</div>
            </div>
          ))}
          {assets.length === 0 && <div className="col-span-full text-gray-400">No assets yet.</div>}
        </div>
      )}
    </div>
  )
}


