'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Clock, User } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Salarie {
  id: string
}

interface TabMessagerieProps {
  salarie: Salarie
  userId: string
}

interface Conversation {
  id: string
  nom: string | null
  type: string
  messages: {
    id: string
    contenu: string
    createdAt: Date
    userId: string | null
    salarieId: string | null
  }[]
}

export default function TabMessagerie({ salarie, userId }: TabMessagerieProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
      // Polling pour les nouveaux messages
      const interval = setInterval(() => {
        loadMessages(selectedConversation)
      }, 5000) // Toutes les 5 secondes
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations?userId=' + userId)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
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
    if (!message.trim() || !selectedConversation) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          contenu: message
        })
      })

      if (response.ok) {
        setMessage('')
        loadMessages(selectedConversation)
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Messagerie interne</h3>
          <p className="text-sm text-gray-600 mt-1">
            Accès à la messagerie interne en fonction de votre identifiant personnel
          </p>
        </div>
        <Link
          href="/messagerie"
          className="btn btn-primary text-sm flex items-center gap-2"
        >
          <MessageCircle size={18} />
          Ouvrir la messagerie complète
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <div className="card">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Conversations</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">Aucune conversation</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation === conv.id
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle size={16} className="text-gray-400" />
                        <p className="font-medium text-gray-900 text-sm">
                          {conv.nom || `Conversation ${conv.type}`}
                        </p>
                      </div>
                      {conv.messages.length > 0 && (
                        <p className="text-xs text-gray-500 truncate">
                          {conv.messages[0].contenu}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Zone de chat */}
          <div className="lg:col-span-2">
            <div className="card h-[600px] flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900">
                      {currentConversation?.nom || 'Conversation'}
                    </h4>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 text-sm">Aucun message</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.userId === userId
                                ? 'bg-primary-100 text-gray-900'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm mb-1">{msg.contenu}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{formatDateTime(msg.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Formulaire d'envoi */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 input"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Send size={18} />
                      Envoyer
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
