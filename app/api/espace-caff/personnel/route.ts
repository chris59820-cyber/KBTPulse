import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer tous les salariés pour la gestion CAFF
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const salaries = await prisma.salarie.findMany({
      include: {
        evaluations: {
          orderBy: { date: 'desc' },
          take: 5
        },
        evenementsRH: {
          orderBy: { date: 'desc' },
          take: 10
        }
      },
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching personnel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du personnel' },
      { status: 500 }
    )
  }
}
