import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PUT - Activer/Désactiver un utilisateur
export async function PUT(
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
    const { actif } = body

    // Ne pas permettre de se désactiver soi-même
    if (params.id === user.id && !actif) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous désactiver vous-même' },
        { status: 403 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { actif: actif !== undefined ? actif : true }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating user actif:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    )
  }
}
