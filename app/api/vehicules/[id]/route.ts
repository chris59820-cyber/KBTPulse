import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer un véhicule par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const vehicule = await prisma.vehicule.findUnique({
      where: { id: params.id },
      include: {
        rdc: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
            telephone: true,
            email: true
          }
        },
        affectations: {
          include: {
            salarie: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                photoUrl: true,
                telephone: true,
                email: true
              }
            },
            intervention: {
              select: {
                id: true,
                titre: true,
                dateDebut: true
              }
            }
          },
          orderBy: { dateAttribution: 'desc' }
        },
        historiques: {
          orderBy: { date: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!vehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicule)
  } catch (error) {
    console.error('Error fetching vehicule:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du véhicule' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un véhicule
export async function PUT(
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
    const {
      type, marque, modele, immatriculation, dateAchat, kilometrage, statut,
      nombrePlaces, motorisation, plateauOuTole, proprietaire, rdcId,
      dureeLocation, dateProchaineMaintenance, typeCarburant, typeContratLocation,
      description, categorie, dateProchainControleTechnique
    } = body

    // Vérifier que l'immatriculation n'existe pas déjà (si elle a changé)
    if (immatriculation) {
      const existing = await prisma.vehicule.findUnique({
        where: { immatriculation }
      })

      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { error: 'Un véhicule avec cette immatriculation existe déjà' },
          { status: 400 }
        )
      }
    }

    const vehicule = await prisma.vehicule.update({
      where: { id: params.id },
      data: {
        type: type || undefined,
        marque: marque !== undefined ? (marque || null) : undefined,
        modele: modele !== undefined ? (modele || null) : undefined,
        immatriculation: immatriculation || undefined,
        dateAchat: dateAchat ? new Date(dateAchat) : dateAchat === null ? null : undefined,
        kilometrage: kilometrage !== undefined ? parseFloat(kilometrage) : undefined,
        statut: statut || undefined,
        nombrePlaces: nombrePlaces !== undefined ? (nombrePlaces ? parseInt(nombrePlaces) : null) : undefined,
        motorisation: motorisation !== undefined ? (motorisation || null) : undefined,
        plateauOuTole: plateauOuTole !== undefined ? (plateauOuTole || null) : undefined,
        proprietaire: proprietaire !== undefined ? (proprietaire || null) : undefined,
        rdcId: rdcId !== undefined ? (rdcId || null) : undefined,
        dureeLocation: dureeLocation !== undefined ? (dureeLocation || null) : undefined,
        dateProchaineMaintenance: dateProchaineMaintenance ? new Date(dateProchaineMaintenance) : dateProchaineMaintenance === null ? null : undefined,
        typeCarburant: typeCarburant !== undefined ? (typeCarburant || null) : undefined,
        typeContratLocation: typeContratLocation !== undefined ? (typeContratLocation || null) : undefined,
        description: description !== undefined ? (description || null) : undefined,
        categorie: categorie !== undefined ? (categorie || null) : undefined,
        dateProchainControleTechnique: dateProchainControleTechnique ? new Date(dateProchainControleTechnique) : dateProchainControleTechnique === null ? null : undefined
      }
    })

    return NextResponse.json(vehicule)

    return NextResponse.json(vehicule)
  } catch (error: any) {
    console.error('Error updating vehicule:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un véhicule avec cette immatriculation existe déjà' },
        { status: 400 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du véhicule' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un véhicule (soft delete en changeant le statut)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès
    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier qu'il n'y a pas d'affectations actives
    const affectationsActives = await prisma.affectationVehicule.count({
      where: {
        vehiculeId: params.id,
        dateRestitution: null
      }
    })

    if (affectationsActives > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un véhicule avec des affectations actives' },
        { status: 400 }
      )
    }

    // Soft delete en changeant le statut
    const vehicule = await prisma.vehicule.update({
      where: { id: params.id },
      data: { statut: 'hors_service' }
    })

    return NextResponse.json(vehicule)
  } catch (error: any) {
    console.error('Error deleting vehicule:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du véhicule' },
      { status: 500 }
    )
  }
}

