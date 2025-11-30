'use client'

import { useState } from 'react'
import { TrendingUp, Briefcase, Users, Calendar, Download, History } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface TabTableauBordProps {
  user: any
}

export default function TabTableauBord({ user }: TabTableauBordProps) {
  const [loading, setLoading] = useState(false)
  const [dateDebut, setDateDebut] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [dateFin, setDateFin] = useState(() => new Date().toISOString().split('T')[0])

  const handleExportPDF = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/espace-caff/export/pdf?dateDebut=${dateDebut}&dateFin=${dateFin}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport-caff-${dateDebut}-${dateFin}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/espace-caff/export/excel?dateDebut=${dateDebut}&dateFin=${dateFin}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport-caff-${dateDebut}-${dateFin}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error)
    } finally {
      setLoading(false)
    }
  }

  // Données de test pour les graphiques
  const dataInterventions = [
    { mois: 'Jan', terminees: 45, enCours: 12, planifiees: 18 },
    { mois: 'Fév', terminees: 52, enCours: 15, planifiees: 22 },
    { mois: 'Mar', terminees: 58, enCours: 18, planifiees: 25 },
    { mois: 'Avr', terminees: 65, enCours: 20, planifiees: 28 },
  ]

  return (
    <div className="space-y-6">
      {/* En-tête avec export */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tableau de bord administrateur</h3>
        <div className="flex gap-2">
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="input text-sm"
            />
            <span className="text-gray-500">à</span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="input text-sm"
            />
          </div>
          <button
            onClick={handleExportPDF}
            disabled={loading}
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            <Download size={18} />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            <Download size={18} />
            Excel
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="text-primary-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-sm text-gray-600">Total salariés</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Briefcase className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-sm text-gray-600">Interventions</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-sm text-gray-600">Affectations</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="text-yellow-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-sm text-gray-600">Performance</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Évolution des interventions</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataInterventions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="terminees" fill="#10b981" />
              <Bar dataKey="enCours" fill="#3b82f6" />
              <Bar dataKey="planifiees" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Tendances générales</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataInterventions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="terminees" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="enCours" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historique des interventions et affectations */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History size={20} />
          Historique des interventions et affectations
        </h4>
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            Les données détaillées seront disponibles une fois les API routes créées
          </p>
        </div>
      </div>
    </div>
  )
}
