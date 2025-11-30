'use client'

import { useState } from 'react'
import { Package, Plus, Search, ShoppingCart } from 'lucide-react'

interface TabGestionMaterielProps {
  user: any
}

export default function TabGestionMateriel({ user }: TabGestionMaterielProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion du matériel
        </h3>
        <button
          className="btn btn-primary text-sm flex items-center gap-2"
        >
          <ShoppingCart size={18} />
          Demande d'achat
        </button>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-8">
          Cette section permet de gérer les demandes d'achat ou de fourniture de matériel et le stock.
        </p>
      </div>
    </div>
  )
}
