import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// PUT - Restituer une affectation (mise à jour avec photos et fiche de constat de restitution)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; affectationId: string } }
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
    const dateRestitution = formData.get('dateRestitution') as string
    const kilometrage = formData.get('kilometrage') as string || null
    const commentaire = formData.get('commentaire') as string || null
    const photoRestitution = formData.get('photoRestitution') as File | null
    const ficheConstatRestitution = formData.get('ficheConstatRestitution') as File | null

    const affectation = await prisma.affectationVehicule.findUnique({
      where: { id: params.affectationId },
      include: { vehicule: true }
    })

    if (!affectation || affectation.vehiculeId !== params.id) {
      return NextResponse.json(
        { error: 'Affectation non trouvée' },
        { status: 404 }
      )
    }

    if (affectation.dateRestitution) {
      return NextResponse.json(
        { error: 'Cette affectation a déjà été restituée' },
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

    let photoRestitutionUrl: string | null = affectation.photoRestitution
    let ficheConstatRestitutionUrl: string | null = affectation.ficheConstatRestitution

    if (photoRestitution && photoRestitution.size > 0) {
      photoRestitutionUrl = await uploadFile(photoRestitution, 'photo-restitution')
    }

    if (ficheConstatRestitution && ficheConstatRestitution.size > 0) {
      ficheConstatRestitutionUrl = await uploadFile(ficheConstatRestitution, 'fiche-constat-restitution')
    }

    // Mettre à jour l'affectation
    const updatedAffectation = await prisma.affectationVehicule.update({
      where: { id: params.affectationId },
      data: {
        dateRestitution: dateRestitution ? new Date(dateRestitution) : new Date(),
        photoRestitution: photoRestitutionUrl,
        ficheConstatRestitution: ficheConstatRestitutionUrl,
        commentaire: commentaire || affectation.commentaire
      }
    })

    // Mettre à jour le kilométrage du véhicule si fourni
    if (kilometrage) {
      const nouveauKilometrage = parseFloat(kilometrage)
      if (nouveauKilometrage > affectation.vehicule.kilometrage) {
        await prisma.vehicule.update({
          where: { id: params.id },
          data: { kilometrage: nouveauKilometrage }
        })
      }
    }

    // Mettre à jour le statut du véhicule si c'était la seule affectation active
    const autresAffectationsActives = await prisma.affectationVehicule.count({
      where: {
        vehiculeId: params.id,
        dateRestitution: null,
        id: { not: params.affectationId }
      }
    })

    if (autresAffectationsActives === 0) {
      await prisma.vehicule.update({
        where: { id: params.id },
        data: { statut: 'disponible' }
      })
    }

    return NextResponse.json(updatedAffectation)
  } catch (error: any) {
    console.error('Error updating affectation:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Affectation non trouvée' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la restitution de l\'affectation' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une affectation (uniquement si non restituée et avec droits élevés)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; affectationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les droits d'accès (CAFF ou ADMIN uniquement)
    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const affectation = await prisma.affectationVehicule.findUnique({
      where: { id: params.affectationId }
    })

    if (!affectation || affectation.vehiculeId !== params.id) {
      return NextResponse.json(
        { error: 'Affectation non trouvée' },
        { status: 404 }
      )
    }

    // Si l'affectation n'est pas restituée, mettre à jour le statut du véhicule
    if (!affectation.dateRestitution) {
      const autresAffectationsActives = await prisma.affectationVehicule.count({
        where: {
          vehiculeId: params.id,
          dateRestitution: null,
          id: { not: params.affectationId }
        }
      })

      if (autresAffectationsActives === 0) {
        await prisma.vehicule.update({
          where: { id: params.id },
          data: { statut: 'disponible' }
        })
      }
    }

    await prisma.affectationVehicule.delete({
      where: { id: params.affectationId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting affectation:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Affectation non trouvée' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'affectation' },
      { status: 500 }
    )
  }
}

