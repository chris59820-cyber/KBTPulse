'use client'

import { useState } from 'react'
import { FileText, Plus, CheckCircle, X, Eye, PenTool, Upload, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Intervention {
  id: string
  documentsIntervention: {
    id: string
    type: string
    nom: string
    description: string | null
    fichierUrl: string | null
    signe: boolean
    signataire: string | null
    dateSignature: Date | null
    peutEcrire: boolean
    contenu: string | null
  }[]
  checklistSecurite: {
    id: string
    elements: string
    completee: boolean
  } | null
}

interface TabDocumentsInterventionProps {
  intervention: Intervention
  user: any
}

const typesDocuments: Record<string, string> = {
  plan: 'Plan',
  photo: 'Photo',
  pdp: 'PDP',
  liste: 'Liste',
  mos: 'MOS',
  autre: 'Autre'
}

export default function TabDocumentsIntervention({ intervention, user }: TabDocumentsInterventionProps) {
  const [showChecklist, setShowChecklist] = useState(false)
  const [editingDoc, setEditingDoc] = useState<string | null>(null)
  const [signingDoc, setSigningDoc] = useState<string | null>(null)

  const handleSign = async (docId: string) => {
    if (!confirm('Voulez-vous signer ce document ?')) return

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/documents/${docId}/signer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signataire: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.identifiant
        })
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur lors de la signature:', error)
    }
  }

  const handleSaveContent = async (docId: string, contenu: string) => {
    try {
      const response = await fetch(`/api/interventions/${intervention.id}/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu })
      })

      if (response.ok) {
        setEditingDoc(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Documents d'intervention</h3>
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="btn btn-primary text-sm flex items-center gap-2"
        >
          <AlertCircle size={18} />
          Checklist sécurité
        </button>
      </div>

      {/* Checklist sécurité */}
      {showChecklist && intervention.checklistSecurite && (
        <div className="card mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-900">Checklist sécurité</h4>
            <button
              onClick={() => setShowChecklist(false)}
              className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm">{intervention.checklistSecurite.elements}</pre>
          </div>
          {!intervention.checklistSecurite.completee && (
            <button className="btn btn-primary mt-4 w-full">
              Marquer comme complétée
            </button>
          )}
        </div>
      )}

      {/* Liste des documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intervention.documentsIntervention.length === 0 ? (
          <p className="text-gray-500 text-center py-8 col-span-full">Aucun document</p>
        ) : (
          intervention.documentsIntervention.map((document) => (
            <div
              key={document.id}
              className={`card ${document.signe ? 'border-green-200 bg-green-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary-600" size={20} />
                  <div>
                    <h5 className="font-semibold text-gray-900">{document.nom}</h5>
                    <span className="text-xs text-gray-500">
                      {typesDocuments[document.type] || document.type}
                    </span>
                  </div>
                </div>
                {document.signe && (
                  <CheckCircle className="text-green-600" size={18} />
                )}
              </div>

              {document.description && (
                <p className="text-sm text-gray-600 mb-3">{document.description}</p>
              )}

              {/* Contenu éditable */}
              {document.peutEcrire && (
                <div className="mb-3">
                  {editingDoc === document.id ? (
                    <div className="space-y-2">
                      <textarea
                        defaultValue={document.contenu || ''}
                        className="input text-sm"
                        rows={4}
                        placeholder="Contenu du document..."
                        onBlur={(e) => handleSaveContent(document.id, e.target.value)}
                      />
                      <button
                        onClick={() => setEditingDoc(null)}
                        className="btn btn-secondary text-xs w-full"
                      >
                        Fermer
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingDoc(document.id)}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <PenTool size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Éditable</span>
                      </div>
                      {document.contenu ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{document.contenu}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Cliquez pour ajouter du contenu</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Signature */}
              {document.signe ? (
                <div className="mb-3 p-2 bg-green-100 rounded text-sm">
                  <p className="text-green-800 font-medium">
                    ✓ Signé par {document.signataire}
                  </p>
                  {document.dateSignature && (
                    <p className="text-xs text-green-600 mt-1">
                      le {formatDate(document.dateSignature)}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleSign(document.id)}
                  className="btn btn-primary text-sm w-full mb-3 flex items-center justify-center gap-2"
                >
                  <PenTool size={14} />
                  Signer
                </button>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {document.fichierUrl && (
                  <a
                    href={document.fichierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-sm flex-1 flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    Voir
                  </a>
                )}
                <button className="btn btn-secondary text-sm flex-1 flex items-center justify-center gap-2">
                  <Upload size={14} />
                  Télécharger
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
