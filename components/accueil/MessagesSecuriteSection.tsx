'use client'

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface MessageSecurite {
  id: string
  titre: string
  contenu: string
  type: string
  imageUrl: string | null
  dateDebut: Date
  dateFin: Date | null
  perimetre: {
    id: string
    nom: string
  } | null
}

interface MessagesSecuriteSectionProps {
  messages: MessageSecurite[]
}

const typeIcons: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle,
}

const typeColors: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
}

export default function MessagesSecuriteSection({ messages }: MessagesSecuriteSectionProps) {
  if (messages.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages de sécurité</h2>
          <AlertTriangle className="text-yellow-600" size={24} />
        </div>
        <p className="text-gray-500 text-center py-4 text-sm">Aucun message de sécurité</p>
      </div>
    )
  }

  // Trier les messages par priorité (danger > warning > info > success)
  const priorityOrder = { danger: 0, warning: 1, info: 2, success: 3 }
  const sortedMessages = [...messages].sort((a, b) => {
    const priorityA = priorityOrder[a.type as keyof typeof priorityOrder] ?? 99
    const priorityB = priorityOrder[b.type as keyof typeof priorityOrder] ?? 99
    return priorityA - priorityB
  })

  const topMessage = sortedMessages[0]
  const otherMessages = sortedMessages.slice(1)

  return (
    <div className="space-y-4">
      {/* Message principal en évidence */}
      <div className={`card border-2 ${typeColors[topMessage.type] || typeColors.info} shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {(() => {
              const Icon = typeIcons[topMessage.type] || AlertTriangle
              return <Icon size={32} className="mt-1" />
            })()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle size={24} />
                Messages de sécurité
              </h2>
            </div>
            <div className={`p-4 rounded-lg border-2 ${typeColors[topMessage.type] || typeColors.info} bg-white/50`}>
              {topMessage.imageUrl && (
                <div className="mb-3 w-[250px] h-[250px] mx-auto rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={topMessage.imageUrl}
                    alt={topMessage.titre}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              <h3 className="font-bold text-lg mb-2">{topMessage.titre}</h3>
              <p className="text-sm font-medium mb-2">{topMessage.contenu}</p>
              <div className="flex items-center gap-4 text-xs opacity-75 mt-2">
                {topMessage.perimetre && (
                  <span>Périmètre: {topMessage.perimetre.nom}</span>
                )}
                {topMessage.dateFin && (
                  <span>Jusqu'au {formatDateTime(topMessage.dateFin)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Autres messages */}
      {otherMessages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {otherMessages.map((message) => {
            const Icon = typeIcons[message.type] || Info
            const colorClass = typeColors[message.type] || typeColors.info

            return (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${colorClass}`}
              >
                {message.imageUrl && (
                  <div className="mb-3 w-[250px] h-[250px] mx-auto rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={message.imageUrl}
                      alt={message.titre}
                      className="max-w-full max-h-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Icon size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{message.titre}</h3>
                    <p className="text-sm opacity-90">{message.contenu}</p>
                    <div className="flex items-center gap-3 text-xs mt-2 opacity-75">
                      {message.perimetre && (
                        <span>Périmètre: {message.perimetre.nom}</span>
                      )}
                      {message.dateFin && (
                        <span>Jusqu'au {formatDateTime(message.dateFin)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
