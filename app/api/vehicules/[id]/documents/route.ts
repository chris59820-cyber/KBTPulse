import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET - Récupérer les documents d'un véhicule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const documents = await prisma.documentVehicule.findMany({
      where: { vehiculeId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    )
  }
}

// POST - Ajouter un document à un véhicule
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
    const type = formData.get('type') as string
    const nom = formData.get('nom') as string
    const dateExpiration = formData.get('dateExpiration') as string || null
    const file = formData.get('file') as File | null

    if (!type || !nom) {
      return NextResponse.json(
        { error: 'Le type et le nom sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le véhicule existe
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: params.id }
    })

    if (!vehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }

    let fichierUrl: string | null = null

    // Upload du fichier si présent
    if (file && file.size > 0) {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'vehicules', 'documents')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const fileName = `doc-${timestamp}-${randomString}.${extension}`
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)
      
      fichierUrl = `/uploads/vehicules/documents/${fileName}`
    }

    const document = await prisma.documentVehicule.create({
      data: {
        vehiculeId: params.id,
        type,
        nom,
        fichierUrl,
        dateExpiration: dateExpiration ? new Date(dateExpiration) : null
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du document' },
      { status: 500 }
    )
  }
}

