import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PUT - Mettre à jour le rôle d'un utilisateur
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
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Le rôle est requis' },
        { status: 400 }
      )
    }

    // Vérifier que le rôle est valide
    const rolesValides = ['PREPA', 'CE', 'RDC', 'CAFF', 'RH', 'AUTRE', 'OUVRIER', 'ADMIN']
    if (!rolesValides.includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Ne pas permettre de modifier son propre rôle
    if (params.id === user.id && role !== user.role) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 403 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rôle' },
      { status: 500 }
    )
  }
}
