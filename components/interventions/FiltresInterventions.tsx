'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'

interface FiltresInterventionsProps {
  rdcs: Array<{ id: string; nom: string; prenom: string; poste: string | null }>
  usines: Array<{ id: string; nom: string }>
  secteurs: Array<{ id: string; nom: string }>
  clients: string[]
  activites: string[]
  codesAffaire: Array<{ id: string; code: string }>
}

const STATUTS = [
  { value: 'planifiee', label: 'Planifiée' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'diagnostique', label: 'Diagnostique' },
  { value: 'terminee', label: 'Terminée' },
  { value: 'annulee', label: 'Annulée' }
]

export default function FiltresInterventions({
  rdcs,
  usines,
  secteurs,
  clients,
  activites,
  codesAffaire
}: FiltresInterventionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    rdcId: searchParams.get('rdcId') || '',
    site: searchParams.get('site') || '',
    secteur: searchParams.get('secteur') || '',
    statut: searchParams.get('statut') || '',
    client: searchParams.get('client') || '',
    activite: searchParams.get('activite') || '',
    numeroCommande: searchParams.get('numeroCommande') || '',
    numeroDevis: searchParams.get('numeroDevis') || '',
    codeAffaire: searchParams.get('codeAffaire') || ''
  })
  
  const [availableSecteurs, setAvailableSecteurs] = useState<Array<{id: string, nom: string}>>(secteurs)
  
  // Charger les secteurs dynamiquement en fonction du site sélectionné
  useEffect(() => {
    const loadSecteurs = async () => {
      if (filters.site) {
        try {
          const res = await fetch(`/api/configuration/structures?usineId=${filters.site}`)
          const data = await res.json()
          const secteursList = data
            .filter((s: any) => s.type === 'secteur' && s.actif && !s.parentId)
            .map((s: any) => ({ id: s.id, nom: s.nom }))
          setAvailableSecteurs(secteursList)
        } catch (err) {
          console.error('Erreur lors du chargement des secteurs:', err)
          setAvailableSecteurs([])
        }
      } else {
        setAvailableSecteurs([])
      }
    }
    
    // Utiliser les secteurs du serveur si disponibles, sinon charger depuis l'API
    if (filters.site && secteurs.length > 0 && secteurs[0].id) {
      setAvailableSecteurs(secteurs)
    } else {
      loadSecteurs()
    }
  }, [filters.site])

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Construire les paramètres de recherche
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    
    // Naviguer avec les nouveaux paramètres
    router.push(`/interventions?${params.toString()}`)
  }

  const handleReset = () => {
    setFilters({
      rdcId: '',
      site: '',
      secteur: '',
      statut: '',
      client: '',
      activite: '',
      numeroCommande: '',
      numeroDevis: '',
      codeAffaire: ''
    })
    router.push('/interventions')
  }

  const removeFilter = (key: string) => {
    handleFilterChange(key, '')
  }

  return (
    <div className="mb-6">
      {/* Bouton pour afficher/masquer les filtres */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Filter size={18} />
          Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X size={16} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.rdcId && (
            <span className="badge badge-info flex items-center gap-1">
              RDC: {rdcs.find(r => r.id === filters.rdcId)?.prenom} {rdcs.find(r => r.id === filters.rdcId)?.nom}
              <button onClick={() => removeFilter('rdcId')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.site && (
            <span className="badge badge-info flex items-center gap-1">
              Site: {usines.find(u => u.id === filters.site)?.nom}
              <button onClick={() => removeFilter('site')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.secteur && (
            <span className="badge badge-info flex items-center gap-1">
              Secteur: {secteurs.find(s => s.id === filters.secteur)?.nom}
              <button onClick={() => removeFilter('secteur')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.statut && (
            <span className="badge badge-info flex items-center gap-1">
              Statut: {STATUTS.find(s => s.value === filters.statut)?.label}
              <button onClick={() => removeFilter('statut')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.client && (
            <span className="badge badge-info flex items-center gap-1">
              Client: {filters.client}
              <button onClick={() => removeFilter('client')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.activite && (
            <span className="badge badge-info flex items-center gap-1">
              Activité: {filters.activite}
              <button onClick={() => removeFilter('activite')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.numeroCommande && (
            <span className="badge badge-info flex items-center gap-1">
              N° Commande: {filters.numeroCommande}
              <button onClick={() => removeFilter('numeroCommande')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.numeroDevis && (
            <span className="badge badge-info flex items-center gap-1">
              N° Devis: {filters.numeroDevis}
              <button onClick={() => removeFilter('numeroDevis')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
          {filters.codeAffaire && (
            <span className="badge badge-info flex items-center gap-1">
              Code Affaire: {codesAffaire.find(c => c.id === filters.codeAffaire)?.code || filters.codeAffaire}
              <button onClick={() => removeFilter('codeAffaire')} className="ml-1 hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="card mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* RDC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RDC responsable
              </label>
              <select
                value={filters.rdcId}
                onChange={(e) => handleFilterChange('rdcId', e.target.value)}
                className="input"
              >
                <option value="">Tous les RDC</option>
                {rdcs.map((rdc) => (
                  <option key={rdc.id} value={rdc.id}>
                    {rdc.prenom} {rdc.nom} - {rdc.poste}
                  </option>
                ))}
              </select>
            </div>

            {/* Site */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site
              </label>
              <select
                value={filters.site}
                onChange={(e) => {
                  // Réinitialiser le secteur si le site change
                  if (e.target.value !== filters.site && filters.secteur) {
                    const newFilters = { ...filters, site: e.target.value, secteur: '' }
                    setFilters(newFilters)
                    const params = new URLSearchParams()
                    Object.entries(newFilters).forEach(([k, v]) => {
                      if (v) params.set(k, v)
                    })
                    router.push(`/interventions?${params.toString()}`)
                  } else {
                    handleFilterChange('site', e.target.value)
                  }
                }}
                className="input"
              >
                <option value="">Tous les sites</option>
                {usines.map((usine) => (
                  <option key={usine.id} value={usine.id}>
                    {usine.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Secteur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur
              </label>
              <select
                value={filters.secteur}
                onChange={(e) => handleFilterChange('secteur', e.target.value)}
                className="input"
                disabled={!filters.site}
              >
                <option value="">
                  {!filters.site ? 'Sélectionnez d\'abord un site' : 'Tous les secteurs'}
                </option>
                {availableSecteurs.map((secteur) => (
                  <option key={secteur.id} value={secteur.id}>
                    {secteur.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.statut}
                onChange={(e) => handleFilterChange('statut', e.target.value)}
                className="input"
              >
                <option value="">Tous les statuts</option>
                {STATUTS.map((statut) => (
                  <option key={statut.value} value={statut.value}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                value={filters.client}
                onChange={(e) => handleFilterChange('client', e.target.value)}
                className="input"
              >
                <option value="">Tous les clients</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>

            {/* Activité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activité
              </label>
              <select
                value={filters.activite}
                onChange={(e) => handleFilterChange('activite', e.target.value)}
                className="input"
              >
                <option value="">Toutes les activités</option>
                {activites.map((activite) => (
                  <option key={activite} value={activite}>
                    {activite}
                  </option>
                ))}
              </select>
            </div>

            {/* Numéro de commande */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de commande
              </label>
              <input
                type="text"
                value={filters.numeroCommande}
                onChange={(e) => handleFilterChange('numeroCommande', e.target.value)}
                className="input"
                placeholder="Rechercher par n° de commande"
              />
            </div>

            {/* Numéro de devis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de devis
              </label>
              <input
                type="text"
                value={filters.numeroDevis}
                onChange={(e) => handleFilterChange('numeroDevis', e.target.value)}
                className="input"
                placeholder="Rechercher par n° de devis"
              />
            </div>

            {/* Code affaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code affaire
              </label>
              <select
                value={filters.codeAffaire}
                onChange={(e) => handleFilterChange('codeAffaire', e.target.value)}
                className="input"
              >
                <option value="">Tous les codes affaire</option>
                {codesAffaire.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

