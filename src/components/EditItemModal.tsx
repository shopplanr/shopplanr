import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Add20Regular, Save20Regular, Link20Regular, Image20Regular, Delete20Regular, Dismiss20Regular } from '@ricons/fluent'
import Button from './Button'


type EditItemFormState = {
	name: string
	quantity: number
	price: string
	note: string
	link: string
	priority: string
	image_url: string | null
}

interface EditItemModalProps {
	isOpen: boolean
	isEditing: boolean
	isLoading?: boolean
	error?: string | null
	onSubmit: (event: React.FormEvent) => void | Promise<void>
	onCancel: () => void
	form: EditItemFormState
	onFormChange: <Field extends keyof EditItemFormState>(
		field: Field,
		value: EditItemFormState[Field]
	) => void
}

export default function EditItemModal({
	isOpen,
	isEditing,
	isLoading = false,
	error,
	onSubmit,
	onCancel,
	form,
	onFormChange
}: EditItemModalProps) {
	const { t } = useTranslation()
	const [showModal, setShowModal] = useState(false)
	const modalRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setShowModal(isOpen)
		}, isOpen ? 10 : 0)

		return () => window.clearTimeout(timeout)
	}, [isOpen])

	const handleCancel = () => {
		setShowModal(false)
		setTimeout(onCancel, 200)
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && showModal) {
				handleCancel()
			}
		}

		if (showModal) {
			document.addEventListener('keydown', handleKeyDown)
		}
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [showModal])

	if (!isOpen) return null

	return (
		<div
			ref={modalRef}
			className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 md:p-4 transition-opacity duration-200 ${showModal ? 'opacity-100' : 'opacity-0'}`}
		>
			<div
				className={`bg-white rounded-none md:rounded-xl border-0 md:border border-accent shadow-2xl max-w-5xl w-full h-dvh md:h-auto md:max-h-[80vh] overflow-y-auto md:overflow-hidden p-3 md:p-6 transition-all duration-200 flex flex-col ${showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-bold text-text flex items-center gap-2">
						<Icon size="20">
							{isEditing ? <Save20Regular /> : <Add20Regular />}
						</Icon>
						{isEditing ? t('modals.editItem.title') : t('modals.editItem.addTitle')}
					</h3>
					<button
						type="button"
						onClick={handleCancel}
						className="text-text/50 hover:text-text/70 transition p-1"
						aria-label="Close modal"
					>
						<Icon size="20">
							<Dismiss20Regular />
						</Icon>
					</button>
				</div>
				<form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col">
					<div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 md:h-full">
						<div className="flex flex-col flex-1 min-h-0">
							<div className="flex-1 min-h-0 bg-text/5 rounded-lg border border-text/10 flex items-center justify-center text-text/30 overflow-hidden">
								{form.image_url ? (
									<img
										src={form.image_url}
										alt="Preview"
										className="w-full h-full object-contain"
										onError={(e) => {
											e.currentTarget.style.display = 'none'
										}}
									/>
								) : (
									<div className="flex flex-col items-center gap-2">
										<Icon size="48">
											<Image20Regular />
										</Icon>
										<p className="text-xs text-text/40">{t('modals.editItem.noImage') || 'No image'}</p>
									</div>
								)}
							</div>
							<div className="shrink-0 pt-3">
								<label className="block text-sm font-medium text-text/70 mb-2">
									{t('modals.editItem.image') || 'Image URL'}
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50 flex items-center justify-center w-5 h-5">
										<Icon size="18">
											<Link20Regular />
										</Icon>
									</span>
									<input
										className="w-full rounded-lg border border-text/10 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 pl-10 pr-10 text-sm"
										placeholder={t('modals.editItem.imagePlaceholder') || 'https://...'}
										type="url"
										value={form.image_url || ''}
										onChange={(event) => onFormChange('image_url', event.target.value || null)}
									/>
									{form.image_url && (
										<button
											type="button"
											onClick={() => onFormChange('image_url', null)}
											className="absolute right-2 top-1/2 -translate-y-1/2 text-text/50 hover:text-text/70 transition border border-text/20 hover:border-text/40 hover:bg-text/4 rounded-md p-1 w-6.5 h-6.5 flex items-center justify-center"
											aria-label="Clear image URL"
										>
											<Icon size="16">
												<Delete20Regular />
											</Icon>
										</button>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col flex-1 min-h-0">
							<div className="flex-1 min-h-0 flex flex-col gap-4">
								<div>
									<label className="block text-sm font-medium text-text/70 mb-2">
										{t('modals.editItem.itemName')}
									</label>
									<input
										className="w-full rounded-lg border border-text/10 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
										placeholder={t('modals.editItem.itemNamePlaceholder')}
										value={form.name}
										onChange={(event) => onFormChange('name', event.target.value)}
										autoFocus
									/>
								</div>
								<div className="grid gap-3" style={{ gridTemplateColumns: '0.6fr 1.4fr' }}>
									<div>
										<label className="block text-sm font-medium text-text/70 mb-2">
											{t('modals.editItem.quantity')}
										</label>
										<input
											className="w-full rounded-lg border border-text/10 px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
											type="number"
											min="1"
											step="1"
											placeholder={t('modals.editItem.quantityPlaceholder')}
											value={form.quantity}
											onChange={(event) =>
												onFormChange('quantity', Number(event.target.value))
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-text/70 mb-2">
											{t('modals.editItem.price')}
										</label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50">€</span>
											<input
												className="w-full rounded-lg border border-text/10 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 pl-8 pr-4"
												type="number"
												min="0"
												step="0.01"
												placeholder={t('modals.editItem.pricePlaceholder')}
												value={form.price}
												onChange={(event) => onFormChange('price', event.target.value)}
											/>
										</div>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-text/70 mb-2">
										{t('modals.editItem.priority')}
									</label>
									<div className="flex items-center gap-2 w-full">
										{[
											{ value: 'normal', label: t('modals.editItem.priorityNormal') },
											{ value: 'higher', label: t('modals.editItem.priorityHigher') },
											{ value: 'highest', label: t('modals.editItem.priorityHighest') }
										].map((option) => {
											const isSelected = form.priority === option.value
											return (
												<button
													key={option.value}
													type="button"
													onClick={() => onFormChange('priority', option.value)}
													className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 ${isSelected
															? 'bg-primary text-white border-primary scale-[1.02]'
															: 'bg-white text-text/70 border-text/10 hover:border-primary/40 hover:text-text'
														}`}
												>
													{option.label}
												</button>
											)
										})}
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-text/70 mb-2">
										{t('modals.editItem.link')}
									</label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50 flex items-center justify-center w-5 h-5">
											<Icon size="18">
												<Link20Regular />
											</Icon>
										</span>
										<input
											className="w-full rounded-lg border border-text/10 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 pl-10 pr-10"
											placeholder={t('modals.editItem.linkPlaceholder')}
											type="url"
											value={form.link}
											onChange={(event) => onFormChange('link', event.target.value)}
										/>
										{form.link && (
											<button
												type="button"
												onClick={() => onFormChange('link', '')}
												className="absolute right-2 top-1/2 -translate-y-1/2 text-text/50 hover:text-text/70 transition border border-text/20 hover:border-text/40 hover:bg-text/4 rounded-md p-1 w-6.5 h-6.5 flex items-center justify-center"
												aria-label="Clear link URL"
											>
												<Icon size="16">
													<Delete20Regular />
												</Icon>
											</button>
										)}
									</div>
								</div>
								<div className="md:flex-1 md:min-h-0 flex flex-col mb-2">
									<label className="block text-sm font-medium text-text/70 mb-2">
										{t('modals.editItem.notes')}
									</label>
									<textarea
										className="w-full rounded-lg border border-text/10 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-32 md:min-h-0 md:flex-1 resize-none"
										placeholder={t('modals.editItem.notesPlaceholder')}
										value={form.note}
										onChange={(event) => onFormChange('note', event.target.value)}
									/>
								</div>
								<div className="md:hidden pb-4">
									<Button
										type="submit"
										disabled={isLoading}
										className="md:hidden w-full"
									>
										<Icon size="18">
											{isEditing ? <Save20Regular /> : <Add20Regular />}
										</Icon>
										{isLoading ? t('modals.editItem.saving') : isEditing ? t('modals.editItem.updateBtn') : t('modals.editItem.addBtn')}
									</Button>
								</div>
								{error && <p className="text-sm text-accent mt-4">{error}</p>}
							</div>
							<div className="flex gap-3 pt-4 md:pt-2 shrink-0 md:flex">
								<Button
									type="submit"
									disabled={isLoading}
									className="flex-1 hidden md:flex"
								>
									<Icon size="18">
										{isEditing ? <Save20Regular /> : <Add20Regular />}
									</Icon>
									{isLoading ? t('modals.editItem.saving') : isEditing ? t('modals.editItem.updateBtn') : t('modals.editItem.addBtn')}
								</Button>
								<Button
									type="button"
									variant="gray"
									onClick={handleCancel}
									disabled={isLoading}
									className="flex-1 hidden md:flex"
								>
									{t('modals.editItem.cancelBtn')}
								</Button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}
