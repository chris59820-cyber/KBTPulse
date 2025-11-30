'use client'

import { useState } from 'react'
import { MapPin, Image, History, Download } from 'lucide-react'

interface TabOutilsComplementairesProps {
  user: any
}

export default function TabOutilsComplementaires({ user }: TabOutilsComplementairesProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Outils complémentaires
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <MapPin className="text-primary-600 mx-auto mb-2" size={32} />
          <h4 className="font-semibold text-gray-900 mb-1">Géolocalisation</h4>
          <p className="text-sm text-gray-600">Point GPS</p>
        </div>

        <div className="card text-center">
          <Image className="text-primary-600 mx-auto mb-2" size={32} />
          <h4 className="font-semibold text-gray-900 mb-1">Ajouter des photos</h4>
          <p className="text-sm text-gray-600">Upload de photos</p>
        </div>

        <div className="card text-center">
          <History className="text-primary-600 mx-auto mb-2" size={32} />
          <h4 className="font-semibold text-gray-900 mb-1">Historique</h4>
          <p className="text-sm text-gray-600">Interventions et affectations</p>
        </div>

        <div className="card text-center">
          <Download className="text-primary-600 mx-auto mb-2" size={32} />
          <h4 className="font-semibold text-gray-900 mb-1">Export</h4>
          <p className="text-sm text-gray-600">PDF, Excel</p>
        </div>
      </div>
    </div>
  )
}
