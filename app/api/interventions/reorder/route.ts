import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

// PUT - Mettre à jour l'ordre des interventions
export async function PUT(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { interventionIds } = body

    if (!Array.isArray(interventionIds)) {
      return NextResponse.json(
        { error: 'interventionIds doit être un tableau' },
        { status: 400 }
      )
    }

    // Mettre à jour l'ordre de chaque intervention dans une transaction
    await prisma.$transaction(
      interventionIds.map((id: string, index: number) =>
        prisma.intervention.update({
          where: { id },
          data: { ordre: index }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error reordering interventions:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'ordre des interventions' },
      { status: 500 }
    )
  }
}

