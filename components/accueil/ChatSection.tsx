'use client'

import { useState } from 'react'
import { MessageCircle, Send, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Conversation {
  id: string
  nom: string | null
  type: string
  participants: any[]
  messages: {
    id: string
    contenu: string
    createdAt: Date
    userId: string | null
  }[]
}

interface ChatSectionProps {
  conversations: Conversation[]
  userId: string
}

export default function ChatSection({ conversations, userId }: ChatSectionProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  )
  const [message, setMessage] = useState('')

  const currentConversation = conversations.find(c => c.id === selectedConversation)
  const messages = currentConversation?.messages || []

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          contenu: message
        })
      })
      setMessage('')
      // Rafraîchir les messages (à implémenter avec un système de polling ou WebSocket)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  return (
    <div className="card h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Messagerie</h2>
        <MessageCircle className="text-primary-600" size={24} />
      </div>

      {/* Liste déroulante des conversations */}
      <div className="mb-4">
        <select
          value={selectedConversation || ''}
          onChange={(e) => setSelectedConversation(e.target.value)}
          className="w-full input"
        >
          {conversations.length === 0 ? (
            <option value="">Aucune conversation</option>
          ) : (
            conversations.map((conv) => (
              <option key={conv.id} value={conv.id}>
                {conv.nom || `Conversation ${conv.type}`}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Zone d'affichage des messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun message</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.userId === userId
                  ? 'bg-primary-100 ml-auto max-w-[80%]'
                  : 'bg-white mr-auto max-w-[80%]'
              }`}
            >
              <p className="text-sm text-gray-900">{msg.contenu}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>{formatDateTime(msg.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Zone de saisie */}
      {selectedConversation && (
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage()
              }
            }}
            placeholder="Tapez votre message..."
            className="flex-1 input"
          />
          <button
            onClick={handleSendMessage}
            className="btn btn-primary flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
