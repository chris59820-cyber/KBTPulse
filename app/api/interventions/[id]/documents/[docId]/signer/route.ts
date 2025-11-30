import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Signer un document d'intervention
export async function POST(
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
    const { signataire } = body

    const document = await prisma.documentIntervention.findUnique({
      where: { id: params.docId }
    })

    if (!document || document.interventionId !== params.id) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    if (document.signe) {
      return NextResponse.json(
        { error: 'Document déjà signé' },
        { status: 400 }
      )
    }

    const updated = await prisma.documentIntervention.update({
      where: { id: params.docId },
      data: {
        signe: true,
        signataire: signataire || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.identifiant,
        dateSignature: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error signing document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la signature du document' },
      { status: 500 }
    )
  }
}
