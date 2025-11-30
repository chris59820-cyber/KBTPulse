'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Image as ImageIcon, Calendar, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import ModalActualite from './ModalActualite'
import ModalMessageSecurite from './ModalMessageSecurite'

interface Actualite {
  id: string
  titre: string
  description: string | null
  contenu: string | null
  imageUrl: string | null
  images: string | null
  perimetreId: string | null
  publie: boolean
  datePublication: Date
  perimetre: {
    id: string
    nom: string
  } | null
}

interface Perimetre {
  id: string
  nom: string
}

interface MessageSecurite {
  id: string
  titre: string
  contenu: string
  type: string
  imageUrl: string | null
  perimetreId: string | null
  actif: boolean
  dateDebut: Date
  dateFin: Date | null
  perimetre: {
    id: string
    nom: string
  } | null
}

interface TabGestionActualitesProps {
  user: any
}

export default function TabGestionActualites({ user }: TabGestionActualitesProps) {
  const [actualites, setActualites] = useState<Actualite[]>([])
  const [messagesSecurite, setMessagesSecurite] = useState<MessageSecurite[]>([])
  const [perimetres, setPerimetres] = useState<Perimetre[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showModalSecurite, setShowModalSecurite] = useState(false)
  const [editingActualite, setEditingActualite] = useState<Actualite | null>(null)
  const [editingMessageSecurite, setEditingMessageSecurite] = useState<MessageSecurite | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [actualitesRes, messagesSecuriteRes, perimetresRes] = await Promise.all([
        fetch('/api/actualites'),
        fetch('/api/messages-securite'),
        fetch('/api/configuration/perimetres')
      ])

      if (actualitesRes.ok) {
        const data = await actualitesRes.json()
        setActualites(data)
      }

      if (messagesSecuriteRes.ok) {
        const data = await messagesSecuriteRes.json()
        setMessagesSecurite(data)
      }

      if (perimetresRes.ok) {
        const data = await perimetresRes.json()
        setPerimetres(data.filter((p: any) => p.actif))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    setEditingActualite(null)
    setShowModal(true)
  }

  const handleEdit = (actualite: Actualite) => {
    setEditingActualite(actualite)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette actualité ?')) return

    try {
      const response = await fetch(`/api/actualites/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setActualites(actualites.filter(a => a.id !== id))
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleTogglePublie = async (actualite: Actualite) => {
    try {
      const response = await fetch(`/api/actualites/${actualite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publie: !actualite.publie
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setActualites(actualites.map(a => a.id === actualite.id ? updated : a))
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const handleNewMessageSecurite = () => {
    setEditingMessageSecurite(null)
    setShowModalSecurite(true)
  }

  const handleEditMessageSecurite = (message: MessageSecurite) => {
    setEditingMessageSecurite(message)
    setShowModalSecurite(true)
  }

  const handleDeleteMessageSecurite = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message de sécurité ?')) return

    try {
      const response = await fetch(`/api/messages-securite/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessagesSecurite(messagesSecurite.filter(m => m.id !== id))
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleToggleActifMessageSecurite = async (message: MessageSecurite) => {
    try {
      const response = await fetch(`/api/messages-securite/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actif: !message.actif
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setMessagesSecurite(messagesSecurite.map(m => m.id === message.id ? updated : m))
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion des actualités de la page d'accueil
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewMessageSecurite}
            className="btn btn-warning text-sm flex items-center gap-2"
          >
            <Shield size={18} />
            Messages de sécurité
          </button>
          <button
            onClick={handleNew}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Nouvelle actualité
          </button>
        </div>
      </div>

      {/* Section Messages de sécurité */}
      <div className="card border-2 border-yellow-200 bg-yellow-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Messages de sécurité
            </h3>
          </div>
          <button
            onClick={handleNewMessageSecurite}
            className="btn btn-warning text-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Nouveau message
          </button>
        </div>

        {messagesSecurite.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">
            Aucun message de sécurité pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {messagesSecurite.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${
                  message.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' :
                  message.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                } ${!message.actif ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt={message.titre}
                      className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{message.titre}</h4>
                      {message.actif ? (
                        <span className="badge badge-success text-xs">Actif</span>
                      ) : (
                        <span className="badge badge-secondary text-xs">Inactif</span>
                      )}
                    </div>
                    <p className="text-sm mb-2">{message.contenu}</p>
                    <div className="flex items-center gap-4 text-xs opacity-75">
                      {message.perimetre && (
                        <span>Périmètre: {message.perimetre.nom}</span>
                      )}
                      {message.dateFin && (
                        <span>Jusqu'au {formatDateTime(message.dateFin)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActifMessageSecurite(message)}
                      className={`p-2 rounded-lg transition-colors ${
                        message.actif
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={message.actif ? 'Désactiver' : 'Activer'}
                    >
                      {message.actif ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleEditMessageSecurite(message)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteMessageSecurite(message.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liste des actualités */}
      {actualites.length === 0 ? (
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            Aucune actualité pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {actualites.map((actualite) => (
            <div key={actualite.id} className="card">
              <div className="flex items-start gap-4">
                {actualite.imageUrl && (
                  <img
                    src={actualite.imageUrl}
                    alt={actualite.titre}
                    className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {actualite.titre}
                        </h4>
                        {actualite.publie ? (
                          <span className="badge badge-success text-xs">
                            <Eye size={12} className="mr-1" />
                            Publiée
                          </span>
                        ) : (
                          <span className="badge badge-secondary text-xs">
                            <EyeOff size={12} className="mr-1" />
                            Brouillon
                          </span>
                        )}
                      </div>
                      
                      {actualite.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {actualite.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatDateTime(actualite.datePublication)}</span>
                        </div>
                        {actualite.perimetre && (
                          <span>Périmètre: {actualite.perimetre.nom}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublie(actualite)}
                        className={`p-2 rounded-lg transition-colors ${
                          actualite.publie
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={actualite.publie ? 'Dépublier' : 'Publier'}
                      >
                        {actualite.publie ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(actualite)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(actualite.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <ModalActualite
          actualite={editingActualite}
          perimetres={perimetres}
          onClose={() => {
            setShowModal(false)
            setEditingActualite(null)
          }}
          onSave={fetchData}
        />
      )}

      {showModalSecurite && (
        <ModalMessageSecurite
          message={editingMessageSecurite}
          perimetres={perimetres}
          onClose={() => {
            setShowModalSecurite(false)
            setEditingMessageSecurite(null)
          }}
          onSave={fetchData}
        />
      )}
    </div>
  )
}
