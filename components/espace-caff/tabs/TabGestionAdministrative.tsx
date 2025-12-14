'use client'

import { useState, useEffect } from 'react'
import { Calendar, Building2, Plus, CheckCircle, XCircle, AlertCircle, Save, X, Edit } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TabGestionAdministrativeProps {
  user: any
}

interface Conge {
  id: string
  salarieId: string
  salarie: {
    nom: string
    prenom: string
    matricule: string | null
    user: {
      role: string
    } | null
  }
  type: string
  dateDebut: Date
  dateFin: Date
  dureeJours: number | null
  commentaire: string | null
  statut: string
  createdAt: Date
}

interface CodeAffaire {
  id: string
  code: string
  description: string | null
  client: {
    id: string
    nom: string
  } | null
  activite: string | null
  actif: boolean
  codeContrat: boolean
  rdcId: string | null
  rdc?: {
    id: string
    nom: string
    prenom: string
  } | null
}

interface RDC {
  id: string
  nom: string
  prenom: string
  matricule: string | null
}

// Fonction pour formater l'activité avec les accents et majuscules corrects
const formatActivite = (activite: string | null | undefined): string => {
  if (!activite) return ''
  // Remplacer "Echafaudage" par "Échafaudage"
  if (activite === 'Echafaudage' || activite === 'echafaudage') {
    return 'Échafaudage'
  }
  return activite
}

export default function TabGestionAdministrative({ user }: TabGestionAdministrativeProps) {
  const [conges, setConges] = useState<Conge[]>([])
  const [codesAffaire, setCodesAffaire] = useState<CodeAffaire[]>([])
  const [rdcList, setRdcList] = useState<RDC[]>([])
  const [loading, setLoading] = useState(true)
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'conges' | 'codes'>('conges')
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    client: '',
    activite: '',
    rdcId: '',
    actif: true,
    codeContrat: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [congesRes, codesRes, rdcRes] = await Promise.all([
        fetch('/api/espace-caff/conges?statut=en_attente'),
        fetch('/api/espace-caff/codes-affaire'),
        fetch('/api/configuration/salaries?role=RDC')
      ])

      if (congesRes.ok) {
        const congesData = await congesRes.json()
        setConges(congesData)
      }

      if (codesRes.ok) {
        const codesData = await codesRes.json()
        setCodesAffaire(codesData)
      }

      if (rdcRes.ok) {
        const rdcData = await rdcRes.json()
        // Filtrer les RDC actifs (niveauAcces = 'RDC' ou user.role = 'RDC')
        const rdcActifs = rdcData.filter((s: any) => 
          s.statut === 'actif' && (s.niveauAcces === 'RDC' || s.user?.role === 'RDC')
        )
        setRdcList(rdcActifs)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidationConge = async (congeId: string, valide: boolean, commentaire?: string) => {
    try {
      const response = await fetch(`/api/espace-caff/conges/${congeId}/valider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valide, commentaire })
      })

      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
    }
  }

  const handleEditCode = (code: CodeAffaire) => {
    console.log('Editing code affaire:', code)
    setEditingCodeId(code.id)
    setFormData({
      code: code.code,
      description: code.description || '',
      client: code.client?.nom || '',
      activite: code.activite || '',
      rdcId: code.rdcId || '',
      actif: code.actif,
      codeContrat: code.codeContrat || false
    })
    setShowCodeForm(true)
    // Scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const handleCancelEdit = () => {
    setEditingCodeId(null)
    setShowCodeForm(false)
    setFormData({
      code: '',
      description: '',
      client: '',
      activite: '',
      rdcId: '',
      actif: true,
      codeContrat: false
    })
  }

  const handleSaveCodeAffaire = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCodeId 
        ? `/api/espace-caff/codes-affaire/${editingCodeId}`
        : '/api/espace-caff/codes-affaire'
      const method = editingCodeId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description || null,
          client: formData.client || null,
          activite: formData.activite || null,
          rdcId: formData.rdcId || null,
          actif: formData.actif,
          codeContrat: formData.codeContrat
        })
      })

      if (response.ok) {
        loadData()
        handleCancelEdit()
      } else {
        const errorData = await response.json()
        console.error('Erreur lors de la sauvegarde:', errorData)
        const errorMessage = errorData.error || 'Erreur lors de la sauvegarde'
        alert(`Erreur: ${errorMessage}\n\nVérifiez que le serveur de développement a été redémarré après les modifications du schéma Prisma.`)
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert(`Erreur lors de la sauvegarde du code affaire:\n\n${error.message || 'Erreur inconnue'}\n\nVérifiez que le serveur de développement a été redémarré après les modifications du schéma Prisma.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation des vues */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('conges')}
            className={`btn ${activeView === 'conges' ? 'btn-primary' : 'btn-secondary'} text-sm`}
          >
            <Calendar size={18} className="mr-2" />
            Validation des congés
          </button>
          <button
            onClick={() => setActiveView('codes')}
            className={`btn ${activeView === 'codes' ? 'btn-primary' : 'btn-secondary'} text-sm`}
          >
            <Building2 size={18} className="mr-2" />
            Codes affaires
          </button>
        </div>
        {activeView === 'codes' && !editingCodeId && (
          <button
            onClick={() => {
              handleCancelEdit()
              setShowCodeForm(true)
            }}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Créer un code affaire
          </button>
        )}
      </div>

      {/* Formulaire de création/édition de code affaire */}
      {showCodeForm && activeView === 'codes' && (
        <div className="card mb-6">
          <form onSubmit={handleSaveCodeAffaire} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900">
                {editingCodeId ? 'Modifier le code affaire' : 'Nouveau code affaire'}
              </h4>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  disabled={!!editingCodeId}
                  className={`input ${editingCodeId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Ex: AFF2024-001"
                />
                {editingCodeId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Le code ne peut pas être modifié
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Description du code affaire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="input"
                  placeholder="Nom du client"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activité
                </label>
                <select
                  value={formData.activite}
                  onChange={(e) => setFormData({ ...formData, activite: e.target.value })}
                  className="input"
                >
                  <option value="">Sélectionner une activité</option>
                  <option value="Échafaudage">Échafaudage</option>
                  <option value="Calorifuge">Calorifuge</option>
                  <option value="Désamiantage">Désamiantage</option>
                  <option value="Travaux sur corde">Travaux sur corde</option>
                  <option value="Peinture">Peinture</option>
                  <option value="Métallerie">Métallerie</option>
                  <option value="Naval">Naval</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RDC responsable
                </label>
                <select
                  value={formData.rdcId}
                  onChange={(e) => setFormData({ ...formData, rdcId: e.target.value })}
                  className="input"
                >
                  <option value="">Sélectionner un RDC</option>
                  {rdcList.map((rdc) => (
                    <option key={rdc.id} value={rdc.id}>
                      {rdc.prenom} {rdc.nom} {rdc.matricule ? `(${rdc.matricule})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Description du code affaire"
              />
            </div>

            {/* Cases à cocher */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="codeContrat"
                  checked={formData.codeContrat}
                  onChange={(e) => setFormData({ ...formData, codeContrat: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="codeContrat" className="text-sm font-medium text-gray-700">
                  Code contrat
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="actif" className="text-sm font-medium text-gray-700">
                  Code affaire actif
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                {editingCodeId ? 'Enregistrer les modifications' : 'Créer le code affaire'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X size={18} />
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Validation des congés */}
      {activeView === 'conges' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Validation des congés posés par les ouvriers et CE
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : conges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune demande de congé en attente</p>
          ) : (
            <div className="space-y-4">
              {conges.map((conge) => (
                <div
                  key={conge.id}
                  className="card border-yellow-200 bg-yellow-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-primary-600" size={20} />
                        <h5 className="font-semibold text-gray-900">
                          {conge.salarie.prenom} {conge.salarie.nom}
                        </h5>
                        {conge.salarie.matricule && (
                          <span className="text-sm text-gray-500">({conge.salarie.matricule})</span>
                        )}
                        <span className={`badge text-xs ${
                          conge.salarie.user?.role === 'CE' ? 'badge-info' : 'badge-secondary'
                        }`}>
                          {conge.salarie.user?.role || 'Ouvrier'}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 ml-8">
                        <p>
                          <span className="font-medium">Type:</span> {conge.type}
                        </p>
                        <p>
                          <span className="font-medium">Période:</span> Du {formatDate(conge.dateDebut)} au {formatDate(conge.dateFin)}
                        </p>
                        {conge.dureeJours && (
                          <p>
                            <span className="font-medium">Durée:</span> {conge.dureeJours} jour(s)
                          </p>
                        )}
                        {conge.commentaire && (
                          <p className="mt-2">
                            <span className="font-medium">Commentaire:</span> {conge.commentaire}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Demande effectuée le {formatDate(conge.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`Valider la demande de ${conge.type} de ${conge.salarie.prenom} ${conge.salarie.nom} ?`)) {
                          handleValidationConge(conge.id, true)
                        }
                      }}
                      className="btn btn-success flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        const commentaire = prompt('Raison du refus (optionnel):')
                        if (commentaire !== null) {
                          handleValidationConge(conge.id, false, commentaire || undefined)
                        }
                      }}
                      className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gestion des codes affaires */}
      {activeView === 'codes' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Création des codes affaires ({codesAffaire.length})
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : codesAffaire.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun code affaire créé</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {codesAffaire.map((code) => (
                <div
                  key={code.id}
                  className={`card ${code.actif ? 'border-green-200' : 'border-gray-200 bg-gray-50'} cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group`}
                  onClick={() => handleEditCode(code)}
                  title="Cliquer pour modifier"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {code.code}
                        </h5>
                        <Edit size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {code.description && (
                        <p className="text-sm text-gray-600 mb-2">{code.description}</p>
                      )}
                      {code.client && (
                        <p className="text-xs text-gray-500 mb-1">Client: {code.client.nom}</p>
                      )}
                      {code.activite && (
                        <p className="text-xs text-gray-500 mb-1">Activité: {formatActivite(code.activite)}</p>
                      )}
                      {code.rdc && (
                        <p className="text-xs text-gray-500 mb-1">
                          RDC: {code.rdc.prenom} {code.rdc.nom}
                        </p>
                      )}
                      {code.budget && (
                        <p className="text-xs text-gray-500 mb-1">
                          Budget: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(code.budget)}
                        </p>
                      )}
                      {code.description && (
                        <p className="text-xs text-gray-500 mt-2">{code.description}</p>
                      )}
                    </div>
                    {code.actif && (
                      <span className="badge badge-success text-xs pointer-events-none">Actif</span>
                    )}
                  </div>

                  {code.dateDebut && code.dateFin && (
                    <div className="text-xs text-gray-500 mt-2">
                      Du {formatDate(code.dateDebut)} au {formatDate(code.dateFin)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
