'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Building2, MapPin, Calendar, DollarSign, User, Mail, Phone, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Usine {
  id: string
  nom: string
}

interface Client {
  id: string
  nom: string
  actif?: boolean
}

interface DonneurOrdre {
  id: string
  nom: string
  prenom?: string
  telephone?: string
  email?: string
  actif?: boolean
}

interface Chantier {
  id: string
  nom: string
  adresse: string | null
  description: string | null
  client: string | null
  clientId: string | null
  dateDebut: Date | null
  dateFin: Date | null
  budget: number | null
  statut: string
  rdcId: string | null
  codeAffaireId?: string | null
  site: string | null
  secteur: string | null
  numeroCommande: string | null
  donneurOrdreNom: string | null
  donneurOrdreTelephone: string | null
  donneurOrdreEmail: string | null
  rdc?: {
    id: string
    nom: string
    prenom: string
    poste: string | null
  } | null
}

interface FormModifierChantierProps {
  chantier: Chantier
  usines: Usine[]
}

export default function FormModifierChantier({ chantier, usines }: FormModifierChantierProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usineId, setUsineId] = useState<string>('')
  const [secteurId, setSecteurId] = useState<string>('')
  const [secteurs, setSecteurs] = useState<Array<{id: string, nom: string}>>([])
  const [clients, setClients] = useState<Client[]>([])
  const [donneursOrdre, setDonneursOrdre] = useState<DonneurOrdre[]>([])
  
  // Flags pour empêcher la réinitialisation après sélection manuelle
  const [usineManuallySelected, setUsineManuallySelected] = useState(false)
  const [secteurManuallySelected, setSecteurManuallySelected] = useState(false)
  const [usineInitializedFromChantier, setUsineInitializedFromChantier] = useState(false)
  const [secteurInitializedFromChantier, setSecteurInitializedFromChantier] = useState(false)

  // Charger la liste des clients
  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        setClients(data.filter((c: Client) => c.actif !== false))
      })
      .catch(err => {
        console.error('Erreur lors du chargement des clients:', err)
      })
  }, [])

  // Charger la liste des donneurs d'ordre
  useEffect(() => {
    fetch('/api/donneurs-ordre')
      .then(res => res.json())
      .then(data => {
        setDonneursOrdre(data.filter((donneurOrdre: DonneurOrdre) => donneurOrdre.actif !== false))
      })
      .catch(err => {
        console.error('Erreur lors du chargement des donneurs d\'ordre:', err)
      })
  }, [])

  // Initialiser l'usine en mode édition (seulement au premier chargement, une seule fois)
  useEffect(() => {
    if (usineManuallySelected || usineInitializedFromChantier || !chantier?.site || usines.length === 0) return

    const usine = usines.find(u => u.nom.trim().toLowerCase() === (chantier.site?.trim().toLowerCase() || ''))
    if (usine) {
      if (usineId !== usine.id) {
        setUsineId(usine.id)
      }
      setUsineInitializedFromChantier(true)
    }
  }, [chantier?.site, usines, usineManuallySelected, usineInitializedFromChantier, usineId])

  // Charger les secteurs quand un site est sélectionné
  useEffect(() => {
    if (usineId) {
      // Sauvegarder les valeurs actuelles pour éviter les problèmes de closure
      const secteurManuallySelectedValue = secteurManuallySelected
      const secteurChantier = chantier?.secteur
      
      fetch(`/api/configuration/structures?usineId=${usineId}`)
        .then(res => res.json())
        .then(data => {
          const secteursList = data
            .filter((s: any) => s.type === 'secteur' && s.actif && !s.parentId)
            .map((s: any) => ({ id: s.id, nom: s.nom }))
          setSecteurs(secteursList)
          
          // Pré-remplir le secteur immédiatement après le chargement si possible
          // Vérifier si le secteur n'a pas été sélectionné manuellement et qu'on a un secteur dans le chantier
          if (!secteurManuallySelectedValue && secteurChantier && secteursList.length > 0) {
            const secteurNomNormalise = secteurChantier.trim().toLowerCase()
            const secteur = secteursList.find((s: any) => s.nom.trim().toLowerCase() === secteurNomNormalise)
            
            if (secteur) {
              // Vérifier si le secteurId actuel est différent avant de mettre à jour
              setSecteurId((prevId) => {
                if (prevId !== secteur.id) {
                  return secteur.id
                }
                return prevId
              })
              setSecteurInitializedFromChantier(true)
            }
          }
        })
        .catch(err => {
          console.error('Erreur lors du chargement des secteurs:', err)
          setSecteurs([])
        })
    } else {
      setSecteurs([])
      if (!secteurManuallySelected) {
        setSecteurId('')
        setSecteurInitializedFromChantier(false)
      }
    }
  }, [usineId, secteurManuallySelected, chantier?.secteur])


  const [formData, setFormData] = useState({
    nom: chantier.nom || '',
    adresse: chantier.adresse || '',
    description: chantier.description || '',
    clientId: (chantier as any).clientId || '',
    dateDebut: chantier.dateDebut ? new Date(chantier.dateDebut).toISOString().split('T')[0] : '',
    dateFin: chantier.dateFin ? new Date(chantier.dateFin).toISOString().split('T')[0] : '',
    budget: chantier.budget?.toString() || '',
    statut: chantier.statut || 'planifie',
    numeroCommande: chantier.numeroCommande || '',
    donneurOrdreId: (chantier as any).donneurOrdreId || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.nom) {
        throw new Error('Le nom est requis')
      }

      // Récupérer les noms des sites et secteurs sélectionnés
      const siteNom = usineId ? usines.find(u => u.id === usineId)?.nom || '' : ''
      const secteurNom = secteurId ? secteurs.find(s => s.id === secteurId)?.nom || '' : ''

      const response = await fetch(`/api/chantiers/${chantier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          adresse: formData.adresse || null,
          description: formData.description || null,
          clientId: formData.clientId || null,
          dateDebut: formData.dateDebut || null,
          dateFin: formData.dateFin || null,
          budget: formData.budget && formData.budget.trim() !== '' ? parseFloat(formData.budget) : null,
          statut: formData.statut,
          site: siteNom || null,
          secteur: secteurNom || null,
          numeroCommande: formData.numeroCommande || null,
          donneurOrdreId: formData.donneurOrdreId || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Erreur lors de la mise à jour du chantier'
        // Afficher les détails supplémentaires en mode développement
        const fullMessage = errorData.details 
          ? `${errorMessage}\n\nDétails techniques:\n${errorData.details}`
          : errorMessage
        throw new Error(fullMessage)
      }

      // Rediriger vers la page de détail du chantier
      router.push(`/chantiers/${chantier.id}`)
      router.refresh()
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err)
      setError(err.message || 'Erreur lors de la mise à jour du chantier')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <Link 
        href={`/chantiers/${chantier.id}`} 
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={16} />
        Retour au détail du chantier
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Building2 className="text-primary-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Modifier le chantier</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Erreur lors de la mise à jour</h3>
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-red-100 p-3 rounded border border-red-200 overflow-auto max-h-96">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du chantier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="input"
                required
                placeholder="Ex: Résidence Les Jardins"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="input"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="input"
              >
                <option value="en_attente">En attente</option>
                <option value="planifie">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Adresse
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="input"
                placeholder="Adresse complète du chantier"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Date de fin
              </label>
              <input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline mr-2" size={16} />
                Budget
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="input"
                placeholder="Montant en euros"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site
              </label>
              <select
                value={usineId}
                onChange={(e) => {
                  setUsineId(e.target.value)
                  setUsineManuallySelected(true)
                  // Réinitialiser le secteur si on change de site
                  if (e.target.value !== usineId) {
                    setSecteurId('')
                    setSecteurManuallySelected(false)
                    setSecteurInitializedFromChantier(false)
                  }
                }}
                className="input"
              >
                <option value="">Sélectionner un site</option>
                {usines.map((usine) => (
                  <option key={usine.id} value={usine.id}>
                    {usine.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur
              </label>
              <select
                value={secteurId}
                onChange={(e) => {
                  setSecteurId(e.target.value)
                  setSecteurManuallySelected(true)
                }}
                className="input"
                disabled={!usineId || secteurs.length === 0}
              >
                <option value="">
                  {!usineId ? 'Sélectionnez d\'abord un site' : secteurs.length === 0 ? 'Aucun secteur disponible' : 'Sélectionner un secteur'}
                </option>
                {secteurs.map((secteur) => (
                  <option key={secteur.id} value={secteur.id}>
                    {secteur.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de commande
              </label>
              <input
                type="text"
                value={formData.numeroCommande}
                onChange={(e) => setFormData({ ...formData, numeroCommande: e.target.value })}
                className="input"
                placeholder="Numéro de commande"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                Donneur d'ordre
              </label>
              <select
                value={formData.donneurOrdreId}
                onChange={(e) => setFormData({ ...formData, donneurOrdreId: e.target.value })}
                className="input"
              >
                <option value="">Sélectionner un donneur d'ordre</option>
                {donneursOrdre.map((donneurOrdre) => (
                  <option key={donneurOrdre.id} value={donneurOrdre.id}>
                    {donneurOrdre.nom} {donneurOrdre.prenom || ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={4}
                placeholder="Description du chantier..."
              />
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push(`/chantiers/${chantier.id}`)}
              className="btn btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              <ArrowLeft size={18} />
              Fermer
            </button>
            <div className="flex gap-4">
              <Link
                href={`/chantiers/${chantier.id}`}
                className="btn btn-secondary"
                onClick={(e) => {
                  if (loading) e.preventDefault()
                }}
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

