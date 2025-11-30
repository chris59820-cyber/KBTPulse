import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PUT - Mettre à jour un auto-contrôle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, autoControleId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { verifie, commentaire } = body

    const autoControle = await prisma.autoControle.findUnique({
      where: { id: params.autoControleId }
    })

    if (!autoControle || autoControle.interventionId !== params.id) {
      return NextResponse.json(
        { error: 'Auto-contrôle non trouvé' },
        { status: 404 }
      )
    }

    const updated = await prisma.autoControle.update({
      where: { id: params.autoControleId },
      data: {
        verifie: verifie !== undefined ? verifie : autoControle.verifie,
        commentaire: commentaire !== undefined ? commentaire : autoControle.commentaire,
        verifiePar: verifie ? (user.salarieId || user.id) : null,
        dateVerification: verifie ? new Date() : null
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating auto controle:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'auto-contrôle' },
      { status: 500 }
    )
  }
}
