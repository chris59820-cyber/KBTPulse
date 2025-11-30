import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer une affectation par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const affectation = await prisma.affectationPlanning.findUnique({
      where: { id: params.id },
      include: {
        salarie: true,
        chantier: true
      }
    })

    if (!affectation) {
      return NextResponse.json(
        { error: 'Affectation non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(affectation)
  } catch (error) {
    console.error('Error fetching planning:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'affectation' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une affectation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { date, heureDebut, heureFin, salarieId, chantierId, description } = body

    const affectation = await prisma.affectationPlanning.update({
      where: { id: params.id },
      data: {
        date: date ? new Date(date) : undefined,
        heureDebut,
        heureFin,
        salarieId,
        chantierId,
        description
      }
    })

    return NextResponse.json(affectation)
  } catch (error) {
    console.error('Error updating planning:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'affectation' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une affectation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.affectationPlanning.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Affectation supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting planning:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'affectation' },
      { status: 500 }
    )
  }
}
