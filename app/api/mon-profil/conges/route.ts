import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les congés du salarié
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (!user.salarieId) {
      return NextResponse.json(
        { error: 'Aucun salarié associé' },
        { status: 404 }
      )
    }

    const conges = await prisma.conge.findMany({
      where: { salarieId: user.salarieId },
      orderBy: { dateDebut: 'desc' }
    })

    return NextResponse.json(conges)
  } catch (error) {
    console.error('Error fetching conges:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des congés' },
      { status: 500 }
    )
  }
}

// POST - Créer une demande de congé
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { salarieId, type, dateDebut, dateFin, dureeJours, dureeHeures, commentaire } = body

    if (!salarieId || !type || !dateDebut || !dateFin) {
      return NextResponse.json(
        { error: 'Les champs type, dateDebut et dateFin sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le salarié appartient à l'utilisateur
    if (user.salarieId !== salarieId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez demander des congés que pour votre propre compte' },
        { status: 403 }
      )
    }

    const conge = await prisma.conge.create({
      data: {
        salarieId,
        type,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        dureeJours: dureeJours ? parseFloat(dureeJours) : null,
        dureeHeures: dureeHeures ? parseFloat(dureeHeures) : null,
        commentaire: commentaire || null,
        statut: 'en_attente'
      }
    })

    return NextResponse.json(conge, { status: 201 })
  } catch (error) {
    console.error('Error creating conge:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande de congé' },
      { status: 500 }
    )
  }
}
