'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Building2, MapPin, Calendar, DollarSign, User, Mail, Phone, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Usine {
  id: string
  nom: string
}

interface CodeAffaire {
  id: string
  code: string
  libelle: string
  actif: boolean
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

interface FormNouveauChantierProps {
  usines: Usine[]
  codesAffaire?: CodeAffaire[]
}

export default function FormNouveauChantier({ usines, codesAffaire = [] }: FormNouveauChantierProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usineId, setUsineId] = useState<string>('')
  const [secteurId, setSecteurId] = useState<string>('')
  const [secteurs, setSecteurs] = useState<Array<{id: string, nom: string}>>([])
  const [clients, setClients] = useState<Client[]>([])
  const [donneursOrdre, setDonneursOrdre] = useState<DonneurOrdre[]>([])

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

  // Charger les secteurs quand un site est sélectionné
  useEffect(() => {
    if (usineId) {
      fetch(`/api/configuration/structures?usineId=${usineId}`)
        .then(res => res.json())
        .then(data => {
          const secteursList = data
            .filter((s: any) => s.type === 'secteur' && s.actif && !s.parentId)
            .map((s: any) => ({ id: s.id, nom: s.nom }))
          setSecteurs(secteursList)
        })
        .catch(err => {
          console.error('Erreur lors du chargement des secteurs:', err)
          setSecteurs([])
        })
    } else {
      setSecteurs([])
      setSecteurId('')
    }
  }, [usineId])

  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    description: '',
    clientId: '',
    dateDebut: '',
    dateFin: '',
    budget: '',
    statut: 'en_attente',
    numeroCommande: '',
    donneurOrdreId: ''
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

      const response = await fetch('/api/chantiers', {
        method: 'POST',
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
        const errorMessage = errorData.error || 'Erreur lors de la création du chantier'
        const fullMessage = errorData.details 
          ? `${errorMessage}\n\nDétails techniques:\n${errorData.details}`
          : errorMessage
        throw new Error(fullMessage)
      }

      const newChantier = await response.json()

      // Rediriger vers la page de détail du nouveau chantier
      router.push(`/chantiers/${newChantier.id}`)
      router.refresh()
    } catch (err: any) {
      console.error('Erreur lors de la création:', err)
      setError(err.message || 'Erreur lors de la création du chantier')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <Link 
        href="/chantiers" 
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={16} />
        Retour à la liste des chantiers
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Building2 className="text-primary-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Créer un nouveau chantier</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Erreur lors de la création</h3>
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
                onChange={(e) => setUsineId(e.target.value)}
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
                onChange={(e) => setSecteurId(e.target.value)}
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

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link
              href="/chantiers"
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
              {loading ? 'Création...' : 'Créer le chantier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

