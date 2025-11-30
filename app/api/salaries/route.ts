import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tous les salariés
export async function GET() {
  try {
    const salaries = await prisma.salarie.findMany({
      orderBy: { nom: 'asc' }
    })
    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching salaries:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des salariés' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau salarié
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, prenom, email, telephone, poste, dateEmbauche, statut } = body

    if (!nom || !prenom || !poste) {
      return NextResponse.json(
        { error: 'Le nom, prénom et poste sont requis' },
        { status: 400 }
      )
    }

    const salarie = await prisma.salarie.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        poste,
        dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : new Date(),
        statut: statut || 'actif'
      }
    })

    return NextResponse.json(salarie, { status: 201 })
  } catch (error: any) {
    console.error('Error creating salarie:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du salarié' },
      { status: 500 }
    )
  }
}
