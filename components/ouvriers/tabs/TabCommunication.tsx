'use client'

import { useState } from 'react'
import { Mail, Eye, EyeOff, Calendar, User, Plus } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Ouvrier {
  id: string
}

interface TabCommunicationProps {
  ouvrier: Ouvrier
}

interface Publication {
  id: string
  titre: string
  contenu: string
  imageUrl: string | null
  datePublication: Date
  auteurId: string | null
  profilsAutorises: string | null
  publique: boolean
}

export default function TabCommunication({ ouvrier }: TabCommunicationProps) {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)

  // Simuler le chargement des publications
  // En production, récupérer depuis l'API
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Publications</h4>
          <p className="text-sm text-gray-600 mt-1">
            Gestion des publications par les profils autorisés (RDC, CAFF, AUTRE)
          </p>
        </div>
        <button className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} />
          Nouvelle publication
        </button>
      </div>

      <div className="space-y-4">
        {publications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Mail className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-2">Aucune publication</p>
            <p className="text-sm text-gray-400">
              Les publications créées par les profils autorisés apparaîtront ici
            </p>
          </div>
        ) : (
          publications.map((publication) => (
            <div
              key={publication.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {publication.imageUrl && (
                <img
                  src={publication.imageUrl}
                  alt={publication.titre}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-lg font-semibold text-gray-900">{publication.titre}</h5>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {publication.publique ? (
                    <span className="badge badge-info flex items-center gap-1">
                      <Eye size={12} />
                      Publique
                    </span>
                  ) : (
                    <span className="badge badge-secondary flex items-center gap-1">
                      <EyeOff size={12} />
                      Restreinte
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{publication.contenu}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDateTime(publication.datePublication)}</span>
                </div>
                {publication.profilsAutorises && (
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>Profils: {publication.profilsAutorises}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">Droits d'accès</h5>
        <p className="text-sm text-blue-700">
          Les publications peuvent être créées par les profils autorisés : RDC, CAFF et AUTRE.
          Les publications publiques sont visibles par tous les ouvriers, 
          les publications restreintes sont visibles uniquement selon les profils définis.
        </p>
      </div>
    </div>
  )
}
