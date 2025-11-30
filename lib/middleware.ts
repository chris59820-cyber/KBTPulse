import 'server-only'

import { redirect } from 'next/navigation'
import { getCurrentUser, hasAccess, ROLES } from './auth'
import { UserRole } from './types'

// Vérifier l'authentification
export async function requireAuth(): Promise<Awaited<ReturnType<typeof getCurrentUser>>> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/connexion')
  }
  
  return user
}

// Vérifier les permissions
export async function requireRole(requiredRoles: UserRole[]): Promise<Awaited<ReturnType<typeof getCurrentUser>>> {
  const user = await requireAuth()
  
  if (!hasAccess(user.role, requiredRoles)) {
    redirect('/acces-refuse')
  }
  
  return user
}

// Vérifier l'accès à un espace
export async function requireSpace(space: keyof typeof ROLES): Promise<Awaited<ReturnType<typeof getCurrentUser>>> {
  return requireRole(ROLES[space])
}
