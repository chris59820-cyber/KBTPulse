'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

// Graphique d'activité des chantiers
export function ActiviteChantiers({ data }: { data: { statut: string; count: number }[] }) {
  const chartData = data.map(item => ({
    name: item.statut.replace('_', ' '),
    value: item.count
  }))

  if (chartData.length === 0) {
    chartData.push({ name: 'Aucune donnée', value: 1 })
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Graphique des interventions hebdomadaires
export function InterventionsHebdo({ data }: { data: any[] }) {
  // Données d'exemple si aucune donnée n'est fournie
  const chartData = data.length > 0 ? data : [
    { name: 'Lun', interventions: 12 },
    { name: 'Mar', interventions: 19 },
    { name: 'Mer', interventions: 15 },
    { name: 'Jeu', interventions: 22 },
    { name: 'Ven', interventions: 18 },
    { name: 'Sam', interventions: 8 },
    { name: 'Dim', interventions: 5 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="interventions" stroke="#0088FE" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Graphique d'utilisation des ressources
export function UtilisationRessources({ 
  salariesUtilisation, 
  materielUtilisation 
}: { 
  salariesUtilisation: number
  materielUtilisation: number 
}) {
  const chartData = [
    { name: 'Salariés', utilisation: salariesUtilisation, max: 100 },
    { name: 'Matériel', utilisation: materielUtilisation, max: 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="utilisation" fill="#00C49F" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Export par défaut pour faciliter l'import
export default {
  ActiviteChantiers,
  InterventionsHebdo,
  UtilisationRessources
}
