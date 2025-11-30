import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer tous les périmètres
export async function GET() {
  try {
    const user = await getCurrentUser()
    // Permettre l'accès en lecture aux rôles autorisés à gérer les actualités
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const perimetres = await prisma.perimetre.findMany({
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json(perimetres)
  } catch (error) {
    console.error('Error fetching perimetres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des périmètres' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau périmètre
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'CAFF' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nom, adresse, ville, codePostal, latitude, longitude, description } = body

    if (!nom || !adresse) {
      return NextResponse.json(
        { error: 'Le nom et l\'adresse sont requis' },
        { status: 400 }
      )
    }

    const perimetre = await prisma.perimetre.create({
      data: {
        nom,
        adresse,
        ville: ville || null,
        codePostal: codePostal || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description || null,
        actif: true
      }
    })

    return NextResponse.json(perimetre, { status: 201 })
  } catch (error) {
    console.error('Error creating perimetre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du périmètre' },
      { status: 500 }
    )
  }
}
