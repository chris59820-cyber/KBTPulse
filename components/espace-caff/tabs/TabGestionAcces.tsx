'use client'

import { useState, useEffect } from 'react'
import { Shield, Users, User, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react'

interface TabGestionAccesProps {
  user: any
}

interface UserWithRole {
  id: string
  identifiant: string
  nom: string | null
  prenom: string | null
  email: string | null
  role: string
  actif: boolean
  salarie: {
    nom: string
    prenom: string
    poste: string
  } | null
}

const rolesTypes: Record<string, string> = {
  OUVRIER: 'Salarié',
  PREPA: 'Staff',
  CE: 'CE',
  RDC: 'RDC',
  CAFF: 'CAFF',
  RH: 'RH',
  AUTRE: 'Autre',
  ADMIN: 'Administrateur'
}

const rolesDescription: Record<string, string> = {
  OUVRIER: 'Accès basique - Profil personnel uniquement',
  PREPA: 'Accès Staff - Gestion des formations, pointages, etc.',
  CE: 'Accès Staff - Chef d\'équipe avec gestion des équipes',
  RDC: 'Accès RDC - Responsable de chantier avec gestion du personnel',
  CAFF: 'Accès CAFF - Chargé d\'affaires avec accès complet',
  RH: 'Accès Staff - Ressources humaines',
  AUTRE: 'Accès Staff - Autre profil',
  ADMIN: 'Accès administrateur - Tous les droits'
}

export default function TabGestionAcces({ user }: TabGestionAccesProps) {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<string>('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/espace-caff/utilisateurs')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/espace-caff/utilisateurs/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (response.ok) {
        loadUsers()
        setEditingUser(null)
        setNewRole('')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const handleToggleActif = async (userId: string, actif: boolean) => {
    try {
      const response = await fetch(`/api/espace-caff/utilisateurs/${userId}/actif`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !actif })
      })

      if (response.ok) {
        loadUsers()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const usersByType = users.reduce((acc, u) => {
    const type = rolesTypes[u.role] || 'Autre'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(u)
    return acc
  }, {} as Record<string, UserWithRole[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des accès</h3>
          <p className="text-sm text-gray-600 mt-1">
            Gestion des rôles et permissions selon le type d'utilisateur
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        Object.entries(usersByType).map(([type, typeUsers]) => (
          <div key={type} className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-primary-600" size={20} />
              <h4 className="text-base font-semibold text-gray-900">
                {type} ({typeUsers.length})
              </h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">{rolesDescription[typeUsers[0]?.role || '']}</p>

            <div className="space-y-3">
              {typeUsers.map((utilisateur) => (
                <div
                  key={utilisateur.id}
                  className={`card ${!utilisateur.actif ? 'bg-gray-50 border-gray-200' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="text-primary-600" size={20} />
                        <h5 className="font-semibold text-gray-900">
                          {utilisateur.prenom || ''} {utilisateur.nom || ''}
                          {!utilisateur.nom && !utilisateur.prenom && utilisateur.identifiant}
                        </h5>
                        <span className={`badge text-xs ${
                          utilisateur.role === 'ADMIN' ? 'badge-danger' :
                          utilisateur.role === 'CAFF' ? 'badge-info' :
                          utilisateur.role === 'RDC' ? 'badge-warning' :
                          'badge-secondary'
                        }`}>
                          {utilisateur.role}
                        </span>
                        {!utilisateur.actif && (
                          <span className="badge badge-secondary text-xs">Inactif</span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 ml-8">
                        <p>
                          <span className="font-medium">Identifiant:</span> {utilisateur.identifiant}
                        </p>
                        {utilisateur.email && (
                          <p>
                            <span className="font-medium">Email:</span> {utilisateur.email}
                          </p>
                        )}
                        {utilisateur.salarie && (
                          <p>
                            <span className="font-medium">Salarié:</span> {utilisateur.salarie.prenom} {utilisateur.salarie.nom} - {utilisateur.salarie.poste}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingUser === utilisateur.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole || utilisateur.role}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="input text-sm"
                          >
                            {Object.entries(rolesTypes).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateRole(utilisateur.id, newRole || utilisateur.role)}
                            className="btn btn-success text-sm flex items-center gap-1"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null)
                              setNewRole('')
                            }}
                            className="btn btn-secondary text-sm flex items-center gap-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(utilisateur.id)
                              setNewRole(utilisateur.role)
                            }}
                            className="btn btn-primary text-sm flex items-center gap-1"
                            title="Modifier le rôle"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleActif(utilisateur.id, utilisateur.actif)}
                            className={`btn text-sm flex items-center gap-1 ${
                              utilisateur.actif ? 'btn-secondary' : 'btn-success'
                            }`}
                            title={utilisateur.actif ? 'Désactiver' : 'Activer'}
                          >
                            {utilisateur.actif ? <X size={14} /> : <CheckCircle size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
