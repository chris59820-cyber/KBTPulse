import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer toutes les affectations de planning
export async function GET() {
  try {
    const affectations = await prisma.affectationPlanning.findMany({
      include: {
        salarie: true,
        chantier: true
      },
      orderBy: { date: 'asc' }
    })
    return NextResponse.json(affectations)
  } catch (error) {
    console.error('Error fetching planning:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du planning' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle affectation de planning
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, heureDebut, heureFin, salarieId, chantierId, description } = body

    if (!date || !salarieId || !chantierId) {
      return NextResponse.json(
        { error: 'La date, le salarié et le chantier sont requis' },
        { status: 400 }
      )
    }

    const affectation = await prisma.affectationPlanning.create({
      data: {
        date: new Date(date),
        heureDebut,
        heureFin,
        salarieId,
        chantierId,
        description
      }
    })

    return NextResponse.json(affectation, { status: 201 })
  } catch (error) {
    console.error('Error creating planning:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'affectation' },
      { status: 500 }
    )
  }
}
