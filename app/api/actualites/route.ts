import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer toutes les actualités
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const actualites = await prisma.actualite.findMany({
      orderBy: { datePublication: 'desc' },
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    return NextResponse.json(actualites)
  } catch (error) {
    console.error('Error fetching actualites:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des actualités' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle actualité
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès (PREPA, CE, RDC, CAFF, ADMIN)
    if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titre, description, contenu, imageUrl, images, perimetreId, publie } = body

    if (!titre) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      )
    }

    const actualite = await prisma.actualite.create({
      data: {
        titre,
        description: description || null,
        contenu: contenu || null,
        imageUrl: imageUrl || null,
        images: images ? JSON.stringify(images) : null,
        perimetreId: perimetreId || null,
        auteurId: user.id,
        publie: publie !== undefined ? publie : true,
        datePublication: new Date()
      },
      include: {
        perimetre: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    return NextResponse.json(actualite, { status: 201 })
  } catch (error) {
    console.error('Error creating actualite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'actualité' },
      { status: 500 }
    )
  }
}
