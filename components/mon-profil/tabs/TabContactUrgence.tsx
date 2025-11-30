'use client'

import { useState } from 'react'
import { Phone, Mail, User, Plus, Edit, Trash2 } from 'lucide-react'
import FormContactUrgence from './FormContactUrgence'

interface Salarie {
  id: string
  contactsUrgence: {
    id: string
    nom: string
    prenom: string
    relation: string | null
    telephone: string
    telephoneSecondaire: string | null
    email: string | null
    priorite: number
  }[]
}

interface TabContactUrgenceProps {
  salarie: Salarie
}

export default function TabContactUrgence({ salarie }: TabContactUrgenceProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return

    try {
      await fetch(`/api/mon-profil/contacts-urgence/${id}`, {
        method: 'DELETE'
      })
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Contact d'urgence</h3>
          <p className="text-sm text-gray-600 mt-1">
            Personnes à contacter en cas d'urgence avec numéros de téléphone
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedContact(null)
            setShowForm(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter un contact
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <FormContactUrgence
            salarieId={salarie.id}
            contact={selectedContact}
            onClose={() => {
              setShowForm(false)
              setSelectedContact(null)
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salarie.contactsUrgence.length === 0 ? (
          <p className="text-gray-500 text-center py-8 col-span-2">Aucun contact d'urgence</p>
        ) : (
          salarie.contactsUrgence
            .sort((a, b) => a.priorite - b.priorite)
            .map((contact) => (
              <div
                key={contact.id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <User className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {contact.prenom} {contact.nom}
                      </h4>
                      {contact.relation && (
                        <p className="text-sm text-gray-500">{contact.relation}</p>
                      )}
                      {contact.priorite === 1 && (
                        <span className="badge badge-danger text-xs mt-1">Contact principal</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedContact(contact)
                        setShowForm(true)
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <span>{contact.telephone}</span>
                  </div>
                  {contact.telephoneSecondaire && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      <span>{contact.telephoneSecondaire}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      <span>{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
