import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSpace } from '@/lib/middleware'

// Mapping des noms de modèles vers les méthodes Prisma
const MODEL_MAP: Record<string, keyof typeof prisma> = {
  'user': 'user',
  'salarie': 'salarie',
  'client': 'client',
  'chantier': 'chantier',
  'intervention': 'intervention',
  'codeAffaire': 'codeAffaire',
  'donneurOrdre': 'donneurOrdre',
  'perimetre': 'perimetre',
  'usine': 'usine',
  'vehicule': 'vehicule',
  'materiel': 'materiel',
  'actualite': 'actualite',
  'messageSecurite': 'messageSecurite',
  'conversation': 'conversation',
  'message': 'message',
  'conge': 'conge',
  'competence': 'competence',
  'habilitation': 'habilitation',
  'autorisation': 'autorisation',
  'visiteMedicale': 'visiteMedicale',
  'restrictionMedicale': 'restrictionMedicale',
  'contactUrgence': 'contactUrgence',
  'materielFourni': 'materielFourni',
  'enginConfie': 'enginConfie',
  'materielAttribue': 'materielAttribue',
  'documentPersonnel': 'documentPersonnel',
  'formationSalarie': 'formationSalarie',
  'accesSiteClient': 'accesSiteClient',
  'pointage': 'pointage',
  'horaire': 'horaire',
  'evaluation': 'evaluation',
  'evenementRH': 'evenementRH',
  'affectationPlanning': 'affectationPlanning',
  'affectationIntervention': 'affectationIntervention',
  'affectationVehicule': 'affectationVehicule',
  'affectationPersonnel': 'affectationPersonnel',
  'structureOrganisationnelle': 'structureOrganisationnelle',
  'salariePerimetre': 'salariePerimetre',
  'materielUtilise': 'materielUtilise',
  'documentIntervention': 'documentIntervention',
  'ressourceIntervention': 'ressourceIntervention',
  'photoIntervention': 'photoIntervention',
  'autoControle': 'autoControle',
  'messageIntervention': 'messageIntervention',
  'checklistSecurite': 'checklistSecurite',
  'participantConversation': 'participantConversation',
  'publication': 'publication',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { model: string } }
) {
  try {
    await requireSpace('CONFIGURATION')

    const modelName = params.model
    const prismaModel = MODEL_MAP[modelName]

    if (!prismaModel || !prisma[prismaModel]) {
      return NextResponse.json(
        { error: `Modèle ${modelName} non trouvé` },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const model = prisma[prismaModel] as any

    // Compter le total
    const total = await model.count()

    // Récupérer les données avec pagination
    const data = await model.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      total,
      page,
      totalPages,
      limit,
    })
  } catch (error: any) {
    console.error('Erreur GET database:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { model: string } }
) {
  try {
    await requireSpace('CONFIGURATION')

    const modelName = params.model
    const prismaModel = MODEL_MAP[modelName]

    if (!prismaModel || !prisma[prismaModel]) {
      return NextResponse.json(
        { error: `Modèle ${modelName} non trouvé` },
        { status: 404 }
      )
    }

    const body = await request.json()
    const model = prisma[prismaModel] as any

    // Nettoyer les champs null ou vides
    const cleanedData: any = {}
    for (const [key, value] of Object.entries(body)) {
      if (value !== null && value !== '') {
        // Convertir les dates si nécessaire
        if (key.includes('date') || key.includes('Date') || key.includes('createdAt') || key.includes('updatedAt')) {
          cleanedData[key] = value ? new Date(value as string) : undefined
        } else {
          cleanedData[key] = value
        }
      }
    }

    const newRecord = await model.create({
      data: cleanedData,
    })

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error: any) {
    console.error('Erreur POST database:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

