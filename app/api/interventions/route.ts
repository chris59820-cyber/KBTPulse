import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET - Récupérer toutes les interventions
export async function GET() {
  try {
    const interventions = await prisma.intervention.findMany({
      include: {
        chantier: true,
        salarie: true
      },
      orderBy: { dateDebut: 'desc' }
    })
    return NextResponse.json(interventions)
  } catch (error) {
    console.error('Error fetching interventions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des interventions' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle intervention
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()

    // Récupérer les champs de base
    const titre = formData.get('titre') as string
    const description = formData.get('description') as string || null
    const dateDebut = formData.get('dateDebut') as string
    const dateFin = formData.get('dateFin') as string || null
    const tempsPrevu = formData.get('tempsPrevu') as string || null
    const type = formData.get('type') as string || null
    const nature = formData.get('nature') as string || null
    const usine = formData.get('usine') as string || null
    const secteur = formData.get('secteur') as string || null
    const latitude = formData.get('latitude') as string || null
    const longitude = formData.get('longitude') as string || null
    const responsableId = formData.get('responsableId') as string || null
    const rdcId = formData.get('rdcId') as string || null
    const codeAffaireId = formData.get('codeAffaireId') as string || null
    const donneurOrdreId = formData.get('donneurOrdreId') as string || null
    const donneurOrdreNom = formData.get('donneurOrdreNom') as string || null
    const donneurOrdreTelephone = formData.get('donneurOrdreTelephone') as string || null
    const donneurOrdreEmail = formData.get('donneurOrdreEmail') as string || null
    const retexPositifs = formData.get('retexPositifs') as string || null
    const retexNegatifs = formData.get('retexNegatifs') as string || null
    const chantierId = formData.get('chantierId') as string

    // Validation des champs requis
    if (!titre || !chantierId) {
      return NextResponse.json(
        { error: 'Le titre et le chantier sont requis' },
        { status: 400 }
      )
    }
    
    // Vérifier si la planification est complète
    const hasPlanning = dateDebut && dateDebut.trim() !== ''
    
    // Déterminer le statut en fonction de la planification
    const statut = hasPlanning ? 'planifiee' : 'en_attente'

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'interventions')
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
      
      return `/uploads/interventions/${fileName}`
    }

    // Créer l'intervention en base
    const intervention = await prisma.$transaction(async (tx) => {
      const newIntervention = await tx.intervention.create({
        data: {
          titre,
          description: description && description.trim() !== '' ? description : null,
          dateDebut: hasPlanning ? new Date(dateDebut) : null, // null si pas de planification
          dateFin: dateFin && dateFin.trim() !== '' ? new Date(dateFin) : null,
          tempsPrevu: tempsPrevu && tempsPrevu.trim() !== '' ? parseFloat(tempsPrevu) : null,
          type: type && type.trim() !== '' ? (type as any) : null,
          nature: nature && nature.trim() !== '' ? (nature as any) : null,
          usine: usine && usine.trim() !== '' ? usine : null,
          secteur: secteur && secteur.trim() !== '' ? secteur : null,
          latitude: latitude && latitude.trim() !== '' ? parseFloat(latitude) : null,
          longitude: longitude && longitude.trim() !== '' ? parseFloat(longitude) : null,
          responsableId: responsableId && responsableId.trim() !== '' ? responsableId : null,
          rdcId: rdcId && rdcId.trim() !== '' ? rdcId : null,
          codeAffaireId: codeAffaireId && codeAffaireId.trim() !== '' ? codeAffaireId : null,
          donneurOrdreId: donneurOrdreId && donneurOrdreId.trim() !== '' ? donneurOrdreId : null,
          // Garder les champs pour compatibilité avec les anciennes données
          donneurOrdreNom: donneurOrdreNom && donneurOrdreNom.trim() !== '' ? donneurOrdreNom : null,
          donneurOrdreTelephone: donneurOrdreTelephone && donneurOrdreTelephone.trim() !== '' ? donneurOrdreTelephone : null,
          donneurOrdreEmail: donneurOrdreEmail && donneurOrdreEmail.trim() !== '' ? donneurOrdreEmail : null,
          retexPositifs: retexPositifs && retexPositifs.trim() !== '' ? retexPositifs : null,
          retexNegatifs: retexNegatifs && retexNegatifs.trim() !== '' ? retexNegatifs : null,
          chantierId,
          statut
        }
      })

      // Traiter les affectations
      const affectationsJson = formData.get('affectations') as string
      if (affectationsJson) {
        try {
          const affectations: Array<{ salarieId: string; role: string; dateDebut: string; dateFin?: string }> = JSON.parse(affectationsJson)
          for (const aff of affectations) {
            if (aff.salarieId) {
              await tx.affectationIntervention.create({
                data: {
                  interventionId: newIntervention.id,
                  salarieId: aff.salarieId,
                  role: aff.role as any,
                  dateDebut: new Date(aff.dateDebut),
                  dateFin: aff.dateFin ? new Date(aff.dateFin) : null
                }
              })
            }
          }
        } catch (e) {
          console.error('Erreur lors de l\'ajout des affectations:', e)
        }
      }

      // Traiter les ressources matérielles
      const ressourcesJson = formData.get('ressources') as string
      if (ressourcesJson) {
        try {
          const ressources: RessourceMaterielle[] = JSON.parse(ressourcesJson)
          for (const ressource of ressources) {
            if (ressource.type === 'vehicule' && ressource.vehiculeId) {
              // Pour les véhicules, on peut créer une affectation véhicule
              // Pour l'instant, on stocke juste dans ressourcesIntervention
            } else if (ressource.materielId) {
              await tx.ressourceIntervention.create({
                data: {
                  interventionId: newIntervention.id,
                  type: ressource.type as any,
                  nom: ressource.nom,
                  quantite: ressource.quantite,
                  description: ressource.description || null
                }
              })
            }
          }
        } catch (e) {
          console.error('Erreur lors de l\'ajout des ressources:', e)
        }
      }

      // Traiter les documents
      let docIndex = 0
      while (formData.get(`document_${docIndex}`)) {
        const file = formData.get(`document_${docIndex}`) as File
        const docType = formData.get(`document_${docIndex}_type`) as string
        const docNom = formData.get(`document_${docIndex}_nom`) as string
        const docDescription = formData.get(`document_${docIndex}_description`) as string || null

        if (file && file.size > 0) {
          const fileUrl = await uploadFile(file, `doc-${docIndex}`)
          
          await tx.documentIntervention.create({
            data: {
              interventionId: newIntervention.id,
              type: docType as any,
              nom: docNom || file.name,
              description: docDescription,
              fichierUrl: fileUrl
            }
          })
        }
        docIndex++
      }

      // Traiter les photos
      let photoIndex = 0
      while (formData.get(`photo_${photoIndex}`)) {
        const file = formData.get(`photo_${photoIndex}`) as File
        if (file && file.size > 0) {
          const fileUrl = await uploadFile(file, `photo-${photoIndex}`)
          
          await tx.photoIntervention.create({
            data: {
              interventionId: newIntervention.id,
              url: fileUrl,
              description: null
            }
          })
        }
        photoIndex++
      }

      return newIntervention
    })

    return NextResponse.json(intervention, { status: 201 })
  } catch (error: any) {
    console.error('Error creating intervention:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'intervention' },
      { status: 500 }
    )
  }
}

interface RessourceMaterielle {
  materielId?: string
  vehiculeId?: string
  type: string
  nom: string
  quantite: number
  description?: string
}
