# Cahier des Charges - Application de Gestion de Chantiers BTP

## 1. Présentation générale

### 1.1 Objectif

Développer une application web et mobile destinée à la gestion complète des chantiers dans une entreprise du BTP. L'application doit permettre la centralisation/décentralisation des informations liées aux salariés, aux interventions, au matériel, au planning et aux ressources matérielles et humaines.

### 1.2 Contexte

L'application est inspirée des tableaux de bord modernes (style Azure Portal) avec des widgets de métriques, graphiques et visualisations de données en temps réel.

## 2. Fonctionnalités principales

### 2.1 Tableau de bord

- **Vue d'ensemble** : Métriques clés (chantiers actifs, salariés, interventions, matériel)
- **Graphiques** : Visualisation des données avec graphiques interactifs
- **Filtres temporels** : Sélection de périodes (24h, semaine, mois, trimestre)
- **Indicateurs de performance** : Taux de disponibilité, utilisation des ressources, temps moyen d'intervention

### 2.2 Gestion des chantiers

- **Création/Modification** : Gestion complète des chantiers (nom, adresse, client, dates, budget, statut)
- **Statuts** : Planifié, En cours, Terminé, Annulé
- **Suivi** : Association avec interventions et affectations de personnel

### 2.3 Gestion des salariés

- **Fiche salarié** : Informations complètes (nom, prénom, email, téléphone, poste, date d'embauche)
- **Statuts** : Actif, Inactif, Congé
- **Historique** : Interventions et affectations du salarié

### 2.4 Gestion des interventions

- **Création/Modification** : Gestion des interventions (titre, description, dates, durée, statut)
- **Association** : Liaison avec chantier et salarié responsable
- **Matériel utilisé** : Suivi du matériel consommé/utilisé pendant l'intervention
- **Statuts** : Planifiée, En cours, Terminée, Annulée

### 2.5 Gestion du matériel

- **Inventaire** : Gestion complète du matériel (nom, description, catégorie, quantité, prix)
- **Catégories** : Outillage, Véhicule, Machine, Consommable
- **Statuts** : Disponible, En utilisation, Maintenance, Hors service
- **Suivi d'utilisation** : Historique des interventions où le matériel a été utilisé

### 2.6 Planning des ressources

- **Affectations** : Planification des salariés sur les chantiers
- **Dates et heures** : Gestion des créneaux horaires
- **Vue calendrier** : Visualisation par date des affectations
- **Flexibilité** : Ajout, modification et suppression des affectations

## 3. Architecture technique

### 3.1 Frontend

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Graphiques** : Recharts
- **Icônes** : Lucide React

### 3.2 Backend

- **API** : Next.js API Routes
- **ORM** : Prisma
- **Base de données** : SQLite (développement), peut être migré vers PostgreSQL/MySQL en production

### 3.3 Structure de données

#### Modèles principaux

1. **Salarie** : Informations des employés
2. **Chantier** : Projets de construction
3. **Intervention** : Tâches réalisées sur les chantiers
4. **Materiel** : Inventaire du matériel
5. **MaterielUtilise** : Suivi de l'utilisation du matériel
6. **AffectationPlanning** : Planification des ressources

### 3.4 Design

- **Inspiration** : Tableaux de bord Azure Portal
- **Composants** : Widgets de métriques, cartes de graphiques, tableaux de données
- **Responsive** : Design adaptatif pour mobile et desktop
- **Navigation** : Sidebar avec menu principal

## 4. Interface utilisateur

### 4.1 Navigation

- **Sidebar** : Menu latéral avec accès rapide à toutes les sections
- **Header** : Barre supérieure avec recherche et notifications
- **Breadcrumbs** : Navigation hiérarchique (à implémenter)

### 4.2 Composants réutilisables

- **MetricCard** : Carte de métrique avec icône et valeurs
- **ChartCard** : Carte contenant un graphique
- **Sidebar** : Menu de navigation latéral
- **Header** : En-tête avec titre et actions

### 4.3 Widgets du tableau de bord

- Graphiques en camembert (répartition par statut)
- Graphiques en ligne (évolution temporelle)
- Graphiques en barres (comparaisons)
- Indicateurs de performance (KPIs)

## 5. Développement futur

### 5.1 Fonctionnalités à venir

- Authentification et gestion des utilisateurs
- Export de données (PDF, Excel)
- Notifications en temps réel
- Application mobile (React Native)
- Géolocalisation des chantiers
- Photos et documents attachés
- Rapports et statistiques avancées
- Gestion des permissions et rôles

### 5.2 Améliorations techniques

- Migration vers PostgreSQL pour la production
- Cache et optimisations de performance
- Tests unitaires et d'intégration
- CI/CD
- Déploiement cloud

## 6. Installation et déploiement

Voir le fichier `README.md` pour les instructions détaillées d'installation et de configuration.

## 7. Support et maintenance

L'application est conçue pour être maintenable et extensible. La structure modulaire permet d'ajouter facilement de nouvelles fonctionnalités.
