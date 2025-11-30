import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Marquer une ressource comme restituée
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, resourceId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const resource = await prisma.ressourceIntervention.findUnique({
      where: { id: params.resourceId }
    })

    if (!resource || resource.interventionId !== params.id) {
      return NextResponse.json(
        { error: 'Ressource non trouvée' },
        { status: 404 }
      )
    }

    const updated = await prisma.ressourceIntervention.update({
      where: { id: params.resourceId },
      data: {
        restitue: true,
        dateRestitution: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error marking resource as returned:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la restitution de la ressource' },
      { status: 500 }
    )
  }
}
