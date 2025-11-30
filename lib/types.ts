export type UserRole = 'PREPA' | 'CE' | 'RDC' | 'CAFF' | 'RH' | 'AUTRE' | 'OUVRIER' | 'ADMIN'

export interface SessionUser {
  id: string
  identifiant: string
  email: string | null
  nom: string | null
  prenom: string | null
  role: UserRole
  salarieId: string | null
}




