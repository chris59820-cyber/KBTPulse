import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: Promise<{
    model: string
  }>
}

// GET - Récupérer tous les enregistrements d'une table
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions : CAFF et ADMIN seulement
    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { model } = await params
    
    // Mapping des noms d'URL vers les noms de modèles Prisma
    const modelMapping: Record<string, string> = {
      'user': 'User',
      'salarie': 'Salarie',
      'competence': 'Competence',
      'habilitation': 'Habilitation',
      'autorisation': 'Autorisation',
      'visitemedicale': 'VisiteMedicale',
      'restrictionmedicale': 'RestrictionMedicale',
      'publication': 'Publication',
      'actualite': 'Actualite',
      'messagesecurite': 'MessageSecurite',
      'conversation': 'Conversation',
      'participantconversation': 'ParticipantConversation',
      'message': 'Message',
      'conge': 'Conge',
      'contacturgence': 'ContactUrgence',
      'materielfourni': 'MaterielFourni',
      'enginconfie': 'EnginConfie',
      'materielattribue': 'MaterielAttribue',
      'documentpersonnel': 'DocumentPersonnel',
      'formationsalarie': 'FormationSalarie',
      'accesiteclient': 'AccesSiteClient',
      'client': 'Client',
      'intervention': 'Intervention',
      'materiel': 'Materiel',
      'materielutilise': 'MaterielUtilise',
      'documentintervention': 'DocumentIntervention',
      'affectationintervention': 'AffectationIntervention',
      'ressourceintervention': 'RessourceIntervention',
      'photointervention': 'PhotoIntervention',
      'autocontrole': 'AutoControle',
      'messageintervention': 'MessageIntervention',
      'checklistsecurite': 'ChecklistSecurite',
      'affectationplanning': 'AffectationPlanning',
      'perimetre': 'Perimetre',
      'salarieperimetre': 'SalariePerimetre',
      'chantier': 'Chantier',
      'donneurordre': 'DonneurOrdre',
      'codeaffaire': 'CodeAffaire',
      'vehicule': 'Vehicule',
      'affectationvehicule': 'AffectationVehicule',
      'pointage': 'Pointage',
      'horaire': 'Horaire',
      'evaluation': 'Evaluation',
      'evenementrh': 'EvenementRH',
      'affectationpersonnel': 'AffectationPersonnel',
      'usine': 'Usine',
      'structureorganisationnelle': 'StructureOrganisationnelle'
    }

    const modelNameLower = model.toLowerCase()
    const modelName = modelMapping[modelNameLower]

    if (!modelName) {
      return NextResponse.json(
        { error: `Modèle ${model} non trouvé` },
        { status: 404 }
      )
    }

    // Prisma utilise camelCase pour accéder aux modèles
    // CodeAffaire -> codeAffaire, VisiteMedicale -> visiteMedicale, etc.
    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1)

    // Récupérer les données de manière dynamique
    // Essayer d'abord avec createdAt, sinon sans orderBy
    let data
    try {
      data = await (prisma as any)[prismaModelName].findMany({
        take: 1000, // Limiter à 1000 enregistrements pour éviter les problèmes de performance
        orderBy: { createdAt: 'desc' }
      })
    } catch (error: any) {
      // Si createdAt n'existe pas, essayer avec id
      try {
        data = await (prisma as any)[prismaModelName].findMany({
          take: 1000,
          orderBy: { id: 'desc' }
        })
      } catch {
        // Sinon, récupérer sans orderBy
        data = await (prisma as any)[prismaModelName].findMany({
          take: 1000
        })
      }
    }

    // Récupérer les colonnes du modèle si des données existent
    let columns: string[] = []
    if (data.length > 0) {
      columns = Object.keys(data[0])
    }

    return NextResponse.json({
      data,
      columns,
      count: data.length
    })
  } catch (error: any) {
    console.error('Error fetching database records:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel enregistrement
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { model } = await params
    const body = await request.json()

    // Mapping des noms d'URL vers les noms de modèles Prisma
    const modelMapping: Record<string, string> = {
      'user': 'User', 'salarie': 'Salarie', 'competence': 'Competence',
      'habilitation': 'Habilitation', 'autorisation': 'Autorisation',
      'visitemedicale': 'VisiteMedicale', 'restrictionmedicale': 'RestrictionMedicale',
      'publication': 'Publication', 'actualite': 'Actualite',
      'messagesecurite': 'MessageSecurite', 'conversation': 'Conversation',
      'participantconversation': 'ParticipantConversation', 'message': 'Message',
      'conge': 'Conge', 'contacturgence': 'ContactUrgence',
      'materielfourni': 'MaterielFourni', 'enginconfie': 'EnginConfie',
      'materielattribue': 'MaterielAttribue', 'documentpersonnel': 'DocumentPersonnel',
      'formationsalarie': 'FormationSalarie', 'accesiteclient': 'AccesSiteClient',
      'client': 'Client', 'intervention': 'Intervention', 'materiel': 'Materiel',
      'materielutilise': 'MaterielUtilise', 'documentintervention': 'DocumentIntervention',
      'affectationintervention': 'AffectationIntervention', 'ressourceintervention': 'RessourceIntervention',
      'photointervention': 'PhotoIntervention', 'autocontrole': 'AutoControle',
      'messageintervention': 'MessageIntervention', 'checklistsecurite': 'ChecklistSecurite',
      'affectationplanning': 'AffectationPlanning', 'perimetre': 'Perimetre',
      'salarieperimetre': 'SalariePerimetre', 'chantier': 'Chantier',
      'donneurordre': 'DonneurOrdre', 'codeaffaire': 'CodeAffaire',
      'vehicule': 'Vehicule', 'affectationvehicule': 'AffectationVehicule',
      'pointage': 'Pointage', 'horaire': 'Horaire', 'evaluation': 'Evaluation',
      'evenementrh': 'EvenementRH', 'affectationpersonnel': 'AffectationPersonnel',
      'usine': 'Usine', 'structureorganisationnelle': 'StructureOrganisationnelle'
    }

    const modelNameLower = model.toLowerCase()
    const modelName = modelMapping[modelNameLower]

    if (!modelName) {
      return NextResponse.json(
        { error: `Modèle ${model} non trouvé` },
        { status: 404 }
      )
    }

    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1)

    // Nettoyer les données (retirer les champs auto-générés)
    const cleanData: any = { ...body }
    delete cleanData.id
    delete cleanData.createdAt
    delete cleanData.updatedAt

    // Convertir les chaînes vides en null pour les champs optionnels
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === '') {
        cleanData[key] = null
      }
    })

    // Créer l'enregistrement
    const created = await (prisma as any)[prismaModelName].create({
      data: cleanData
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    console.error('Error creating database record:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

