'use client'

import { useState } from 'react'
import { Plus, Building2, MapPin, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import ModalNouvelleUsine from './ModalNouvelleUsine'
import ModalStructureOrganisationnelle from './ModalStructureOrganisationnelle'
import { formatDate } from '@/lib/utils'

interface Perimetre {
  id: string
  nom: string
}

interface StructureOrganisationnelle {
  id: string
  type: string
  nom: string
  code: string | null
  description: string | null
  parentId: string | null
  ordre: number | null
  actif: boolean
  enfants?: StructureOrganisationnelle[]
}

interface Usine {
  id: string
  nom: string
  secteurActivite: string | null
  adresse: string
  latitudePoste: number | null
  longitudePoste: number | null
  latitudeRassemblement: number | null
  longitudeRassemblement: number | null
  numeroUrgence: string | null
  perimetre: Perimetre
  structures?: StructureOrganisationnelle[]
}

interface ListeUsinesProps {
  usines: Usine[]
  perimetres: Perimetre[]
}

export default function ListeUsines({ usines: initialUsines, perimetres }: ListeUsinesProps) {
  const [usines, setUsines] = useState(initialUsines)
  const [showModalUsine, setShowModalUsine] = useState(false)
  const [showModalStructure, setShowModalStructure] = useState(false)
  const [editingUsine, setEditingUsine] = useState<Usine | null>(null)
  const [editingStructure, setEditingStructure] = useState<{ usineId: string; perimetreId: string; structure: StructureOrganisationnelle | null; parentId: string | null } | null>(null)
  const [expandedUsines, setExpandedUsines] = useState<Set<string>>(new Set())
  const [expandedStructures, setExpandedStructures] = useState<Set<string>>(new Set())

  const toggleUsine = (usineId: string) => {
    const newExpanded = new Set(expandedUsines)
    if (newExpanded.has(usineId)) {
      newExpanded.delete(usineId)
    } else {
      newExpanded.add(usineId)
    }
    setExpandedUsines(newExpanded)
  }

  const toggleStructure = (structureId: string) => {
    const newExpanded = new Set(expandedStructures)
    if (newExpanded.has(structureId)) {
      newExpanded.delete(structureId)
    } else {
      newExpanded.add(structureId)
    }
    setExpandedStructures(newExpanded)
  }

  const handleNewUsine = () => {
    setEditingUsine(null)
    setShowModalUsine(true)
  }

  const handleEditUsine = (usine: Usine) => {
    setEditingUsine(usine)
    setShowModalUsine(true)
  }

  const handleNewStructure = (usine: Usine, parentId: string | null = null) => {
    setEditingStructure({ usineId: usine.id, perimetreId: usine.perimetre.id, structure: null, parentId })
    setShowModalStructure(true)
  }

  const handleEditStructure = (usine: Usine, structure: StructureOrganisationnelle) => {
    setEditingStructure({ usineId: usine.id, perimetreId: usine.perimetre.id, structure, parentId: structure.parentId })
    setShowModalStructure(true)
  }

  const handleDeleteStructure = async (structureId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette structure ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/configuration/structures/${structureId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const renderStructure = (structure: StructureOrganisationnelle, usine: Usine, level: number = 0) => {
    const isExpanded = expandedStructures.has(structure.id)
    const hasChildren = structure.enfants && structure.enfants.length > 0
    const indent = level * 24

    const typeLabels: Record<string, string> = {
      site: 'Site',
      secteur: 'Secteur',
      unite: 'Unité',
      batiment: 'Bâtiment',
      etage: 'Étage'
    }

    const typeColors: Record<string, string> = {
      site: 'bg-blue-100 text-blue-800',
      secteur: 'bg-green-100 text-green-800',
      unite: 'bg-purple-100 text-purple-800',
      batiment: 'bg-yellow-100 text-yellow-800',
      etage: 'bg-gray-100 text-gray-800'
    }

    return (
      <div key={structure.id} className="mb-2">
        <div 
          className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors ${!structure.actif ? 'opacity-50' : ''}`}
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleStructure(structure.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          
          <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[structure.type] || 'bg-gray-100 text-gray-800'}`}>
            {typeLabels[structure.type] || structure.type}
          </span>
          
          <span className="flex-1 font-medium text-gray-900">{structure.nom}</span>
          
          {structure.code && (
            <span className="text-sm text-gray-500">({structure.code})</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditStructure(usine, structure)}
              className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-primary-600"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
            
            {structure.type === 'site' && (
              <button
                onClick={() => handleNewStructure(usine, structure.id)}
                className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-green-600"
                title="Ajouter une structure enfant"
              >
                <Plus size={16} />
              </button>
            )}
            
            {structure.type === 'secteur' && (
              <button
                onClick={() => handleNewStructure(usine, structure.id)}
                className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-green-600"
                title="Ajouter une structure enfant (secteur ou unité)"
              >
                <Plus size={16} />
              </button>
            )}
            
            {structure.type === 'unite' && (
              <button
                onClick={() => handleNewStructure(usine, structure.id)}
                className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-purple-600"
                title="Ajouter une structure enfant"
              >
                <Plus size={16} />
              </button>
            )}
            
            <button
              onClick={() => handleDeleteStructure(structure.id)}
              className="p-2 hover:bg-red-50 rounded text-gray-600 hover:text-red-600"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6">
            {structure.enfants!.map(child => renderStructure(child, usine, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleNewUsine}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau site
        </button>
      </div>

      <div className="space-y-4">
        {usines.map((usine) => {
          const isExpanded = expandedUsines.has(usine.id)
          const hasStructures = usine.structures && usine.structures.length > 0

          return (
            <div key={usine.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="text-primary-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">{usine.nom}</h3>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 ml-9">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{usine.adresse}</span>
                    </div>
                    {usine.secteurActivite && (
                      <div>
                        <span className="font-medium">Secteur d'activité :</span> {usine.secteurActivite}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Périmètre :</span> {usine.perimetre.nom}
                    </div>
                    {usine.numeroUrgence && (
                      <div>
                        <span className="font-medium">Numéro d'urgence :</span> {usine.numeroUrgence}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleEditUsine(usine)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Edit size={18} />
                  Modifier
                </button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Structure organisationnelle</h4>
                  <button
                    onClick={() => handleNewStructure(usine, null)}
                    className="btn btn-sm btn-primary flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Nouveau secteur ou unité
                  </button>
                </div>

                  {hasStructures ? (
                    <div>
                      {usine.structures!.map(structure => renderStructure(structure, usine, 0))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune structure organisationnelle définie</p>
                    <button
                      onClick={() => handleNewStructure(usine, null)}
                      className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Créer la première structure
                    </button>
                    </div>
                  )}
              </div>
            </div>
          )
        })}

        {usines.length === 0 && (
          <div className="card text-center py-12">
            <Building2 className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-500 mb-4">Aucun site enregistré</p>
            <button
              onClick={handleNewUsine}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Créer le premier site
            </button>
          </div>
        )}
      </div>

      {showModalUsine && (
        <ModalNouvelleUsine
          usine={editingUsine}
          perimetres={perimetres}
          onClose={() => {
            setShowModalUsine(false)
            setEditingUsine(null)
          }}
          onSave={() => {
            window.location.reload()
          }}
        />
      )}

      {showModalStructure && editingStructure && (
        <ModalStructureOrganisationnelle
          usineId={editingStructure.usineId}
          perimetreId={editingStructure.perimetreId}
          structure={editingStructure.structure}
          parentId={editingStructure.parentId}
          onClose={() => {
            setShowModalStructure(false)
            setEditingStructure(null)
          }}
          onSave={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

