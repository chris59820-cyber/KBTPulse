import { getCurrentUser } from '@/lib/auth'
import SidebarClient from './SidebarClient'

export default async function SidebarWrapper() {
  const user = await getCurrentUser()
  return <SidebarClient user={user} />
}
