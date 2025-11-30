import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PUT - Mettre à jour l'avancement d'une intervention
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { avancement, dureeReelle, dateDebutReelle, dateFinReelle } = body

    if (avancement === undefined) {
      return NextResponse.json(
        { error: 'L\'avancement est requis' },
        { status: 400 }
      )
    }

    if (avancement < 0 || avancement > 100) {
      return NextResponse.json(
        { error: 'L\'avancement doit être entre 0 et 100' },
        { status: 400 }
      )
    }

    // Vérifier l'accès
    const intervention = await prisma.intervention.findUnique({
      where: { id: params.id }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    // Mise à jour
    const updated = await prisma.intervention.update({
      where: { id: params.id },
      data: {
        avancement: parseInt(avancement),
        dureeReelle: dureeReelle ? parseFloat(dureeReelle) : undefined,
        dateDebutReelle: dateDebutReelle ? new Date(dateDebutReelle) : undefined,
        dateFinReelle: dateFinReelle ? new Date(dateFinReelle) : undefined,
        // Mettre à jour le statut selon l'avancement
        statut: avancement === 100 ? 'terminee' : 
                avancement > 0 ? 'en_cours' : 
                intervention.statut
      }
    })

    // Calculer le montant du reste à faire si montant total disponible
    if (updated.montantTotal && updated.avancement < 100) {
      const resteAFaire = updated.montantTotal - (updated.montantTotal * updated.avancement / 100)
      await prisma.intervention.update({
        where: { id: params.id },
        data: { montantResteAFaire: resteAFaire }
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating avancement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'avancement' },
      { status: 500 }
    )
  }
}
