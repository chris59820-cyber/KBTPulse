'use client'

import { useState, useEffect } from 'react'
import ClientsDonneursOrdreContent from '@/components/clients-donneurs-ordre/ClientsDonneursOrdreContent'

interface TabGestionClientsDonneursOrdreProps {
  user: any
}

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

export default function TabGestionClientsDonneursOrdre({ user }: TabGestionClientsDonneursOrdreProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [donneursOrdre, setDonneursOrdre] = useState<DonneurOrdre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
    fetchDonneursOrdre()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <ClientsDonneursOrdreContent 
      initialClients={clients}
      initialDonneursOrdre={donneursOrdre}
    />
  )
}
