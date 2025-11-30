'use client'

import { useState } from 'react'
import { MessageCircle, Send, Users } from 'lucide-react'

interface TabCommunicationProps {
  user: any
}

export default function TabCommunication({ user }: TabCommunicationProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Communication
        </h3>
        <div className="flex items-center gap-2">
          <select className="input text-sm">
            <option value="">Envoyer à un groupe</option>
            <option value="salarie">Salarié</option>
            <option value="secteur">Secteur</option>
            <option value="rdc">RDC</option>
            <option value="intervention">Intervention</option>
            <option value="perimetre">Périmètre</option>
          </select>
          <button
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Send size={18} />
            Envoyer
          </button>
        </div>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-8">
          Envoi de messages internes selon le groupe : Salarié, Secteur, RDC, Intervention, Périmètre.
        </p>
      </div>
    </div>
  )
}
