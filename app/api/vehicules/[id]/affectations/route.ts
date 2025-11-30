import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET - Récupérer les affectations d'un véhicule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const affectations = await prisma.affectationVehicule.findMany({
      where: { vehiculeId: params.id },
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

    const formData = await request.formData()
    const salarieId = formData.get('salarieId') as string || null
    const interventionId = formData.get('interventionId') as string || null
    const dateAttribution = formData.get('dateAttribution') as string
    const commentaire = formData.get('commentaire') as string || null
    const photoAttribution = formData.get('photoAttribution') as File | null
    const ficheConstatAttribution = formData.get('ficheConstatAttribution') as File | null

    if (!dateAttribution) {
      return NextResponse.json(
        { error: 'La date d\'attribution est requise' },
        { status: 400 }
      )
    }

    // Vérifier que le véhicule est disponible
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: params.id }
    })

    if (!vehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a pas d'affectation active
    const affectationActive = await prisma.affectationVehicule.findFirst({
      where: {
        vehiculeId: params.id,
        dateRestitution: null
      }
    })

    if (affectationActive) {
      return NextResponse.json(
        { error: 'Ce véhicule est déjà affecté. Veuillez d\'abord restituer l\'affectation en cours.' },
        { status: 400 }
      )
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'vehicules', 'affectations')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Fonction helper pour uploader un fichier
    const uploadFile = async (file: File, prefix: string): Promise<string> => {
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const fileName = `${prefix}-${timestamp}-${randomString}.${extension}`
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)
      
      return `/uploads/vehicules/affectations/${fileName}`
    }

    let photoAttributionUrl: string | null = null
    let ficheConstatAttributionUrl: string | null = null

    if (photoAttribution && photoAttribution.size > 0) {
      photoAttributionUrl = await uploadFile(photoAttribution, 'photo-attribution')
    }

    if (ficheConstatAttribution && ficheConstatAttribution.size > 0) {
      ficheConstatAttributionUrl = await uploadFile(ficheConstatAttribution, 'fiche-constat-attribution')
    }

    // Mettre à jour le statut du véhicule
    await prisma.vehicule.update({
      where: { id: params.id },
      data: { statut: 'en_utilisation' }
    })

    const affectation = await prisma.affectationVehicule.create({
      data: {
        vehiculeId: params.id,
        salarieId,
        interventionId,
        dateAttribution: new Date(dateAttribution),
        photoAttribution: photoAttributionUrl,
        ficheConstatAttribution: ficheConstatAttributionUrl,
        commentaire
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
    })

    return NextResponse.json(affectation, { status: 201 })
  } catch (error) {
    console.error('Error creating affectation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'affectation' },
      { status: 500 }
    )
  }
}

