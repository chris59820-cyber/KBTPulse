'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Clock, User } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Intervention {
  id: string
  messagesIntervention: {
    id: string
    auteurId: string
    contenu: string
    lu: boolean
    createdAt: Date
  }[]
  affectationsIntervention: {
    salarie: {
      id: string
      nom: string
      prenom: string
      photoUrl: string | null
    }
  }[]
}

interface TabCommunicationProps {
  intervention: Intervention
  user: any
}

export default function TabCommunication({ intervention, user }: TabCommunicationProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(intervention.messagesIntervention)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll vers le bas
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Polling pour les nouveaux messages
    const interval = setInterval(() => {
      loadMessages()
    }, 3000) // Toutes les 3 secondes

    return () => clearInterval(interval)
  }, [])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/interventions/${intervention.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/interventions/${intervention.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenu: message,
          auteurId: user.salarieId || user.id
        })
      })

      if (response.ok) {
        setMessage('')
        loadMessages()
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAuteur = (auteurId: string) => {
    const affectation = intervention.affectationsIntervention.find(
      aff => aff.salarie.id === auteurId
    )
    if (affectation) {
      return {
        nom: `${affectation.salarie.prenom} ${affectation.salarie.nom}`,
        photoUrl: affectation.salarie.photoUrl
      }
    }
    return { nom: 'Utilisateur', photoUrl: null }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone de discussion</h3>
        <p className="text-sm text-gray-600 mb-4">
          Chat interne accessible à toutes les personnes affectées à cette intervention
        </p>
      </div>

      {/* Zone de chat */}
      <div className="card h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Aucun message. Commencez la conversation !</p>
            </div>
          ) : (
            messages.map((msg) => {
              const auteur = getAuteur(msg.auteurId)
              const isMe = (user.salarieId || user.id) === msg.auteurId

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && auteur.photoUrl && (
                      <img
                        src={auteur.photoUrl}
                        alt={auteur.nom}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    {!isMe && !auteur.photoUrl && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        isMe
                          ? 'bg-primary-100 text-gray-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-xs font-semibold mb-1 text-gray-600">{auteur.nom}</p>
                      )}
                      <p className="text-sm mb-1">{msg.contenu}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatDateTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulaire d'envoi */}
        <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t border-gray-200">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Send size={18} />
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  )
}
