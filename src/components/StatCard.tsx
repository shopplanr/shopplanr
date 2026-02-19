import { Icon } from '@ricons/utils'
import type { JSX } from 'react'

interface StatCardProps {
	label: string
	value: string | number
	icon: JSX.Element
	colorClass: string
}

export default function StatCard({ label, value, icon, colorClass }: StatCardProps) {
	return (
		<div className="bg-white border border-accent/20 rounded-xl p-6">
			<div className="flex items-center gap-3 mb-4">
				<div className={`p-3 ${colorClass} rounded-lg`}>
					<Icon size="24">{icon}</Icon>
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm text-text/60">{label}</p>
					<p className="text-lg sm:text-xl lg:text-2xl font-bold text-text truncate">{value}</p>
				</div>
			</div>
		</div>
	)
}
