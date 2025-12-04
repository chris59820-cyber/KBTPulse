'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Save, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

interface GestionTableauDBProps {
  modelName: string
}

interface TableData {
  [key: string]: any
}

export default function GestionTableauDB({ modelName }: GestionTableauDBProps) {
  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<TableData>({})
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newData, setNewData] = useState<TableData>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchData()
  }, [modelName, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/configuration/database/${modelName}?page=${currentPage}&limit=${itemsPerPage}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des données')
      }
      
      const result = await response.json()
      setData(result.data || [])
      setTotalPages(result.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: TableData) => {
    setEditingId(item.id)
    setEditData({ ...item })
    setViewingId(null)
  }

  const handleView = (item: TableData) => {
    setViewingId(item.id)
    setEditingId(null)
  }

  const handleSave = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/configuration/database/${modelName}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      setEditingId(null)
      setEditData({})
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est irréversible.')) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/configuration/database/${modelName}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  const handleAdd = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/configuration/database/${modelName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'ajout')
      }

      setShowAddForm(false)
      setNewData({})
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
    setViewingId(null)
    setShowAddForm(false)
    setNewData({})
    setError(null)
  }

  const getFieldType = (key: string, value: any): 'text' | 'date' | 'datetime' | 'boolean' | 'number' | 'email' | 'textarea' => {
    if (key.toLowerCase().includes('email')) return 'email'
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('motdepasse')) return 'text'
    if (key.toLowerCase().includes('date') && !key.toLowerCase().includes('time')) return 'date'
    if (key.toLowerCase().includes('date') || key === 'createdAt' || key === 'updatedAt') return 'datetime'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (key.toLowerCase().includes('description') || key.toLowerCase().includes('contenu') || key.toLowerCase().includes('commentaire')) return 'textarea'
    return 'text'
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (value instanceof Date) return new Date(value).toLocaleString('fr-FR')
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
    if (typeof value === 'object') return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '')
    return value.toString()
  }

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return Object.values(item).some((value) => 
      value?.toString().toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Chargement des données...</span>
        </div>
      </div>
    )
  }

  if (error && !data.length) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-red-800">
          <h3 className="font-semibold mb-2">Erreur</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="btn btn-primary mt-4">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Aucune donnée trouvée dans ce tableau.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Ajouter un enregistrement
          </button>
        </div>
      </div>
    )
  }

  const columns = Object.keys(data[0] || {}).filter(col => {
    const value = data[0]?.[col]
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      return Object.keys(value).length < 5
    }
    return true
  })

  const editableColumns = columns.filter(col => !['id', 'createdAt', 'updatedAt'].includes(col))

  return (
    <div className="space-y-4">
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Barre de recherche et bouton d'ajout */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher dans toutes les colonnes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary w-full sm:w-auto"
          >
            <Plus size={16} className="mr-2" />
            Ajouter un enregistrement
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Ajouter un nouvel enregistrement</h3>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editableColumns.map((col) => {
              const fieldType = getFieldType(col, data[0]?.[col])
              const value = newData[col]
              
              return (
                <div key={col}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {col}
                  </label>
                  {fieldType === 'boolean' ? (
                    <select
                      value={value === undefined ? '' : value.toString()}
                      onChange={(e) => setNewData({ ...newData, [col]: e.target.value === 'true' })}
                      className="input w-full"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  ) : fieldType === 'date' ? (
                    <input
                      type="date"
                      value={value ? new Date(value).toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewData({ ...newData, [col]: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      className="input w-full"
                    />
                  ) : fieldType === 'datetime' ? (
                    <input
                      type="datetime-local"
                      value={value ? new Date(value).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewData({ ...newData, [col]: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      className="input w-full"
                    />
                  ) : fieldType === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={value || ''}
                      onChange={(e) => setNewData({ ...newData, [col]: e.target.value ? parseFloat(e.target.value) : null })}
                      className="input w-full"
                      placeholder={col}
                    />
                  ) : fieldType === 'textarea' ? (
                    <textarea
                      value={value || ''}
                      onChange={(e) => setNewData({ ...newData, [col]: e.target.value })}
                      className="input w-full"
                      rows={3}
                      placeholder={col}
                    />
                  ) : (
                    <input
                      type={fieldType}
                      value={value || ''}
                      onChange={(e) => setNewData({ ...newData, [col]: e.target.value })}
                      className="input w-full"
                      placeholder={col}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn btn-primary">
              <Save size={16} className="mr-2" />
              Enregistrer
            </button>
            <button onClick={handleCancel} className="btn btn-secondary">
              <X size={16} className="mr-2" />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Vue détaillée */}
      {viewingId && (
        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Détails de l'enregistrement</h3>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map((col) => (
              <div key={col}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{col}</label>
                <div className="text-sm text-gray-900 bg-white p-2 rounded border">
                  {formatValue(data.find(d => d.id === viewingId)?.[col])}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleEdit(data.find(d => d.id === viewingId)!)} className="btn btn-primary">
              <Edit size={16} className="mr-2" />
              Modifier
            </button>
            <button onClick={handleCancel} className="btn btn-secondary">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Tableau des données */}
      <div className="card overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {editingId === item.id ? (
                    <>
                      {columns.map((col) => {
                        const fieldType = getFieldType(col, editData[col])
                        const value = editData[col]
                        
                        return (
                          <td key={col} className="px-4 py-2">
                            {fieldType === 'boolean' ? (
                              <select
                                value={value === undefined ? '' : value.toString()}
                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value === 'true' })}
                                className="input text-sm w-full"
                              >
                                <option value="true">Oui</option>
                                <option value="false">Non</option>
                              </select>
                            ) : fieldType === 'date' ? (
                              <input
                                type="date"
                                value={value ? new Date(value).toISOString().split('T')[0] : ''}
                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                                className="input text-sm w-full"
                              />
                            ) : fieldType === 'datetime' ? (
                              <input
                                type="datetime-local"
                                value={value ? new Date(value).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                                className="input text-sm w-full"
                              />
                            ) : fieldType === 'number' ? (
                              <input
                                type="number"
                                step="any"
                                value={value || ''}
                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value ? parseFloat(e.target.value) : null })}
                                className="input text-sm w-full"
                              />
                            ) : fieldType === 'textarea' ? (
                              <textarea
                                value={value?.toString() || ''}
                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value })}
                                className="input text-sm w-full"
                                rows={2}
                              />
                            ) : (
                              <input
                                type={fieldType}
                                value={value?.toString() || ''}
                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value })}
                                className="input text-sm w-full"
                              />
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleSave}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Enregistrer"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-gray-600 hover:text-gray-700"
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
                        <td key={col} className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate" title={formatValue(item[col])}>
                          {formatValue(item[col])}
                        </td>
                      ))}
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm disabled:opacity-50"
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

