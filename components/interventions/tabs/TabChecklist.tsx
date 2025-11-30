'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Intervention {
  id: string
  checklistSecurite: {
    id: string
    elements: string
    completee: boolean
    completeePar: string | null
    dateCompletion: Date | null
  } | null
}

interface TabChecklistProps {
  intervention: Intervention
  user: any
}

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

interface ChecklistSection {
  id: string
  title: string
  items: ChecklistItem[]
}

// Structure complète de la check-list
const defaultChecklistStructure: ChecklistSection[] = [
  {
    id: 'epi',
    title: '1 - Équipements de Protection Individuelle (EPI) requis pour l\'intervention',
    items: [
      { id: 'epi_tenue_travail', label: 'Tenue de travail complète', checked: false },
      { id: 'epi_combinaison_jetable', label: 'Combinaison jetable (type 3/4/5/6 selon environnement)', checked: false },
      { id: 'epi_combinaison_ignifugee', label: 'Combinaison ignifugée (norme EN ISO 11612)', checked: false },
      { id: 'epi_casque_4points', label: 'Casque de sécurité avec jugulaire 4 points', checked: false },
      { id: 'epi_lunettes_securite', label: 'Lunettes de sécurité', checked: false },
      { id: 'epi_lunettes_etanches', label: 'Lunettes étanches', checked: false },
      { id: 'epi_ecran_facial', label: 'Écran facial / visière de protection (mécanique ou chimique)', checked: false },
      { id: 'epi_detecteur_multigaz', label: 'Détecteur multigaz (4 gaz ou plus selon site)', checked: false },
      { id: 'epi_detecteur_atex', label: 'Détecteur d\'atmosphères explosives (selon site ATEX)', checked: false },
      { id: 'epi_gants_echafaudeur', label: 'Gants d\'échafaudeur', checked: false },
      { id: 'epi_gants_coquets', label: 'Gants coquets', checked: false },
      { id: 'epi_gants_calorifuge', label: 'Gants de calorifuge anti-coupure', checked: false },
      { id: 'epi_gants_chimique', label: 'Gants de protection chimique', checked: false },
      { id: 'epi_gants_haute_temp', label: 'Gants anti-chaleur Haute Température', checked: false },
      { id: 'epi_gants_nitrile', label: 'Gants jetables nitrile', checked: false },
      { id: 'epi_manchettes', label: 'Manchettes anti-coupure', checked: false },
      { id: 'epi_bouchons_oreilles', label: 'Bouchons d\'oreilles', checked: false },
      { id: 'epi_arceaux_antibruit', label: 'Arceaux antibruit', checked: false },
      { id: 'epi_casque_antibruit', label: 'Casque antibruit', checked: false },
      { id: 'epi_harnais_2longes', label: 'Harnais de sécurité avec 2 longes type Mini-Maxi', checked: false },
      { id: 'epi_harnais_nacelle', label: 'Harnais de sécurité pour nacelle', checked: false },
      { id: 'epi_longe_absorbeur', label: 'Longe absorbeur d\'énergie', checked: false },
      { id: 'epi_ara', label: 'Enrouleur / Antichute à rappel automatique (ARAs)', checked: false },
      { id: 'epi_trepied', label: 'Trépied avec système de récupération (espaces confinés)', checked: false },
      { id: 'epi_chaussures_montantes', label: 'Chaussures de sécurité montantes', checked: false },
      { id: 'epi_chaussures_rangers', label: 'Chaussures de sécurité type Rangers', checked: false },
      { id: 'epi_surchaussures', label: 'Surchaussures', checked: false },
      { id: 'epi_bottes', label: 'Bottes de sécurité', checked: false },
      { id: 'epi_guetres', label: 'Guêtres anti-coupure (tronçonnage)', checked: false },
      { id: 'epi_genouilleres', label: 'Genouillères en mousse', checked: false },
      { id: 'epi_epaulieres', label: 'Épaulières en mousse', checked: false },
      { id: 'epi_ceinture_lombaire', label: 'Ceinture de maintien lombaire (selon politique HSE)', checked: false },
      { id: 'epi_demi_masque_ffp3', label: 'Demi-masques filtrants FFP3', checked: false },
      { id: 'epi_masque_abek', label: 'Masque ABEK', checked: false },
      { id: 'epi_masque_fuite', label: 'Masque de fuite', checked: false },
      { id: 'epi_ari', label: 'Appareils respiratoires isolants (ARI)', checked: false },
      { id: 'epi_papr', label: 'Masque à assistance ventilée (PAPR)', checked: false },
      { id: 'epi_cartouches', label: 'Cartouches filtrantes spécifiques (A2P3, AX, B2, E2, K2, etc.)', checked: false },
      { id: 'epi_vetements_chimique', label: 'Vêtements de protection chimique', checked: false },
      { id: 'epi_blouson_visibilite', label: 'Blouson haute visibilité', checked: false },
      { id: 'epi_veste_impermable', label: 'Veste anti-pluie / tenue imperméable', checked: false },
      { id: 'epi_tabliers', label: 'Tabliers de protection (cuir, chimique, anti-coupure)', checked: false },
      { id: 'epi_gilet_visibilite', label: 'Gilets haute visibilité', checked: false },
      { id: 'epi_gilet_sauvetage', label: 'Gilets de sauvetage', checked: false },
      { id: 'epi_brassards', label: 'Brassards d\'identification (chef d\'équipe, SST, etc.)', checked: false },
      { id: 'epi_autres', label: 'Autres EPI selon risques spécifiques', checked: false },
      { id: 'epi_protection_cryogenique', label: 'Protection thermique cryogénique', checked: false },
    ]
  },
  {
    id: 'outils',
    title: '2 - Vérification des outils et matériels',
    items: [
      { id: 'outils_caisse_calo', label: 'Caisse calorifuge (caisse calo)', checked: false },
      { id: 'outils_visseuse', label: 'Visseuse / perceuse électrique', checked: false },
      { id: 'outils_pistolet_silicone', label: 'Pistolet à silicone', checked: false },
      { id: 'outils_chariot', label: 'Chariot roulant', checked: false },
      { id: 'outils_ceinture_outils', label: 'Ceinture porte-outils', checked: false },
      { id: 'outils_porte_marteau', label: 'Porte-marteau', checked: false },
      { id: 'outils_porte_cle', label: 'Porte clé à cliquet', checked: false },
      { id: 'outils_marteau', label: 'Marteau avec dragonne', checked: false },
      { id: 'outils_cle_cliquet', label: 'Clé à cliquet pour échafaudage 19/22 mm avec dragonne', checked: false },
      { id: 'outils_niveau', label: 'Niveau avec dragonne', checked: false },
      { id: 'outils_metre', label: 'Mètre ruban', checked: false },
      { id: 'outils_diphoterine', label: 'Diphotérine (solution de décontamination d\'urgence)', checked: false },
      { id: 'outils_extincteur', label: 'Extincteur (type adapté au risque : eau pulvérisée, CO₂, poudre polyvalente, etc.)', checked: false },
      { id: 'outils_kit_pollution', label: 'Kit anti-pollution (absorbants, barrages, granulés, sacs de confinement)', checked: false },
      { id: 'outils_rack', label: 'Rack d\'échafaudage', checked: false },
      { id: 'outils_panier', label: 'Panier d\'échafaudage', checked: false },
      { id: 'outils_bois', label: 'Bois d\'échafaudage', checked: false },
      { id: 'outils_palette', label: 'Palette d\'échafaudage', checked: false },
      { id: 'outils_crochet_plettac', label: 'Crochet Plettac', checked: false },
      { id: 'outils_potence_plettac', label: 'Potence Plettac', checked: false },
      { id: 'outils_poulie', label: 'Poulie', checked: false },
      { id: 'outils_corde_guidage', label: 'Corde de guidage', checked: false },
      { id: 'outils_perche_guidage', label: 'Perche de guidage', checked: false },
      { id: 'outils_elingue_1t_05', label: 'Élingue 1T / 0,5 m', checked: false },
      { id: 'outils_elingue_1t_1', label: 'Élingue 1T / 1 m', checked: false },
      { id: 'outils_elingue_1t_2', label: 'Élingue 1T / 2 m', checked: false },
      { id: 'outils_elingue_2t_05', label: 'Élingue 2T / 0,5 m', checked: false },
      { id: 'outils_elingue_2t_1', label: 'Élingue 2T / 1 m', checked: false },
      { id: 'outils_elingue_2t_2', label: 'Élingue 2T / 2 m', checked: false },
      { id: 'outils_elingue_3t_1', label: 'Élingue 3T / 1 m', checked: false },
      { id: 'outils_elingue_3t_2', label: 'Élingue 3T / 2 m', checked: false },
      { id: 'outils_elingue_3t_3', label: 'Élingue 3T / 3 m', checked: false },
      { id: 'outils_elingue_3t_4', label: 'Élingue 3T / 4 m', checked: false },
      { id: 'outils_elingue_3t_5', label: 'Élingue 3T / 5 m', checked: false },
      { id: 'outils_elingue_5t_2', label: 'Élingue 5T / 2 m', checked: false },
      { id: 'outils_elingue_5t_3', label: 'Élingue 5T / 3 m', checked: false },
      { id: 'outils_elingue_5t_4', label: 'Élingue 5T / 4 m', checked: false },
      { id: 'outils_elingue_5t_5', label: 'Élingue 5T / 5 m', checked: false },
      { id: 'outils_corde_25', label: 'Corde 25 m', checked: false },
      { id: 'outils_corde_50', label: 'Corde 50 m', checked: false },
      { id: 'outils_corde_100', label: 'Corde 100 m', checked: false },
      { id: 'outils_talkie', label: 'Talkie-walkies', checked: false },
      { id: 'outils_sifflet', label: 'Sifflet', checked: false },
      { id: 'outils_corne', label: 'Corne de brume', checked: false },
      { id: 'outils_rubalise', label: 'Rubalise', checked: false },
      { id: 'outils_chaine', label: 'Chaîne de signalisation plastique', checked: false },
      { id: 'outils_poteaux', label: 'Poteaux de balisage', checked: false },
      { id: 'outils_barriere', label: 'Barrière de chantier', checked: false },
      { id: 'outils_cone', label: 'Cône de signalisation', checked: false },
      { id: 'outils_barriere_grillage', label: 'Barrière de chantier grillagée', checked: false },
      { id: 'outils_chevalet', label: 'Chevalet de signalisation', checked: false },
      { id: 'outils_panneaux', label: 'Panneaux de chantier', checked: false },
      { id: 'outils_separateurs', label: 'Séparateurs de voie en plastique', checked: false },
    ]
  },
  {
    id: 'acces',
    title: '3 - Vérification de l\'accès au chantier',
    items: [
      { id: 'acces_carte_identite', label: 'Carte d\'identité en cours de validité', checked: false },
      { id: 'acces_permis_conduire', label: 'Permis de conduire en cours de validité', checked: false },
      { id: 'acces_carte_btp', label: 'Carte BTP', checked: false },
      { id: 'acces_badge', label: 'Badge d\'accès au site', checked: false },
      { id: 'acces_visite_medicale', label: 'Visite médicale en cours de validité', checked: false },
      { id: 'acces_titres_habilitations', label: 'Titres et habilitations requis (ATEX, travail en hauteur, CACES, SST, etc.)', checked: false },
      { id: 'acces_anfas', label: 'Carte ANFAS N1 / N2 (habilitation risques chimiques)', checked: false },
    ]
  },
  {
    id: 'documents',
    title: '4 - Vérification des documents nécessaires',
    items: [
      { id: 'doc_autorisation_travail', label: 'Autorisation de travail', checked: false },
      { id: 'doc_pdp', label: 'Plan de Prévention (PDP)', checked: false },
      { id: 'doc_mode_operatoire', label: 'Mode opératoire validé', checked: false },
      { id: 'doc_icp', label: 'Inspection Commune Préalable (ICP)', checked: false },
      { id: 'doc_procedure', label: 'Procédure interne applicable à l\'intervention', checked: false },
      { id: 'doc_permis_penetrer', label: 'Permis de pénétrer (espace confiné)', checked: false },
      { id: 'doc_permis_feu', label: 'Permis feu', checked: false },
      { id: 'doc_consignation', label: 'Consignation de l\'installation client (énergie, fluide, mécanique, etc.)', checked: false },
      { id: 'doc_autorisation_acces', label: 'Autorisation d\'accès au site', checked: false },
    ]
  },
  {
    id: 'formations',
    title: '5 - Vérification des formations et habilitations',
    items: [
      { id: 'form_anfas_n1', label: 'ANFAS N1', checked: false },
      { id: 'form_anfas_n2', label: 'ANFAS N2', checked: false },
      { id: 'form_travaux_hauteur', label: 'Travaux en hauteur', checked: false },
      { id: 'form_harnais', label: 'Port du harnais / utilisation des EPI antichute', checked: false },
      { id: 'form_atex', label: 'Habilitation ATEX', checked: false },
      { id: 'form_electrique', label: 'Habilitation électrique H0/B0', checked: false },
      { id: 'form_espace_confine', label: 'Travaux en espace confiné', checked: false },
      { id: 'form_catec', label: 'Travaux en espace confiné CATEC', checked: false },
      { id: 'form_ari', label: 'Utilisation d\'ARI (Appareil Respiratoire Isolant)', checked: false },
      { id: 'form_reception_echafaudage', label: 'Réception d\'échafaudage', checked: false },
      { id: 'form_utilisation_echafaudage', label: 'Utilisation d\'échafaudage', checked: false },
      { id: 'form_autorisation_nacelle', label: 'Autorisation de conduite Nacelle', checked: false },
      { id: 'form_caces_nacelle', label: 'CACES Nacelle (R486)', checked: false },
      { id: 'form_caces_cat3', label: 'CACES catégorie 3 (chariot élévateur – R489)', checked: false },
      { id: 'form_caces_cat9', label: 'CACES catégorie 9 (conduite d\'engins – R482)', checked: false },
      { id: 'form_vehicule_leger', label: 'Conduite de véhicule léger (autorisation interne)', checked: false },
      { id: 'form_pontier', label: 'Pontier / commande de pont roulant', checked: false },
      { id: 'form_elingueur', label: 'Élingueur (contrôle et mise en charge des levages)', checked: false },
      { id: 'form_chef_manoeuvre', label: 'Chef de manœuvre (direction des opérations de levage)', checked: false },
      { id: 'form_vigie', label: 'Vigie (surveillance sécurité, zones à risques)', checked: false },
    ]
  }
]

export default function TabChecklist({ intervention, user }: TabChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistSection[]>(defaultChecklistStructure)

  // Charger la check-list depuis la base de données
  useEffect(() => {
    if (intervention.checklistSecurite?.elements) {
      try {
        let parsed = intervention.checklistSecurite.elements
        
        // Si c'est déjà une string, essayer de la parser
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed)
        }
        
        // Si le résultat est encore une string, essayer de parser à nouveau
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed)
        }
        
        if (Array.isArray(parsed)) {
          setChecklist(parsed)
        } else {
          console.error('La check-list n\'est pas un tableau:', parsed)
        }
      } catch (e) {
        // Si ce n'est pas du JSON, on garde la structure par défaut
        console.error('Erreur lors du parsing de la check-list:', e)
        console.error('Contenu:', intervention.checklistSecurite.elements)
      }
    }
  }, [intervention.checklistSecurite])

  // Si la check-list n'existe pas, ne rien afficher
  if (!intervention.checklistSecurite) {
    return null
  }

  // Filtrer les sections pour n'afficher que celles qui ont des éléments cochés
  const sectionsWithCheckedItems = checklist.filter(section => 
    section.items.some(item => item.checked)
  )

  if (sectionsWithCheckedItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun élément de la check-list n'a été coché.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        {/* Sections de la check-list */}
        <div className="space-y-6">
          {sectionsWithCheckedItems.map((section) => {
            const checkedItems = section.items.filter((item) => item.checked)
            if (checkedItems.length === 0) return null
            
            return (
              <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">{section.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checkedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-lg cursor-default transition-colors bg-green-50 border-2 border-green-200"
                    >
                      <span className="text-base font-medium text-gray-900">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

