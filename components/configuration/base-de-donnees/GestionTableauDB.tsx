'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Search } from 'lucide-react'

interface GestionTableauDBProps {
  modelName: string
}

export default function GestionTableauDB({ modelName }: GestionTableauDBProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<any>({})
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [columns, setColumns] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [modelName])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/configuration/database/${modelName.toLowerCase()}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données')
      }
      const result = await response.json()
      setData(result.data || [])
      
      // Extraire les colonnes depuis les données
      if (result.data && result.data.length > 0) {
        setColumns(Object.keys(result.data[0]))
      } else if (result.columns) {
        setColumns(result.columns)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setEditingData({ ...item })
    setIsCreating(false)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setNewData({})
    setEditingId(null)
  }

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/configuration/database/${modelName.toLowerCase()}/${editingId}`
        : `/api/configuration/database/${modelName.toLowerCase()}`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingId ? editingData : newData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la sauvegarde')
      }

      await loadData()
      setEditingId(null)
      setIsCreating(false)
      setEditingData({})
      setNewData({})
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      return
    }

    try {
      const response = await fetch(`/api/configuration/database/${modelName.toLowerCase()}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      await loadData()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsCreating(false)
    setEditingData({})
    setNewData({})
  }

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    return Object.values(item).some((value: any) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button
          onClick={loadData}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvel enregistrement
        </button>
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <div className="card border-2 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nouvel enregistrement</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns
              .filter((col) => col !== 'id' && !col.includes('At') && col !== 'createdAt' && col !== 'updatedAt')
              .map((col) => (
                <div key={col}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {col}
                  </label>
                  <input
                    type={col.includes('date') || col.includes('Date') ? 'date' : col.includes('email') ? 'email' : 'text'}
                    value={newData[col] || ''}
                    onChange={(e) => setNewData({ ...newData, [col]: e.target.value })}
                    className="input w-full"
                  />
                </div>
              ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={handleCancel} className="btn btn-secondary">
              Annuler
            </button>
            <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
              <Save size={16} />
              Créer
            </button>
          </div>
        </div>
      )}

      {/* Tableau des données */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                    Aucune donnée trouvée
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {editingId === item.id ? (
                      <>
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-2">
                            {col === 'id' || col === 'createdAt' || col === 'updatedAt' ? (
                              <span className="text-sm text-gray-500">{String(item[col] || '')}</span>
                            ) : (
                              <input
                                type={col.includes('date') || col.includes('Date') ? 'date' : col.includes('email') ? 'email' : 'text'}
                                value={editingData[col] || ''}
                                onChange={(e) => setEditingData({ ...editingData, [col]: e.target.value })}
                                className="input text-sm w-full"
                              />
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-700"
                              title="Enregistrer"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-700"
                              title="Annuler"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-2 text-sm text-gray-900">
                            {item[col] === null || item[col] === undefined
                              ? <span className="text-gray-400">-</span>
                              : typeof item[col] === 'object'
                              ? JSON.stringify(item[col])
                              : String(item[col])}
                          </td>
                        ))}
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-primary-600 hover:text-primary-700"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        {filteredData.length} enregistrement(s) trouvé(s)
      </div>
    </div>
  )
}



