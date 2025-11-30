'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Building2, Briefcase, ExternalLink, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type ViewType = 'jour' | 'semaine' | 'mois'

interface Affectation {
  id: string
  date: Date
  heureDebut: string | null
  heureFin: string | null
  salarie: {
    id: string
    nom: string
    prenom: string
    poste: string
  }
  chantier: {
    id: string
    nom: string
    adresse: string | null
  }
  description: string | null
}

interface Intervention {
  id: string
  titre: string
  dateDebut: Date
  dateFin: Date | null
  statut: string
  chantier: {
    id: string
    nom: string
  }
  responsable: {
    id: string
    nom: string
    prenom: string
  } | null
}

interface CalendrierPlanningProps {
  user: any
}

export default function CalendrierPlanning({ user }: CalendrierPlanningProps) {
  const [view, setView] = useState<ViewType>('mois')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [affectations, setAffectations] = useState<Affectation[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDayModal, setShowDayModal] = useState(false)
  const [timeRangeStart, setTimeRangeStart] = useState('06:00')
  const [timeRangeEnd, setTimeRangeEnd] = useState('20:00')
  const [conges, setConges] = useState<any[]>([])
  const [formations, setFormations] = useState<any[]>([])
  const [salariesAbsents, setSalariesAbsents] = useState<any[]>([])
  const [loadingDayData, setLoadingDayData] = useState(false)

  useEffect(() => {
    loadCalendarData()
  }, [currentDate, view])

  const loadCalendarData = async () => {
    setLoading(true)
    try {
      const startDate = getStartDate()
      const endDate = getEndDate()

      const response = await fetch(
        `/api/planning/calendrier?dateDebut=${startDate.toISOString()}&dateFin=${endDate.toISOString()}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setAffectations(data.affectations.map((a: any) => ({
          ...a,
          date: new Date(a.date)
        })))
        setInterventions(data.interventions.map((i: any) => ({
          ...i,
          dateDebut: new Date(i.dateDebut),
          dateFin: i.dateFin ? new Date(i.dateFin) : null
        })))
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = () => {
    const date = new Date(currentDate)
    switch (view) {
      case 'jour':
        date.setHours(0, 0, 0, 0)
        return date
      case 'semaine':
        const day = date.getDay()
        // Convertir pour que lundi = 0, mardi = 1, etc.
        const dayOfWeek = day === 0 ? 6 : day - 1
        const diff = date.getDate() - dayOfWeek
        date.setDate(diff)
        date.setHours(0, 0, 0, 0)
        return date
      case 'mois':
        date.setDate(1)
        date.setHours(0, 0, 0, 0)
        return date
    }
  }

  const getEndDate = () => {
    const date = new Date(currentDate)
    switch (view) {
      case 'jour':
        date.setHours(23, 59, 59, 999)
        return date
      case 'semaine':
        const start = getStartDate()
        start.setDate(start.getDate() + 6)
        start.setHours(23, 59, 59, 999)
        return start
      case 'mois':
        date.setMonth(date.getMonth() + 1)
        date.setDate(0)
        date.setHours(23, 59, 59, 999)
        return date
    }
  }

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    switch (view) {
      case 'jour':
        newDate.setDate(newDate.getDate() - 1)
        break
      case 'semaine':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'mois':
        newDate.setMonth(newDate.getMonth() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    switch (view) {
      case 'jour':
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'semaine':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'mois':
        newDate.setMonth(newDate.getMonth() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    setView('jour')
  }

  // Fonction helper pour formater une date en YYYY-MM-DD en utilisant l'heure locale
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleOpenDayModal = async (date: Date) => {
    setSelectedDate(date)
    setShowDayModal(true)
    setLoadingDayData(true)
    
    try {
      // Utiliser l'heure locale au lieu de UTC pour éviter les décalages d'un jour
      const dateStr = formatDateToYYYYMMDD(date)
      const response = await fetch(`/api/planning/journee?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setConges(data.conges || [])
        setFormations(data.formations || [])
        setSalariesAbsents(data.salariesAbsents || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoadingDayData(false)
    }
  }

  const closeDayModal = () => {
    setShowDayModal(false)
    setSelectedDate(null)
  }

  // Générer les tranches horaires de 15 minutes
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  // Convertir une heure en minutes depuis minuit
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Vérifier si une affectation ou intervention est dans une tranche horaire
  const isInTimeSlot = (startTime: string | null, endTime: string | null, slot: string): boolean => {
    if (!startTime || !endTime) return false
    const slotMinutes = timeToMinutes(slot)
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    return slotMinutes >= startMinutes && slotMinutes < endMinutes
  }

  // Fonction pour calculer la date de Pâques (algorithme de Gauss)
  const getEasterDate = (year: number): Date => {
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31)
    const day = ((h + l - 7 * m + 114) % 31) + 1
    return new Date(year, month - 1, day)
  }

  // Fonction pour calculer le numéro de semaine ISO (semaine commençant le lundi)
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Fonction pour déterminer si une date est un jour férié en France
  const isHoliday = (date: Date): boolean => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    // Jours fériés fixes
    const fixedHolidays = [
      { month: 0, day: 1 },   // 1er janvier - Jour de l'an
      { month: 4, day: 1 },   // 1er mai - Fête du travail
      { month: 4, day: 8 },   // 8 mai - Victoire en Europe
      { month: 6, day: 14 },  // 14 juillet - Fête nationale
      { month: 7, day: 15 },  // 15 août - Assomption
      { month: 10, day: 1 },  // 1er novembre - Toussaint
      { month: 10, day: 11 }, // 11 novembre - Armistice
      { month: 11, day: 25 }, // 25 décembre - Noël
    ]

    // Vérifier les jours fériés fixes
    if (fixedHolidays.some(h => h.month === month && h.day === day)) {
      return true
    }

    // Calculer Pâques et les jours fériés variables
    const easter = getEasterDate(year)
    const easterMonday = new Date(easter)
    easterMonday.setDate(easter.getDate() + 1)
    
    const ascension = new Date(easter)
    ascension.setDate(easter.getDate() + 39)
    
    const whitMonday = new Date(easter)
    whitMonday.setDate(easter.getDate() + 50)

    // Vérifier les jours fériés variables
    const variableHolidays = [easterMonday, ascension, whitMonday]
    return variableHolidays.some(holiday => 
      holiday.getMonth() === month && holiday.getDate() === day
    )
  }

  // Fonction pour déterminer si une date est un week-end ou un jour férié
  const isWeekendOrHoliday = (date: Date): boolean => {
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 || isHoliday(date)
  }

  const getAffectationsForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return affectations.filter(aff => aff.date.toDateString() === dateStr)
  }

  const getInterventionsForDate = (date: Date) => {
    return interventions.filter(interv => {
      const dateStr = date.toDateString()
      const debut = interv.dateDebut.toDateString()
      const fin = interv.dateFin ? interv.dateFin.toDateString() : null
      return dateStr === debut || (fin && dateStr === fin) || 
             (date >= interv.dateDebut && (!interv.dateFin || date <= interv.dateFin))
    })
  }

  const formatViewTitle = () => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

    switch (view) {
      case 'jour':
        const weekNumberJour = getWeekNumber(currentDate)
        return `${dayNames[currentDate.getDay()]} ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()} (S${weekNumberJour})`
      case 'semaine':
        const start = getStartDate()
        const end = getEndDate()
        const weekNumber = getWeekNumber(start)
        return `Semaine ${weekNumber} - du ${start.getDate()} ${monthNames[start.getMonth()]} au ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`
      case 'mois':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }
  }

  const renderJourView = () => {
    const affectationsJour = getAffectationsForDate(currentDate)
    const interventionsJour = getInterventionsForDate(currentDate)
    const isToday = currentDate.toDateString() === new Date().toDateString()
    const isWeekendOrHoliday = currentDate.getDay() === 0 || currentDate.getDay() === 6 || isHoliday(currentDate)

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border-2 ${
          isToday 
            ? 'border-primary-500 bg-primary-50' 
            : isWeekendOrHoliday 
              ? 'border-gray-300 bg-gray-100' 
              : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isWeekendOrHoliday ? 'text-gray-500' : 'text-gray-900'
            }`}>
              {formatDate(currentDate)}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenDayModal(currentDate)}
                className="btn btn-primary flex items-center gap-2 text-sm"
                title="Ouvrir la vue détaillée par tranches horaires"
              >
                <ExternalLink size={14} />
                Vue horaires
              </button>
              {isToday && <span className="badge badge-primary">Aujourd'hui</span>}
              {isWeekendOrHoliday && !isToday && (
                <span className="badge badge-secondary">Week-end / Jour férié</span>
              )}
            </div>
          </div>

          {affectationsJour.length === 0 && interventionsJour.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune activité prévue</p>
          ) : (
            <div className="space-y-3">
              {affectationsJour.map(aff => (
                <div key={aff.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="text-blue-600 mt-1" size={16} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        Affectation - {aff.salarie.prenom} {aff.salarie.nom}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} />
                          <span>{aff.chantier.nom}</span>
                        </div>
                        {aff.heureDebut && aff.heureFin && (
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>{aff.heureDebut} - {aff.heureFin}</span>
                          </div>
                        )}
                        {aff.description && <p>{aff.description}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {interventionsJour.map(interv => (
                <div key={interv.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Briefcase className="text-orange-600 mt-1" size={16} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{interv.titre}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} />
                          <span>{interv.chantier.nom}</span>
                        </div>
                        {interv.responsable && (
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{interv.responsable.prenom} {interv.responsable.nom}</span>
                          </div>
                        )}
                        <span className={`badge badge-sm ${
                          interv.statut === 'terminee' ? 'badge-success' :
                          interv.statut === 'en_cours' ? 'badge-warning' :
                          interv.statut === 'planifiee' ? 'badge-info' :
                          'badge-secondary'
                        }`}>
                          {interv.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSemaineView = () => {
    const start = getStartDate()
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      days.push(date)
    }

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const weekNumber = getWeekNumber(start)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-primary-600">
            Semaine {weekNumber}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const affectationsJour = getAffectationsForDate(date)
            const interventionsJour = getInterventionsForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isWeekendOrHoliday = date.getDay() === 0 || date.getDay() === 6 || isHoliday(date)
            const monthNamesShort = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                                     'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
            const dayNamesShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
            const yearShort = date.getFullYear().toString().slice(-2)

            return (
              <div
                key={index}
                className={`min-h-[120px] border rounded-lg p-2 relative ${
                  isToday 
                    ? 'border-primary-500 bg-primary-50' 
                    : isWeekendOrHoliday 
                      ? 'border-gray-300 bg-gray-100' 
                      : 'border-gray-200 bg-white'
                } ${!isCurrentMonth ? 'opacity-50' : ''} hover:bg-gray-50 transition-colors`}
              >
                <div className={`text-xs font-medium mb-2 text-center ${
                  isToday 
                    ? 'text-primary-700' 
                    : isWeekendOrHoliday 
                      ? 'text-gray-500' 
                      : 'text-gray-900'
                }`}>
                  {dayNamesShort[date.getDay()]} {date.getDate()} {monthNamesShort[date.getMonth()]} {yearShort}
                </div>
                <div className="space-y-1">
                  {affectationsJour.slice(0, 2).map(aff => (
                    <div
                      key={aff.id}
                      className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                      title={`${aff.salarie.prenom} ${aff.salarie.nom} - ${aff.chantier.nom}`}
                    >
                      <Clock size={10} className="inline mr-1" />
                      {aff.salarie.prenom} {aff.salarie.nom.charAt(0)}.
                    </div>
                  ))}
                  {interventionsJour.slice(0, 2).map(interv => (
                    <div
                      key={interv.id}
                      className="text-xs p-1 bg-orange-100 text-orange-800 rounded truncate"
                      title={interv.titre}
                    >
                      <Briefcase size={10} className="inline mr-1" />
                      {interv.titre.substring(0, 15)}...
                    </div>
                  ))}
                  {(affectationsJour.length + interventionsJour.length) > 4 && (
                    <div className="text-xs text-gray-500">
                      +{(affectationsJour.length + interventionsJour.length) - 4} autres
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenDayModal(date)
                  }}
                  className="absolute bottom-2 right-2 p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  title="Ouvrir la journée"
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMoisView = () => {
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    // Convertir pour que lundi = 0, mardi = 1, ..., dimanche = 6
    const firstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    const days: (number | null)[] = []
    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    // Calculer les numéros de semaine pour chaque ligne
    const weeks: number[] = []
    for (let i = 0; i < days.length; i += 7) {
      const firstDayInWeek = days[i]
      if (firstDayInWeek !== null) {
        const date = new Date(year, month, firstDayInWeek)
        weeks.push(getWeekNumber(date))
      } else {
        // Si le premier jour de la semaine est null, utiliser le premier jour réel
        const firstRealDay = days.find((d, idx) => d !== null && idx >= i)
        if (firstRealDay !== null && firstRealDay !== undefined) {
          const date = new Date(year, month, firstRealDay)
          weeks.push(getWeekNumber(date))
        } else {
          weeks.push(0)
        }
      }
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-[40px_repeat(7,1fr)] gap-1">
          <div className="text-center font-semibold text-gray-700 py-2 text-xs">
            S
          </div>
          {dayNames.map((day, index) => (
            <div key={index} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[40px_repeat(7,1fr)] gap-1">
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => {
            const weekStart = weekIndex * 7
            const weekDays = days.slice(weekStart, weekStart + 7)
            const weekNumber = weeks[weekIndex] || 0

            return (
              <React.Fragment key={weekIndex}>
                {/* Colonne numéro de semaine */}
                <div className="flex items-center justify-center">
                  <div className="text-xs font-semibold text-primary-600">
                    {weekNumber > 0 ? `S${weekNumber}` : ''}
                  </div>
                </div>
                {/* Jours de la semaine */}
                {weekDays.map((day, dayIndex) => {
                  if (day === null) {
                    return <div key={`${weekIndex}-${dayIndex}`} className="aspect-square"></div>
                  }

                  const date = new Date(year, month, day)
                  const affectationsJour = getAffectationsForDate(date)
                  const interventionsJour = getInterventionsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isWeekendOrHoliday = date.getDay() === 0 || date.getDay() === 6 || isHoliday(date)
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const monthNamesShort = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                                           'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
                  const dayNamesShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
                  const yearShort = date.getFullYear().toString().slice(-2)

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}-${day}`}
                      className={`aspect-square border rounded-lg p-1 relative ${
                        isToday 
                          ? 'border-primary-500 bg-primary-50' 
                          : isWeekendOrHoliday 
                            ? 'border-gray-300 bg-gray-100' 
                            : 'border-gray-200 bg-white'
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <div className={`text-xs font-medium mb-1 leading-tight text-center ${
                        isToday 
                          ? 'text-primary-700' 
                          : isWeekendOrHoliday 
                            ? 'text-gray-500' 
                            : isCurrentMonth
                              ? 'text-gray-900'
                              : 'text-gray-400'
                      }`}>
                        {dayNamesShort[date.getDay()]} {day} {monthNamesShort[date.getMonth()]} {yearShort}
                      </div>
                      <div className="space-y-0.5">
                        {affectationsJour.slice(0, 2).map(aff => (
                          <div
                            key={aff.id}
                            className="text-xs p-0.5 bg-blue-100 text-blue-800 rounded truncate"
                            title={`${aff.salarie.prenom} ${aff.salarie.nom} - ${aff.chantier.nom}`}
                          >
                            <Clock size={8} className="inline mr-0.5" />
                            {aff.salarie.prenom.charAt(0)}.{aff.salarie.nom.charAt(0)}
                          </div>
                        ))}
                        {interventionsJour.slice(0, 2).map(interv => (
                          <div
                            key={interv.id}
                            className="text-xs p-0.5 bg-orange-100 text-orange-800 rounded truncate"
                            title={interv.titre}
                          >
                            <Briefcase size={8} className="inline mr-0.5" />
                            {interv.titre.substring(0, 10)}...
                          </div>
                        ))}
                        {(affectationsJour.length + interventionsJour.length) > 4 && (
                          <div className="text-xs text-gray-500">
                            +{(affectationsJour.length + interventionsJour.length) - 4}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDayModal(date)
                        }}
                        className="absolute bottom-1 right-1 p-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        title="Ouvrir la journée"
                      >
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <h2 className="ml-4 text-xl font-semibold text-gray-900">
            {formatViewTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('jour')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              view === 'jour' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setView('semaine')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              view === 'semaine' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setView('mois')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              view === 'mois' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Vue du calendrier */}
      <div className="card">
        {view === 'jour' && renderJourView()}
        {view === 'semaine' && renderSemaineView()}
        {view === 'mois' && renderMoisView()}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
          <span className="text-gray-600">Affectation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
          <span className="text-gray-600">Intervention</span>
        </div>
      </div>

      {/* Modale de vue détaillée de la journée */}
      {showDayModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-[90vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* En-tête */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {formatDate(selectedDate)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Vue détaillée par tranches horaires (15 minutes)
                  </p>
                </div>
                <button
                  onClick={closeDayModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              {/* Liste des personnes absentes */}
              {!loadingDayData && (conges.length > 0 || formations.length > 0 || salariesAbsents.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Personnes en congé, formation ou absentes
                  </h4>
                  <div className="space-y-2">
                    {/* RTT */}
                    {conges.filter((c: any) => c.type === 'RTT').length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-700">RTT:</span>
                        {conges.filter((c: any) => c.type === 'RTT').map((conge: any) => (
                          <span
                            key={conge.id}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                          >
                            {conge.salarie.prenom} {conge.salarie.nom}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* RC */}
                    {conges.filter((c: any) => c.type === 'RC').length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-700">RC:</span>
                        {conges.filter((c: any) => c.type === 'RC').map((conge: any) => (
                          <span
                            key={conge.id}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                          >
                            {conge.salarie.prenom} {conge.salarie.nom}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* RL */}
                    {conges.filter((c: any) => c.type === 'RL').length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-700">RL:</span>
                        {conges.filter((c: any) => c.type === 'RL').map((conge: any) => (
                          <span
                            key={conge.id}
                            className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs"
                          >
                            {conge.salarie.prenom} {conge.salarie.nom}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CP - Congés payés */}
                    {conges.filter((c: any) => c.type === 'CP').length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-700">CP:</span>
                        {conges.filter((c: any) => c.type === 'CP').map((conge: any) => (
                          <span
                            key={conge.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {conge.salarie.prenom} {conge.salarie.nom}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Formation */}
                    {formations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-700">Formation:</span>
                        {formations.map((formation: any) => (
                          <span
                            key={formation.id}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs"
                          >
                            {formation.salarie.prenom} {formation.salarie.nom}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Absente */}
                    {salariesAbsents.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-700">Absente:</span>
                        {salariesAbsents.map((salarie: any) => (
                          <span
                            key={salarie.id}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                          >
                            {salarie.prenom} {salarie.nom}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contrôles de plage horaire */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Plage horaire visible :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={timeRangeStart}
                    onChange={(e) => setTimeRangeStart(e.target.value)}
                    className="input text-sm w-32"
                  />
                  <span className="text-gray-500">à</span>
                  <input
                    type="time"
                    value={timeRangeEnd}
                    onChange={(e) => setTimeRangeEnd(e.target.value)}
                    className="input text-sm w-32"
                  />
                </div>
                <button
                  onClick={() => {
                    setTimeRangeStart('06:00')
                    setTimeRangeEnd('20:00')
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-1">
                {generateTimeSlots()
                  .filter(slot => {
                    const slotMinutes = timeToMinutes(slot)
                    const startMinutes = timeToMinutes(timeRangeStart)
                    const endMinutes = timeToMinutes(timeRangeEnd)
                    return slotMinutes >= startMinutes && slotMinutes < endMinutes
                  })
                  .map((slot, index) => {
                  const affectationsSlot = getAffectationsForDate(selectedDate).filter(aff => {
                    if (!aff.heureDebut || !aff.heureFin) return false
                    const slotMinutes = timeToMinutes(slot)
                    const startMinutes = timeToMinutes(aff.heureDebut)
                    const endMinutes = timeToMinutes(aff.heureFin)
                    // Vérifier si la tranche horaire est dans la plage de l'affectation
                    return slotMinutes >= startMinutes && slotMinutes < endMinutes
                  })
                  
                  const interventionsSlot = getInterventionsForDate(selectedDate).filter(interv => {
                    // Pour les interventions, on vérifie si elles couvrent cette tranche horaire
                    const intervStart = new Date(interv.dateDebut)
                    const intervEnd = interv.dateFin ? new Date(interv.dateFin) : null
                    
                    if (!intervEnd) return false
                    
                    // Vérifier si la date sélectionnée est dans la plage de l'intervention
                    const selectedDateStart = new Date(selectedDate)
                    selectedDateStart.setHours(0, 0, 0, 0)
                    const selectedDateEnd = new Date(selectedDate)
                    selectedDateEnd.setHours(23, 59, 59, 999)
                    
                    if (intervStart > selectedDateEnd || intervEnd < selectedDateStart) {
                      return false
                    }
                    
                    // Si l'intervention couvre toute la journée, l'afficher pour toutes les tranches
                    if (intervStart <= selectedDateStart && intervEnd >= selectedDateEnd) {
                      return true
                    }
                    
                    // Sinon, vérifier si la tranche horaire est dans la plage de l'intervention
                    const slotMinutes = timeToMinutes(slot)
                    const startMinutes = intervStart.toDateString() === selectedDate.toDateString() 
                      ? timeToMinutes(intervStart.toTimeString().slice(0, 5))
                      : 0
                    const endMinutes = intervEnd.toDateString() === selectedDate.toDateString()
                      ? timeToMinutes(intervEnd.toTimeString().slice(0, 5))
                      : 24 * 60
                    
                    return slotMinutes >= startMinutes && slotMinutes < endMinutes
                  })

                  const hasActivity = affectationsSlot.length > 0 || interventionsSlot.length > 0
                  const isQuarterHour = slot.endsWith(':00') || slot.endsWith(':30')
                  
                  // Vérifier si l'horaire est dans une plage à griser
                  const slotMinutes = timeToMinutes(slot)
                  const isNightTime = slotMinutes >= timeToMinutes('20:00') || slotMinutes < timeToMinutes('06:00')
                  const isBreakTime = 
                    (slotMinutes >= timeToMinutes('06:00') && slotMinutes < timeToMinutes('08:00')) || // 6h00 à 8h00
                    (slotMinutes >= timeToMinutes('12:00') && slotMinutes < timeToMinutes('13:00')) || // 12h00 à 13h00
                    (slotMinutes >= timeToMinutes('16:30') && slotMinutes < timeToMinutes('20:00')) // 16h30 à 20h00

                  return (
                    <div
                      key={slot}
                      className={`flex items-start gap-4 py-1 border-l-2 ${
                        hasActivity 
                          ? 'border-primary-500 bg-primary-50' 
                          : isNightTime
                            ? 'border-gray-600 bg-gray-300'
                            : isBreakTime
                              ? 'border-gray-400 bg-gray-100'
                              : isQuarterHour 
                                ? 'border-gray-300' 
                                : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-20 text-xs font-medium ${
                        isNightTime
                          ? 'text-gray-600'
                          : isBreakTime
                            ? 'text-gray-500'
                            : isQuarterHour 
                              ? 'text-gray-900' 
                              : 'text-gray-500'
                      }`}>
                        {slot}
                      </div>
                      <div className="flex-1 space-y-1">
                        {affectationsSlot.map(aff => (
                          <div
                            key={aff.id}
                            className="text-xs p-2 bg-blue-100 border border-blue-200 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-blue-600" />
                              <span className="font-medium text-blue-900">
                                {aff.salarie.prenom} {aff.salarie.nom}
                              </span>
                            </div>
                            <div className="text-blue-700 mt-1">
                              <Building2 size={10} className="inline mr-1" />
                              {aff.chantier.nom}
                            </div>
                            {aff.heureDebut && aff.heureFin && (
                              <div className="text-blue-600 text-xs mt-1">
                                {aff.heureDebut} - {aff.heureFin}
                              </div>
                            )}
                          </div>
                        ))}
                        {interventionsSlot.map(interv => (
                          <div
                            key={interv.id}
                            className="text-xs p-2 bg-orange-100 border border-orange-200 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase size={12} className="text-orange-600" />
                              <span className="font-medium text-orange-900">
                                {interv.titre}
                              </span>
                            </div>
                            <div className="text-orange-700 mt-1">
                              <Building2 size={10} className="inline mr-1" />
                              {interv.chantier.nom}
                            </div>
                            {interv.responsable && (
                              <div className="text-orange-600 text-xs mt-1">
                                <User size={10} className="inline mr-1" />
                                {interv.responsable.prenom} {interv.responsable.nom}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

