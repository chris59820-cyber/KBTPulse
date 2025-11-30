import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Valider ou refuser un congé RTT
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { valide, commentaire } = body

    const conge = await prisma.conge.findUnique({
      where: { id: params.id },
      include: {
        salarie: true
      }
    })

    if (!conge) {
      return NextResponse.json(
        { error: 'Congé non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le congé appartient à un salarié du RDC
    const salarieRDC = user.salarieId ? await prisma.salarie.findUnique({
      where: { id: user.salarieId }
    }) : null

    if (conge.salarie.rdcId !== salarieRDC?.id && conge.salarie.rdcId !== user.id) {
      return NextResponse.json(
        { error: 'Ce congé ne concerne pas vos salariés' },
        { status: 403 }
      )
    }

    // Vérifier que c'est un RTT et qu'il ne dépasse pas 1 jour
    if (conge.type === 'RTT' && valide) {
      const duree = conge.dureeJours || (conge.dureeHeures ? conge.dureeHeures / 8 : 1)
      if (duree > 1) {
        return NextResponse.json(
          { error: 'Les RTT ne peuvent excéder 1 journée' },
          { status: 400 }
        )
      }
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
