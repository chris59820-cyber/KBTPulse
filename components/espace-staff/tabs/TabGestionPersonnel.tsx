'use client'

import { useState } from 'react'
import { Users, User, Eye, Package, Truck } from 'lucide-react'
import Link from 'next/link'

interface TabGestionPersonnelProps {
  user: any
}

export default function TabGestionPersonnel({ user }: TabGestionPersonnelProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion du personnel
        </h3>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-8">
          Cette section permet d'accéder aux profils salariés et d'attribuer des outils, matériel et véhicules.
          <br />
          <Link href="/ouvriers" className="text-primary-600 hover:underline mt-2 inline-block">
            Accéder à la gestion des ouvriers →
          </Link>
        </p>
      </div>
    </div>
  )
}
