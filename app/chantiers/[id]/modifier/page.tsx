import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import FormModifierChantier from '@/components/chantiers/FormModifierChantier'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export default async function ModifierChantierPage({ params }: PageProps) {
  const user = await requireAuth()

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return notFound()
  }

  // Récupérer le chantier à modifier avec le client associé
  const chantier = await prisma.chantier.findUnique({
    where: { id: params.id },
    include: { client: true },
  })

  if (!chantier) {
    return notFound()
  }

  // Vérifier les permissions : seuls PREPA, CE, RDC, CAFF peuvent modifier
  const canEdit = !['OUVRIER'].includes(user.role)
  if (!canEdit) {
    const perimetres = await prisma.perimetre.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' }
    })

    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarWrapper />
        <div className="flex-1 flex flex-col lg:ml-52">
          <Header title="Accès refusé" perimetres={perimetres} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="card text-center py-12">
                <p className="text-gray-500 mb-4">
                  Vous n'avez pas les permissions pour modifier ce chantier
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Récupérer les périmètres pour le Header
  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  // Récupérer les usines pour le formulaire
  const usines = await prisma.usine.findMany({
    orderBy: { nom: 'asc' },
    select: { id: true, nom: true }
  })

  // Préparer le client pour le formulaire, même si null
  const clientForm = chantier.client
    ? {
        id: chantier.client.id,
        nom: chantier.client.nom,
        actif: chantier.client.actif,
        email: chantier.client.email ?? '',
        adresse: chantier.client.adresse ?? '',
        telephone: chantier.client.telephone ?? '',
      }
    : undefined

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title={`Modifier le chantier: ${chantier.nom}`} perimetres={perimetres} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <FormModifierChantier chantier={{ ...chantier, client: clientForm }} usines={usines} />
          </div>
        </main>
      </div>
    </div>
  )
}
