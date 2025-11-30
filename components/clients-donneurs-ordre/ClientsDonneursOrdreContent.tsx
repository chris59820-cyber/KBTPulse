'use client'

import { useState, useEffect } from 'react'
import { Building2, User, Plus, Edit, Trash2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  nom: string
  adresse?: string
  telephone?: string
  email?: string
  photoUrl?: string
  commentaire?: string
  actif: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    chantiers: number
    donneursOrdre: number
  }
}

interface DonneurOrdre {
  id: string
  nom: string
  prenom?: string
  telephone?: string
  email?: string
  fonction?: string
  entreprise?: string
  clientId?: string
  commentaire?: string
  actif: boolean
  createdAt: string
  updatedAt: string
  client?: {
    id: string
    nom: string
  }
  _count?: {
    chantiers: number
    interventions: number
  }
}

interface ClientsDonneursOrdreContentProps {
  initialClients: Client[]
  initialDonneursOrdre: DonneurOrdre[]
}

export default function ClientsDonneursOrdreContent({ 
  initialClients, 
  initialDonneursOrdre 
}: ClientsDonneursOrdreContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'clients' | 'donneurs-ordre'>('clients')
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [donneursOrdre, setDonneursOrdre] = useState<DonneurOrdre[]>(initialDonneursOrdre)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState<string>('')

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchDonneursOrdre = async () => {
    try {
      const response = await fetch('/api/donneurs-ordre')
      if (response.ok) {
        const data = await response.json()
        setDonneursOrdre(data)
      }
    } catch (error) {
      console.error('Error fetching donneurs ordre:', error)
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce client ?')) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchClients()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleDeleteDonneurOrdre = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce donneur d\'ordre ?')) {
      return
    }

    try {
      const response = await fetch(`/api/donneurs-ordre/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDonneursOrdre()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting donneur ordre:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone?.includes(searchTerm)
  )

  const filteredDonneursOrdre = donneursOrdre.filter(donneurOrdre =>
    (filterClient === '' || donneurOrdre.clientId === filterClient) &&
    (donneurOrdre.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donneurOrdre.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donneurOrdre.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donneurOrdre.telephone?.includes(searchTerm))
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Onglets */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'clients'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="inline mr-2" size={18} />
            Clients
          </button>
          <button
            onClick={() => setActiveTab('donneurs-ordre')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'donneurs-ordre'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="inline mr-2" size={18} />
            Donneurs d'ordre
          </button>
        </div>
      </div>

      {/* Barre de recherche et actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Rechercher ${activeTab === 'clients' ? 'un client' : 'un donneur d\'ordre'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        {activeTab === 'donneurs-ordre' && (
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="input"
          >
            <option value="">Tous les clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.nom}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => router.push(`/clients-donneurs-ordre/${activeTab === 'clients' ? 'nouveau-client' : 'nouveau-donneur-ordre'}`)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau {activeTab === 'clients' ? 'client' : 'donneur d\'ordre'}
        </button>
      </div>

      {/* Liste */}
      {activeTab === 'clients' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Aucun client trouvé
            </div>
          ) : (
            filteredClients.map(client => (
              <div key={client.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    {client.photoUrl && (
                      <img
                        src={client.photoUrl}
                        alt={client.nom}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{client.nom}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/clients-donneurs-ordre/client/${client.id}/modifier`)}
                      className="text-primary-600 hover:text-primary-700"
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {client.email && (
                    <p><span className="font-medium">Email:</span> {client.email}</p>
                  )}
                  {client.telephone && (
                    <p><span className="font-medium">Téléphone:</span> {client.telephone}</p>
                  )}
                  {client.adresse && (
                    <p><span className="font-medium">Adresse:</span> {client.adresse}</p>
                  )}
                  {client._count && (
                    <div className="pt-2 border-t mt-2">
                      <p className="text-xs text-gray-500">
                        {client._count.chantiers} chantier{client._count.chantiers > 1 ? 's' : ''} • {client._count.donneursOrdre} donneur{client._count.donneursOrdre > 1 ? 's' : ''} d'ordre
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonneursOrdre.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Aucun donneur d'ordre trouvé
            </div>
          ) : (
            filteredDonneursOrdre.map(donneurOrdre => (
              <div key={donneurOrdre.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {donneurOrdre.nom} {donneurOrdre.prenom}
                    </h3>
                    {donneurOrdre.fonction && (
                      <p className="text-sm text-gray-600 mt-1">{donneurOrdre.fonction}</p>
                    )}
                    {donneurOrdre.client && (
                      <p className="text-xs text-primary-600 mt-1">{donneurOrdre.client.nom}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/clients-donneurs-ordre/donneur-ordre/${donneurOrdre.id}/modifier`)}
                      className="text-primary-600 hover:text-primary-700"
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDonneurOrdre(donneurOrdre.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {donneurOrdre.email && (
                    <p><span className="font-medium">Email:</span> {donneurOrdre.email}</p>
                  )}
                  {donneurOrdre.telephone && (
                    <p><span className="font-medium">Téléphone:</span> {donneurOrdre.telephone}</p>
                  )}
                  {donneurOrdre.entreprise && (
                    <p><span className="font-medium">Entreprise:</span> {donneurOrdre.entreprise}</p>
                  )}
                  {donneurOrdre._count && (
                    <div className="pt-2 border-t mt-2">
                      <p className="text-xs text-gray-500">
                        {donneurOrdre._count.chantiers} chantier{donneurOrdre._count.chantiers > 1 ? 's' : ''} • {donneurOrdre._count.interventions} intervention{donneurOrdre._count.interventions > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}




