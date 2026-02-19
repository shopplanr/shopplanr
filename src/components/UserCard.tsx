import { Icon } from '@ricons/utils'
import { Delete20Regular } from '@ricons/fluent'
import { useTranslation } from 'react-i18next'
import Button from './Button'

interface AdminUser {
	id: string
	email: string
	created_at: string
}

interface UserCardProps {
	user: AdminUser
	currentUserId?: string
	variant: 'mobile' | 'desktop'
	onDelete: (user: AdminUser) => void
}

export default function UserCard({ user, currentUserId, variant, onDelete }: UserCardProps) {
	const { t } = useTranslation()

	if (variant === 'mobile') {
		return (
			<div className="p-5 bg-white border border-primary/50 rounded-lg hover:border-primary/80 transition-colors">
				<div className="flex items-center justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="text-sm font-medium text-text truncate">{user.email}</div>
					</div>
					<Button
						variant="normal"
						onClick={() => onDelete(user)}
						className="text-sm shrink-0"
						title="Delete user"
						disabled={user.id === currentUserId}
					>
						<Icon size="18">
							<Delete20Regular />
						</Icon>
						{t('admin.deleteUser')}
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="p-4 bg-white border border-primary/50 rounded-lg hover:border-primary/80 transition-colors">
			<div className="grid grid-cols-12 gap-4 items-center">
				<div className="col-span-4">
					<div className="text-sm font-medium text-text">{user.email}</div>
				</div>
				<div className="col-span-3">
					<div className="text-sm text-text/70">
						{new Date(user.created_at).toLocaleString()}
					</div>
				</div>
				<div className="col-span-3 pr-2">
					<div className="text-xs text-text/50 font-mono overflow-hidden">
						<span className="hidden xl:inline">{user.id}</span>
						<span className="inline xl:hidden">{user.id.slice(0, 8)}...</span>
					</div>
				</div>
				<div className="col-span-2 flex justify-end">
					<Button
						variant="normal"
						onClick={() => onDelete(user)}
						className="text-sm"
						title={t('admin.deleteUser')}
						disabled={user.id === currentUserId}
					>
						<Icon size="18">
							<Delete20Regular />
						</Icon>
						{t('admin.deleteUser')}
					</Button>
				</div>
			</div>
		</div>
	)
}
