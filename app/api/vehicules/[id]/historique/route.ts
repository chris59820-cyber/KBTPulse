import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer l'historique d'un véhicule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const historiques = await prisma.historiqueVehicule.findMany({
      where: { vehiculeId: params.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(historiques)
  } catch (error) {
    console.error('Error fetching historique:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    )
  }
}

// POST - Ajouter un élément à l'historique
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès
    if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, date, description, kilometrage, cout, commentaire } = body

    if (!type || !date) {
      return NextResponse.json(
        { error: 'Le type et la date sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le véhicule existe
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: params.id }
    })

    if (!vehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le kilométrage du véhicule si un nouveau kilométrage est fourni
    if (kilometrage !== undefined && kilometrage !== null) {
      if (parseFloat(kilometrage) > vehicule.kilometrage) {
        await prisma.vehicule.update({
          where: { id: params.id },
          data: { kilometrage: parseFloat(kilometrage) }
        })
      }
    }

    const historique = await prisma.historiqueVehicule.create({
      data: {
        vehiculeId: params.id,
        type,
        date: new Date(date),
        description: description || null,
        kilometrage: kilometrage ? parseFloat(kilometrage) : null,
        cout: cout ? parseFloat(cout) : null,
        commentaire: commentaire || null
      }
    })

    return NextResponse.json(historique, { status: 201 })
  } catch (error) {
    console.error('Error creating historique:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'historique' },
      { status: 500 }
    )
  }
}

