'use client'

import CalendrierPlanning from './CalendrierPlanning'

interface TabPlanningProps {
  user: any
}

export default function TabPlanning({ user }: TabPlanningProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Planning
        </h3>
      </div>

      <CalendrierPlanning user={user} />
    </div>
  )
}
