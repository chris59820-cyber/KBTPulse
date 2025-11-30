'use client'

import { useState, useRef } from 'react'
import ListeSalaries from './ListeSalaries'
import FormSalarieWrapper from './FormSalarieWrapper'

interface Perimetre {
  id: string
  nom: string
}

interface Salarie {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  poste: string
  fonction: string | null
  matricule: string | null
  dateEmbauche: Date
  typeContrat: string | null
  tauxHoraire: number | null
  niveauAcces: string | null
  photoUrl: string | null
  user: {
    role: string
  } | null
}

interface ListeSalariesWrapperProps {
  salaries: Salarie[]
  perimetres: Perimetre[]
}

export default function ListeSalariesWrapper({ salaries, perimetres }: ListeSalariesWrapperProps) {
  const refreshListRef = useRef<(() => void) | null>(null)

  const handleSave = () => {
    if (refreshListRef.current) {
      refreshListRef.current()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulaire de création/modification */}
      <div className="lg:col-span-1">
        <div className="card sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nouveau salarié
          </h3>
          <FormSalarieWrapper perimetres={perimetres} onSave={handleSave} />
        </div>
      </div>

      {/* Liste des salariés */}
      <div className="lg:col-span-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Liste des salariés ({salaries.length})
            </h3>
          </div>
          <ListeSalaries 
            salaries={salaries} 
            perimetres={perimetres}
            refreshListRef={refreshListRef}
          />
        </div>
      </div>
    </div>
  )
}

