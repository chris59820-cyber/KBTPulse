import { ReactNode } from 'react'
import { Edit } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action
}: ChartCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {action || (
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit size={18} className="text-gray-600" />
          </button>
        )}
      </div>
      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}
