import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer toutes les affectations d'une intervention
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params
    const affectations = await prisma.affectationIntervention.findMany({
      where: {
        interventionId: id,
        actif: true
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            photoUrl: true,
            poste: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(affectations)
  } catch (error) {
    console.error('Error fetching affectations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des affectations' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle affectation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { salarieId, role } = body

    if (!salarieId || !role) {
      return NextResponse.json(
        { error: 'salarieId et role sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'intervention existe et récupérer ses dates
    const intervention = await prisma.intervention.findUnique({
      where: { id },
      select: {
        id: true,
        dateDebut: true,
        dateFin: true
      }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    // Utiliser les dates de l'intervention
    const dateDebut = intervention.dateDebut || new Date()
    const dateFin = intervention.dateFin || null

    // Vérifier que le salarié existe
    const salarie = await prisma.salarie.findUnique({
      where: { id: salarieId }
    })

    if (!salarie) {
      return NextResponse.json(
        { error: 'Salarié non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si une affectation existe déjà (même si inactive)
    const existingAffectation = await prisma.affectationIntervention.findFirst({
      where: {
        interventionId: id,
        salarieId: salarieId
      }
    })

    let affectation

    if (existingAffectation) {
      // Réactiver l'affectation existante
      affectation = await prisma.affectationIntervention.update({
        where: { id: existingAffectation.id },
        data: {
          role,
          dateDebut: dateDebut instanceof Date ? dateDebut : new Date(dateDebut),
          dateFin: dateFin ? (dateFin instanceof Date ? dateFin : new Date(dateFin)) : null,
          actif: true
        },
        include: {
          salarie: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
              photoUrl: true,
              poste: true
            }
          }
        }
      })
    } else {
      // Créer une nouvelle affectation
      affectation = await prisma.affectationIntervention.create({
        data: {
          interventionId: id,
          salarieId,
          role,
          dateDebut: dateDebut instanceof Date ? dateDebut : new Date(dateDebut),
          dateFin: dateFin ? (dateFin instanceof Date ? dateFin : new Date(dateFin)) : null
        },
        include: {
          salarie: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
              photoUrl: true,
              poste: true
            }
          }
        }
      })
    }

    return NextResponse.json(affectation, { status: 201 })
  } catch (error) {
    console.error('Error creating affectation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'affectation' },
      { status: 500 }
    )
  }
}
