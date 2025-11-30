'use client'

import { useState } from 'react'
import { Briefcase, Plus, Eye, Search } from 'lucide-react'
import Link from 'next/link'

interface TabGestionInterventionsProps {
  user: any
}

export default function TabGestionInterventions({ user }: TabGestionInterventionsProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion des interventions
        </h3>
        <Link
          href="/interventions"
          className="btn btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Créer une intervention
        </Link>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-8">
          Cette section permet de créer, modifier et valider les avancements des interventions.
          <br />
          <Link href="/interventions" className="text-primary-600 hover:underline mt-2 inline-block">
            Accéder aux interventions →
          </Link>
        </p>
      </div>
    </div>
  )
}
