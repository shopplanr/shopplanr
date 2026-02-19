import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Open20Regular, Info20Regular, Image20Regular, Dismiss20Regular } from '@ricons/fluent'
import Button from './Button'

interface ItemModalProps {
	isOpen: boolean
	product: {
		id: string
		name: string
		quantity: number
		price: number | string
		note: string | null
		link: string | null
		priority: string
		image_url?: string | null
	} | null
	currencyFormatter: Intl.NumberFormat
	onClose: () => void
}

export default function ItemModal({
	isOpen,
	product,
	currencyFormatter,
	onClose
}: ItemModalProps) {
	const { t } = useTranslation()
	const [showModal, setShowModal] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setShowModal(true), 10)
		} else {
			setShowModal(false)
		}
	}, [isOpen])

	const handleCancel = () => {
		setShowModal(false)
		setTimeout(onClose, 200)
	}

	if (!isOpen || !product) return null

	const totalPrice = Number(product.price ?? 0) * Number(product.quantity ?? 0)
	const priorityColor =
		product.priority === 'highest'
			? { bg: 'bg-accent/20', text: 'text-accent' }
			: product.priority === 'higher'
				? { bg: 'bg-primary/15', text: 'text-primary' }
				: { bg: 'bg-text/7', text: 'text-text/40' }

	return createPortal(
		<div
			className={`fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 transition-opacity duration-200 p-0 md:p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${showModal ? 'opacity-100' : 'opacity-0'}`}
		>
			<div
				className={`bg-white rounded-none md:rounded-xl border-0 md:border border-accent shadow-2xl max-w-5xl w-full min-h-svh h-dvh md:min-h-0 md:h-auto md:max-h-[calc(100vh-2rem)] overflow-y-auto md:overflow-hidden p-3 md:p-6 transition-all duration-200 flex flex-col ${showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1 flex flex-wrap items-center gap-3">
						<h2 className="text-2xl font-bold text-text">{product.name}</h2>
						<span
							className={`hidden md:inline-block text-xs font-semibold px-3 py-1 rounded-md ${priorityColor.bg} ${priorityColor.text}`}
						>
							{product.priority === 'highest'
								? t('items.priorityHighest')
								: product.priority === 'higher'
									? t('items.priorityHigher')
									: t('items.priorityNormal')}
						</span>
					</div>
					<button
						onClick={() => handleCancel()}
						className="text-text/50 hover:text-text/70 transition p-1"
						aria-label="Close modal"
					>
						<Icon size="20">
							<Dismiss20Regular />
						</Icon>
					</button>
				</div>

				<div className="flex flex-col md:flex-row gap-6 md:h-full flex-1 min-h-0 md:min-h-0">
					<div
						className="w-full max-h-[30vh] md:max-h-none md:w-1/2 md:h-full md:aspect-square"
						style={{ aspectRatio: '1 / 1' }}
					>
						{product.image_url ? (
							<img
								src={product.image_url}
								alt={product.name}
								className="w-full h-full object-contain rounded-lg border border-text/10"
								onError={(e) => {
									e.currentTarget.style.display = 'none'
								}}
							/>
						) : (
							<div className="w-full h-full bg-text/5 rounded-lg border border-text/20 flex items-center justify-center">
								<div className="text-center">
									<div className="text-text/30 mx-auto mb-2">
										<Icon size="32">
											<Image20Regular />
										</Icon>
									</div>
									<p className="text-sm text-text/40">{t('modals.editItem.noImage') || 'No image'}</p>
								</div>
							</div>
						)}
					</div>

					<div className="flex-1 flex flex-col gap-4 md:gap-4 md:overflow-y-auto md:min-h-0">
						<div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:grid-cols-2 gap-4">
							<div className="bg-text/3 border border-text/20 rounded-lg p-4">
								<p className="text-sm text-text/60 mb-1">{t('items.qty')}</p>
								<p className="text-xl font-semibold text-text">{product.quantity}</p>
							</div>
							<div className="bg-text/3 border border-text/20 rounded-lg p-4">
								<p className="text-sm text-text/60 mb-1">{t('items.each')}</p>
								<p className="text-xl font-semibold text-text">
									{currencyFormatter.format(Number(product.price ?? 0))}
								</p>
							</div>
						</div>
						<div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
							<p className="text-sm text-text/60 mb-1">{t('items.total')}</p>
							<p className="text-2xl font-bold text-primary">
								{currencyFormatter.format(totalPrice)}
							</p>
						</div>
						<div className="flex-1 bg-text/3 border border-text/20 rounded-lg p-4 flex flex-col overflow-hidden min-h-18 max-h-full md:min-h-0 md:max-h-none">
							<p className="text-sm text-text/60 mb-2 flex items-center gap-2">
								<Icon size="16">
									<Info20Regular />
								</Icon>
								{t('modals.editItem.note')}
							</p>
							<p className="text-text whitespace-pre-wrap flex-1 overflow-y-auto pr-2">
								{product.note || <span className="text-text/40">{t('modals.editItem.noNote') || 'No notes'}</span>}
							</p>
						</div>
						<Button
							onClick={() => product.link && window.open(product.link, '_blank')}
							disabled={!product.link}
							fullWidth
							title={product.link ? 'Open link' : 'No link available'}
						>
							<Icon size="18">
								<Open20Regular />
							</Icon>
							<span>{t('items.open') || 'Open Link'}</span>
						</Button>
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}
