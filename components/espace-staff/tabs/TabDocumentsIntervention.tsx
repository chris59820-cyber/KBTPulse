'use client'

import { useState } from 'react'
import { FileText, Download, Eye } from 'lucide-react'

interface TabDocumentsInterventionProps {
  user: any
}

export default function TabDocumentsIntervention({ user }: TabDocumentsInterventionProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Documents d'intervention
        </h3>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-8">
          Cette section permet d'enregistrer et gérer les documents, plans, photos, PDP des interventions.
          <br />
          Les documents sont accessibles depuis chaque page d'intervention.
        </p>
      </div>
    </div>
  )
}
