import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PUT - Mettre à jour un document d'intervention
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, docId: string } }
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
    const { contenu } = body

    const document = await prisma.documentIntervention.findUnique({
      where: { id: params.docId }
    })

    if (!document || document.interventionId !== params.id) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    if (!document.peutEcrire) {
      return NextResponse.json(
        { error: 'Ce document n\'est pas éditable' },
        { status: 403 }
      )
    }

    const updated = await prisma.documentIntervention.update({
      where: { id: params.docId },
      data: {
        contenu: contenu || null
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du document' },
      { status: 500 }
    )
  }
}
