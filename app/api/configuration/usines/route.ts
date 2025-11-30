import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Créer un nouveau site
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['ADMIN', 'CAFF'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      nom,
      secteurActivite,
      adresse,
      perimetreId,
      numeroUrgence,
      latitudePoste,
      longitudePoste,
      latitudeRassemblement,
      longitudeRassemblement
    } = body

    if (!nom || !adresse || !perimetreId) {
      return NextResponse.json(
        { error: 'Le nom, l\'adresse et le périmètre sont requis' },
        { status: 400 }
      )
    }

    const usine = await prisma.usine.create({
      data: {
        nom,
        secteurActivite: secteurActivite || null,
        adresse,
        perimetreId,
        numeroUrgence: numeroUrgence || null,
        latitudePoste: latitudePoste ? parseFloat(latitudePoste) : null,
        longitudePoste: longitudePoste ? parseFloat(longitudePoste) : null,
        latitudeRassemblement: latitudeRassemblement ? parseFloat(latitudeRassemblement) : null,
        longitudeRassemblement: longitudeRassemblement ? parseFloat(longitudeRassemblement) : null
      }
    })

    return NextResponse.json(usine, { status: 201 })
  } catch (error: any) {
    console.error('Error creating usine:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un site avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du site' },
      { status: 500 }
    )
  }
}

// GET - Récupérer tous les sites
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['ADMIN', 'CAFF'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const usines = await prisma.usine.findMany({
      include: {
        perimetre: true,
        structures: {
          where: { parentId: null, actif: true },
          include: {
            enfants: {
              where: { actif: true },
              include: {
                enfants: {
                  where: { actif: true }
                }
              }
            }
          },
          orderBy: { ordre: 'asc' }
        }
      },
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json(usines)
  } catch (error) {
    console.error('Error fetching usines:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sites' },
      { status: 500 }
    )
  }
}

