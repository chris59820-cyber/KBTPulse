import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les absences d'un salarié (congés avec type "Absente" ou statut inactif)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer les congés avec type "Absente" ou statut "inactif" ou "congé"
    const congesAbsences = await prisma.conge.findMany({
      where: {
        salarieId: params.id,
        statut: 'valide',
        OR: [
          { type: 'Absente' },
          // On peut aussi vérifier le statut du salarié
        ]
      },
      orderBy: { dateDebut: 'desc' }
    })

    // Vérifier aussi le statut du salarié
    const salarie = await prisma.salarie.findUnique({
      where: { id: params.id },
      select: { statut: true }
    })

    const absences = [...congesAbsences]
    
    // Si le salarié a un statut "inactif" ou "congé", ajouter une absence générale
    if (salarie && (salarie.statut === 'inactif' || salarie.statut === 'congé')) {
      absences.push({
        id: 'statut',
        type: 'Absente',
        dateDebut: null,
        dateFin: null,
        commentaire: `Statut: ${salarie.statut}`,
        statut: 'valide'
      } as any)
    }

    return NextResponse.json(absences)
  } catch (error) {
    console.error('Error fetching absences:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des absences' },
      { status: 500 }
    )
  }
}



