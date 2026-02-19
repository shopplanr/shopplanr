import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@ricons/utils'
import { CheckmarkCircle20Regular, Delete20Regular, Image20Regular, MoreVertical20Regular, Edit20Regular } from '@ricons/fluent'
import Button from './Button'

interface ItemCardProps {
	product: {
		id: string
		name: string
		quantity: number
		price: number | string
		note: string | null
		link: string | null
		priority: string
		image_url?: string | null
	}
	currencyFormatter: Intl.NumberFormat
	onViewDetails: () => void
	onDelete: () => void
	onMarkPurchased: () => void
	onEdit: () => void
	isRemoving?: boolean
}

export default function ItemCard({ product, currencyFormatter, onViewDetails, onDelete, onMarkPurchased, onEdit, isRemoving = false }: ItemCardProps) {
	const { t } = useTranslation()
	const totalPrice = Number(product.price ?? 0) * Number(product.quantity ?? 0)
	const [menuOpen, setMenuOpen] = useState(false)
	const [menuVisible, setMenuVisible] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const menuTimeoutRef = useRef<number | null>(null)

	const openMenu = () => {
		if (menuTimeoutRef.current) {
			window.clearTimeout(menuTimeoutRef.current)
		}
		setMenuVisible(true)
		menuTimeoutRef.current = window.setTimeout(() => setMenuOpen(true), 0)
	}

	const closeMenu = () => {
		if (menuTimeoutRef.current) {
			window.clearTimeout(menuTimeoutRef.current)
		}
		setMenuOpen(false)
		menuTimeoutRef.current = window.setTimeout(() => setMenuVisible(false), 150)
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				closeMenu()
			}
		}

		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [menuOpen])

	return (
		<article
			role="button"
			tabIndex={0}
			onClick={() => onViewDetails()}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					onViewDetails()
				}
			}}
			className={`rounded-2xl border bg-white transition overflow-visible cursor-pointer hover:bg-text/1.5 ${product.priority === 'highest'
					? 'border-accent/60 bg-accent/10 hover:border-accent'
					: product.priority === 'higher'
						? 'border-primary/50 bg-primary/10 hover:border-primary/80'
						: 'border-text/10 hover:border-primary/45'
				} ${isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
		>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
				<div className="flex gap-4 min-w-0 flex-1">
					{product.image_url && (
						<img
							src={product.image_url}
							alt={product.name}
							className="w-16 h-16 object-contain rounded-lg border border-text/10 shrink-0"
							onError={(e) => {
								e.currentTarget.style.display = 'none'
							}}
						/>
					)}
					{!product.image_url && (
						<div className="w-16 h-16 bg-text/5 rounded-lg border border-text/10 flex items-center justify-center shrink-0 text-text/30">
							<Icon size="24">
								<Image20Regular />
							</Icon>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<div className="flex flex-col gap-1.5">
							<h3 className="text-base font-semibold text-text">{product.name}</h3>
							<span
								className={`text-xs font-semibold px-3 py-1 rounded-md whitespace-nowrap w-fit ${product.priority === 'highest'
										? 'bg-accent/20 text-accent'
										: product.priority === 'higher'
											? 'bg-primary/15 text-primary'
											: 'bg-text/7 text-text/40'
									}`}
							>
								{product.priority === 'highest'
									? t('items.priorityHighest')
									: product.priority === 'higher'
										? t('items.priorityHigher')
										: t('items.priorityNormal')}
							</span>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between md:justify-end gap-3">
					<div className="text-left md:text-right">
						<p className="text-xs text-text/50">{t('items.total')}</p>
						<p className="text-base md:text-lg font-semibold text-text whitespace-nowrap">
							{currencyFormatter.format(totalPrice)}
						</p>
					</div>
					<div className="flex items-center gap-2 md:pl-3 md:border-l md:border-text/10">
						<div className="relative" ref={menuRef}>
							<Button
								variant="ghosticon"
								onClick={(event) => {
									event.stopPropagation()
									if (menuOpen) {
										closeMenu()
									} else {
										openMenu()
									}
								}}
								aria-label={t('items.menu')}
								className="shrink-0"
							>
								<Icon size="20">
									<MoreVertical20Regular />
								</Icon>
							</Button>

							{menuVisible && (
								<div
									className={`absolute bottom-full right-0 mb-2 bg-white border border-text/10 rounded-lg shadow-lg z-40 min-w-max origin-bottom-right transition-all duration-100 ease-out ${menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
										}`}
									onClick={(event) => event.stopPropagation()}
								>
									<button
										className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-text/5 transition text-left first:rounded-t-lg"
										onClick={(event) => {
											event.stopPropagation()
											closeMenu()
											onEdit()
										}}
										aria-label={t('items.edit')}
									>
										<Icon size="16">
											<Edit20Regular />
										</Icon>
										{t('items.edit')}
									</button>
									<button
										className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-left last:rounded-b-lg"
										onClick={(event) => {
											event.stopPropagation()
											closeMenu()
											onDelete()
										}}
										aria-label={t('items.delete')}
									>
										<Icon size="16">
											<Delete20Regular />
										</Icon>
										{t('items.delete')}
									</button>
								</div>
							)}
						</div>
						<Button
							variant="icon"
							onClick={(event) => {
								event.stopPropagation()
								onMarkPurchased()
							}}
							aria-label={t('items.markPurchased')}
							title={t('items.markPurchased')}
						>
							<Icon size="18">
								<CheckmarkCircle20Regular />
							</Icon>
						</Button>
					</div>
				</div>
			</div>
		</article>
	)
}
