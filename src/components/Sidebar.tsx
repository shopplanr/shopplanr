import { useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Home20Regular, List20Regular, History20Regular } from '@ricons/fluent'

export default function Sidebar() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()

	const menuItems = [
		{ path: '/dashboard', icon: Home20Regular, labelKey: 'nav.dashboard' },
		{ path: '/lists', icon: List20Regular, labelKey: 'nav.lists' },
		{ path: '/history', icon: History20Regular, labelKey: 'nav.history' }
	]

	return (
		<aside className="hidden md:block fixed left-0 top-27 bottom-8 w-72 bg-white z-40">
			<nav className="h-full pl-8 pr-8 space-y-2 border-r border-text/5">
				{menuItems.map((item) => {
					const isActive = location.pathname === item.path
					return (
						<button
							key={item.path}
							onClick={() => navigate(item.path)}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
								isActive
									? 'bg-primary text-white'
									: 'text-text/70 hover:bg-text/5 hover:text-text'
							}`}
						>
							<Icon size="20">
								<item.icon />
							</Icon>
							<span className="font-medium">{t(item.labelKey)}</span>
						</button>
					)
				})}
			</nav>
		</aside>
	)
}
