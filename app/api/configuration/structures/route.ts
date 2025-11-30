import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Créer une nouvelle structure organisationnelle
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
      type,
      nom,
      code,
      description,
      numeroPDP,
      parentId,
      ordre,
      usineId,
      perimetreId
    } = body

    if (!nom || !type || (!usineId && !perimetreId)) {
      return NextResponse.json(
        { error: 'Le nom, le type et le site ou le périmètre sont requis' },
        { status: 400 }
      )
    }

    // Récupérer le périmètre
    let finalPerimetreId = perimetreId
    
    if (!finalPerimetreId && usineId) {
      // Récupérer le périmètre du site
      const usine = await prisma.usine.findUnique({
        where: { id: usineId },
        select: { perimetreId: true }
      })

      if (!usine) {
        return NextResponse.json(
          { error: 'Site non trouvé' },
          { status: 404 }
        )
      }

      finalPerimetreId = usine.perimetreId
    }

    if (!finalPerimetreId) {
      return NextResponse.json(
        { error: 'Périmètre non trouvé' },
        { status: 400 }
      )
    }

    // Vérifier la hiérarchie : si parentId existe, vérifier que le parent existe
    let finalUsineId = usineId || null
    if (parentId) {
      const parent = await prisma.structureOrganisationnelle.findUnique({
        where: { id: parentId },
        select: { id: true, type: true, usineId: true }
      })

      if (!parent) {
        return NextResponse.json(
          { error: 'Structure parente non trouvée' },
          { status: 404 }
        )
      }

      // Hériter le usineId du parent si non spécifié
      if (!finalUsineId && parent.usineId) {
        finalUsineId = parent.usineId
      }

      // Vérifier que le type est cohérent avec la hiérarchie
      // secteur -> secteur ou unite
      // unite -> unite
      const validHierarchy: Record<string, string[]> = {
        secteur: ['secteur', 'unite'],
        unite: ['unite']
      }

      if (validHierarchy[parent.type] && !validHierarchy[parent.type].includes(type)) {
        return NextResponse.json(
          { error: `Un ${parent.type} ne peut contenir qu'un ${validHierarchy[parent.type].join(' ou ')}` },
          { status: 400 }
        )
      }
    } else {
      // Si pas de parent, on peut créer un secteur ou une unité au niveau racine
      // Les secteurs peuvent être créés sans parent (au niveau du périmètre du site)
      if (type !== 'secteur' && type !== 'unite') {
        return NextResponse.json(
          { error: 'Seules les structures de type "secteur" ou "unité" peuvent être créées sans parent' },
          { status: 400 }
        )
      }
    }

    const structure = await prisma.structureOrganisationnelle.create({
      data: {
        type,
        nom,
        code: code || null,
        description: description || null,
        numeroPDP: numeroPDP || null,
        parentId: parentId || null,
        ordre: ordre ? parseInt(ordre) : null,
        perimetreId: finalPerimetreId,
        usineId: finalUsineId
      }
    })

    return NextResponse.json(structure, { status: 201 })
  } catch (error: any) {
    console.error('Error creating structure:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Une structure avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la structure' },
      { status: 500 }
    )
  }
}

// GET - Récupérer toutes les structures
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const usineId = searchParams.get('usineId')

    let where: any = { actif: true }
    
    if (usineId) {
      // Filtrer les structures par usineId directement
      where.usineId = usineId
    }

    const structures = await prisma.structureOrganisationnelle.findMany({
      where,
      include: {
        parent: true,
        enfants: {
          where: { actif: true },
          include: {
            enfants: {
              where: { actif: true }
            }
          }
        }
      },
      orderBy: [
        { ordre: 'asc' },
        { nom: 'asc' }
      ]
    })

    return NextResponse.json(structures)
  } catch (error) {
    console.error('Error fetching structures:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des structures' },
      { status: 500 }
    )
  }
}

