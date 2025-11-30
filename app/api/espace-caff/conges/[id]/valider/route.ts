import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Valider ou refuser un congé (CAFF)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { valide, commentaire } = body

    const conge = await prisma.conge.findUnique({
      where: { id: params.id }
    })

    if (!conge) {
      return NextResponse.json(
        { error: 'Congé non trouvé' },
        { status: 404 }
      )
    }

    const updated = await prisma.conge.update({
      where: { id: params.id },
      data: {
        statut: valide ? 'valide' : 'refuse',
        commentaireValidation: commentaire || null,
        validePar: user.id,
        dateValidation: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error validating conge:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation du congé' },
      { status: 500 }
    )
  }
}
