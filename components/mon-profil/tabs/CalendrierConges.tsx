'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Conge {
  id: string
  type: string
  dateDebut: Date
  dateFin: Date
  statut: string
  commentaire: string | null
}

interface CalendrierCongesProps {
  conges: Conge[]
}

export default function CalendrierConges({ conges }: CalendrierCongesProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getCongesForDate = (date: Date) => {
    return conges.filter(conge => {
      const debut = new Date(conge.dateDebut)
      const fin = new Date(conge.dateFin)
      return date >= debut && date <= fin
    })
  }

  const statutColors: Record<string, string> = {
    en_attente: 'bg-yellow-200 border-yellow-400',
    valide: 'bg-green-200 border-green-400',
    refuse: 'bg-red-200 border-red-400',
    annule: 'bg-gray-200 border-gray-400',
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const days = []
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  // Jours vides au début
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h4 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h4>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="aspect-square"></div>
          }

          const date = new Date(year, month, day)
          const congesDuJour = getCongesForDate(date)
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <div
              key={day}
              className={`aspect-square border border-gray-200 rounded-lg p-1 ${
                isToday ? 'bg-primary-50 border-primary-300' : 'bg-white'
              }`}
            >
              <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
              <div className="space-y-1">
                {congesDuJour.slice(0, 2).map((conge) => (
                  <div
                    key={conge.id}
                    className={`text-xs p-1 rounded border ${statutColors[conge.statut] || 'bg-gray-200'}`}
                    title={`${conge.type} - ${conge.statut}`}
                  >
                    {conge.type}
                  </div>
                ))}
                {congesDuJour.length > 2 && (
                  <div className="text-xs text-gray-500">+{congesDuJour.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
          <span className="text-sm text-gray-600">En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
          <span className="text-sm text-gray-600">Validé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
          <span className="text-sm text-gray-600">Refusé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
          <span className="text-sm text-gray-600">Annulé</span>
        </div>
      </div>
    </div>
  )
}
