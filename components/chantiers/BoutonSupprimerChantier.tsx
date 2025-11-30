'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface BoutonSupprimerChantierProps {
  chantierId: string
  chantierNom: string
  canDelete: boolean
}

export default function BoutonSupprimerChantier({ chantierId, chantierNom, canDelete }: BoutonSupprimerChantierProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le chantier "${chantierNom}" ?\n\nCette action est irréversible et supprimera également toutes les interventions associées.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/chantiers/${chantierId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/chantiers')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression du chantier')
        setLoading(false)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du chantier')
      setLoading(false)
    }
  }

  if (!canDelete) {
    return null
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-danger flex items-center gap-2"
      title="Supprimer le chantier"
    >
      <Trash2 size={18} />
      {loading ? 'Suppression...' : 'Supprimer'}
    </button>
  )
}


