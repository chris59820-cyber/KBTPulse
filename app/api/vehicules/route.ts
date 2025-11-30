import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer tous les véhicules
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const vehicules = await prisma.vehicule.findMany({
      include: {
        affectations: {
          where: {
            dateRestitution: null // Affectations actives uniquement
          },
          include: {
            salarie: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                photoUrl: true
              }
            },
            intervention: {
              select: {
                id: true,
                titre: true
              }
            }
          }
        },
        _count: {
          select: {
            historiques: true,
            documents: true
          }
        }
      },
      orderBy: { immatriculation: 'asc' }
    })

    return NextResponse.json(vehicules)
  } catch (error) {
    console.error('Error fetching vehicules:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des véhicules' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau véhicule
export async function POST(request: NextRequest) {
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
    const {
      type, marque, modele, immatriculation, dateAchat, kilometrage, statut,
      nombrePlaces, motorisation, plateauOuTole, proprietaire, rdcId,
      dureeLocation, dateProchaineMaintenance, typeCarburant, typeContratLocation,
      description, categorie, dateProchainControleTechnique, historiques
    } = body

    if (!type || !immatriculation) {
      return NextResponse.json(
        { error: 'Le type et l\'immatriculation sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'immatriculation n'existe pas déjà
    const existing = await prisma.vehicule.findUnique({
      where: { immatriculation }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un véhicule avec cette immatriculation existe déjà' },
        { status: 400 }
      )
    }

    // Créer le véhicule avec tous les nouveaux champs
    const vehicule = await prisma.$transaction(async (tx) => {
      const newVehicule = await tx.vehicule.create({
        data: {
          type,
          marque: marque || null,
          modele: modele || null,
          immatriculation,
          dateAchat: dateAchat ? new Date(dateAchat) : null,
          kilometrage: kilometrage ? parseFloat(kilometrage) : 0,
          statut: statut || 'disponible',
          nombrePlaces: nombrePlaces ? parseInt(nombrePlaces) : null,
          motorisation: motorisation || null,
          plateauOuTole: plateauOuTole || null,
          proprietaire: proprietaire || null,
          rdcId: rdcId || null,
          dureeLocation: dureeLocation || null,
          dateProchaineMaintenance: dateProchaineMaintenance ? new Date(dateProchaineMaintenance) : null,
          typeCarburant: typeCarburant || null,
          typeContratLocation: typeContratLocation || null,
          description: description || null,
          categorie: categorie || null,
          dateProchainControleTechnique: dateProchainControleTechnique ? new Date(dateProchainControleTechnique) : null
        }
      })

      // Ajouter les historiques d'entretien si fournis
      if (historiques && Array.isArray(historiques) && historiques.length > 0) {
        for (const hist of historiques) {
          if (hist.date && hist.type) {
            await tx.historiqueVehicule.create({
              data: {
                vehiculeId: newVehicule.id,
                type: hist.type,
                date: new Date(hist.date),
                description: hist.description || null,
                kilometrage: hist.kilometrage ? parseFloat(hist.kilometrage) : null,
                cout: hist.cout ? parseFloat(hist.cout) : null,
                commentaire: hist.commentaire || null
              }
            })
          }
        }
      }

      return newVehicule
    })

    return NextResponse.json(vehicule, { status: 201 })
  } catch (error: any) {
    console.error('Error creating vehicule:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack
    })
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'champ'
      return NextResponse.json(
        { 
          error: `Un véhicule avec cette ${field} existe déjà`,
          details: error.meta?.target ? `Champ en conflit: ${error.meta.target.join(', ')}` : undefined
        },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Erreur de relation : Le RDC responsable sélectionné n\'existe pas',
          details: error.meta?.field_name || error.message
        },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2011') {
      return NextResponse.json(
        { 
          error: 'Erreur de validation : Un champ requis est manquant ou invalide',
          details: error.meta?.constraint || error.message
        },
        { status: 400 }
      )
    }
    
    // Erreur générique avec détails en mode développement
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du véhicule',
        details: process.env.NODE_ENV === 'development' 
          ? error.message || 'Erreur inconnue' 
          : 'Veuillez vérifier les données saisies',
        code: error.code || 'UNKNOWN_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    )
  }
}

