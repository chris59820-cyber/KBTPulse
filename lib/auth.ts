import 'server-only'

import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { UserRole, SessionUser } from './types'

// Hash un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Comparer un mot de passe avec son hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Ré-exporter les types pour la compatibilité
export type { UserRole, SessionUser }

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 jours

// Vérifier si un rôle a accès à un espace
export function hasAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

// Rôles autorisés pour chaque espace
export const ROLES = {
  ACCUEIL: ['PREPA', 'RDC', 'CAFF', 'AUTRE', 'OUVRIER', 'ADMIN'] as UserRole[],
  MON_PROFIL: ['PREPA', 'CE', 'RDC', 'CAFF', 'RH', 'AUTRE', 'ADMIN'] as UserRole[],
  INTERVENTIONS: ['PREPA', 'CE', 'RDC', 'CAFF', 'RH', 'AUTRE', 'ADMIN'] as UserRole[],
  STAFF: ['PREPA', 'CE', 'RDC', 'CAFF', 'RH', 'AUTRE', 'ADMIN'] as UserRole[],
  OUVRIERS: ['PREPA', 'RDC', 'CAFF', 'AUTRE', 'ADMIN'] as UserRole[],
  RDC: ['RDC', 'CAFF', 'ADMIN'] as UserRole[],
  CAFF: ['CAFF', 'ADMIN'] as UserRole[],
  CONFIGURATION: ['CAFF', 'ADMIN'] as UserRole[],
  ADMIN: ['ADMIN'] as UserRole[],
}

// Récupérer l'utilisateur de la session
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    // Vérifier la session dans la base de données
    // Pour simplifier, on stocke juste l'ID de l'utilisateur dans le cookie
    // En production, il faudrait une table de sessions
    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
      select: {
        id: true,
        identifiant: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        salarieId: true,
        actif: true,
      }
    })

    if (!user || !user.actif) {
      return null
    }

    return {
      id: user.id,
      identifiant: user.identifiant,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role as UserRole,
      salarieId: user.salarieId,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Créer une session
export async function createSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

// Supprimer la session
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Authentifier un utilisateur
// Permet la connexion avec l'identifiant OU l'email
export async function authenticate(identifiant: string, motDePasse: string): Promise<SessionUser | null> {
  try {
    // Construire les conditions de recherche
    const searchConditions: any[] = [
      { identifiant: identifiant },
      { email: identifiant }
    ]

    // Si l'identifiant contient @, chercher aussi avec la partie avant @
    if (identifiant.includes('@')) {
      const identifiantFromEmail = identifiant.toLowerCase().split('@')[0]
      searchConditions.push({ identifiant: identifiantFromEmail })
    }

    // Chercher l'utilisateur par identifiant ou par email
    const user = await prisma.user.findFirst({
      where: {
        OR: searchConditions,
        actif: true
      },
    })

    if (!user) {
      return null
    }

    // Vérifier le mot de passe
    const isValid = await comparePassword(motDePasse, user.motDePasse)
    if (!isValid) {
      return null
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { derniereConnexion: new Date() }
    })

    return {
      id: user.id,
      identifiant: user.identifiant,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role as UserRole,
      salarieId: user.salarieId,
    }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return null
  }
}
