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
  { params }: { params: { model: string; id: string } }
) {
  try {
    await requireSpace('CONFIGURATION')

    const modelName = params.model
    const id = params.id
    const prismaModel = MODEL_MAP[modelName]

    if (!prismaModel || !prisma[prismaModel]) {
      return NextResponse.json(
        { error: `Modèle ${modelName} non trouvé` },
        { status: 404 }
      )
    }

    const model = prisma[prismaModel] as any
    const record = await model.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Enregistrement non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error: any) {
    console.error('Erreur GET database:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { model: string; id: string } }
) {
  try {
    await requireSpace('CONFIGURATION')

    const modelName = params.model
    const id = params.id
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
      if (key !== 'id') {
        // Convertir les dates si nécessaire
        if (key.includes('date') || key.includes('Date') || key.includes('createdAt') || key.includes('updatedAt')) {
          if (value) {
            cleanedData[key] = new Date(value as string)
          }
        } else {
          cleanedData[key] = value
        }
      }
    }

    const updatedRecord = await model.update({
      where: { id },
      data: cleanedData,
    })

    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    console.error('Erreur PUT database:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { model: string; id: string } }
) {
  try {
    await requireSpace('CONFIGURATION')

    const modelName = params.model
    const id = params.id
    const prismaModel = MODEL_MAP[modelName]

    if (!prismaModel || !prisma[prismaModel]) {
      return NextResponse.json(
        { error: `Modèle ${modelName} non trouvé` },
        { status: 404 }
      )
    }

    const model = prisma[prismaModel] as any
    await model.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur DELETE database:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

