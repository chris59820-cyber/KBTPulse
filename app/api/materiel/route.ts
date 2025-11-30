import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tout le matériel
export async function GET() {
  try {
    const materiel = await prisma.materiel.findMany({
      orderBy: { nom: 'asc' }
    })
    return NextResponse.json(materiel)
  } catch (error) {
    console.error('Error fetching materiel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du matériel' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau matériel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, description, categorie, quantite, unite, prixUnitaire, statut } = body

    if (!nom || !categorie) {
      return NextResponse.json(
        { error: 'Le nom et la catégorie sont requis' },
        { status: 400 }
      )
    }

    const materiel = await prisma.materiel.create({
      data: {
        nom,
        description,
        categorie,
        quantite: quantite ? parseInt(quantite) : 1,
        unite: unite || 'unité',
        prixUnitaire: prixUnitaire ? parseFloat(prixUnitaire) : null,
        statut: statut || 'disponible'
      }
    })

    return NextResponse.json(materiel, { status: 201 })
  } catch (error) {
    console.error('Error creating materiel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du matériel' },
      { status: 500 }
    )
  }
}
