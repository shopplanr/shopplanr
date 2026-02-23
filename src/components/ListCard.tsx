import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Delete20Regular, Edit20Regular, MoreVertical20Regular, Save20Regular } from '@ricons/fluent'
import { EmojiPicker } from 'frimousse'
import Button from './Button'
import ListFormModal from './ListFormModal'
import ConfirmModal from './ConfirmModal'

interface ListCardProps {
	list: {
		id: string
		name: string
		emoji?: string | null
		budget?: number | string | null
		spent?: number | string | null
	}
	itemCount: number
	totalCost: number
	currencyFormatter: Intl.NumberFormat
	onUpdateEmoji: (listId: string, emoji: string) => Promise<void>
	onUpdate: (listId: string, name: string, budget: number) => Promise<void>
	onDelete: (listId: string) => Promise<void>
	isRemoving?: boolean
}

export default function ListCard({
	list,
	itemCount,
	currencyFormatter,
	onUpdateEmoji,
	onUpdate,
	onDelete,
	isRemoving = false
}: ListCardProps) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
	const [emojiPickerVisible, setEmojiPickerVisible] = useState(false)
	const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number } | null>(null)
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const [menuVisible, setMenuVisible] = useState(false)
	const [editForm, setEditForm] = useState({ name: list.name, budget: String(list.budget ?? 0) })
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const desktopMenuRef = useRef<HTMLDivElement>(null)
	const mobileMenuRef = useRef<HTMLDivElement>(null)
	const menuTimeoutRef = useRef<number | null>(null)
	const emojiPickerTimeoutRef = useRef<number | null>(null)
	const emojiButtonRef = useRef<HTMLButtonElement>(null)

	const budget = Number(list.budget ?? 0)
	const spent = Number(list.spent ?? 0)
	const remaining = budget > 0 ? Math.max(0, budget - spent) : 0
	const budgetPercentage = budget > 0 ? (spent / budget) * 100 : 0

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

	const openEmojiPicker = () => {
		if (emojiPickerTimeoutRef.current) {
			window.clearTimeout(emojiPickerTimeoutRef.current)
		}
		const buttonRect = emojiButtonRef.current?.getBoundingClientRect()
		if (buttonRect) {
			setEmojiPickerPosition({
				top: buttonRect.bottom + 8,
				left: buttonRect.left
			})
		}
		setEmojiPickerVisible(true)
		emojiPickerTimeoutRef.current = window.setTimeout(() => setEmojiPickerOpen(true), 0)
	}

	const closeEmojiPicker = () => {
		if (emojiPickerTimeoutRef.current) {
			window.clearTimeout(emojiPickerTimeoutRef.current)
		}
		setEmojiPickerOpen(false)
		setEmojiPickerPosition(null)
		emojiPickerTimeoutRef.current = window.setTimeout(() => setEmojiPickerVisible(false), 100)
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const clickedOutsideDesktop = desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)
			const clickedOutsideMobile = mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)

			if (clickedOutsideDesktop && clickedOutsideMobile) {
				closeMenu()
			}
		}

		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [menuOpen])

	useEffect(() => {
		return () => {
			if (menuTimeoutRef.current) {
				window.clearTimeout(menuTimeoutRef.current)
			}
			if (emojiPickerTimeoutRef.current) {
				window.clearTimeout(emojiPickerTimeoutRef.current)
			}
		}
	}, [])

	return (
		<article
			role="button"
			tabIndex={0}
			onClick={() => navigate(`/list/${list.id}`)}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					navigate(`/list/${list.id}`)
				}
			}}
			className={`rounded-2xl border border-text/10 bg-white p-5 hover:border-primary/40 hover:bg-text/1.5 transition-colors cursor-pointer ${isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
				}`}
		>
			<div className={`flex flex-col md:flex-row ${budget > 0 ? 'md:items-start' : 'md:items-center'} md:justify-between gap-4`}>
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<div className="relative">
						<button
							ref={emojiButtonRef}
							onClick={(event) => {
								event.stopPropagation()
								if (emojiPickerOpen) {
									closeEmojiPicker()
								} else {
									openEmojiPicker()
								}
							}}
							className="text-2xl hover:scale-110 transition cursor-pointer border border-text/20 rounded-lg p-2 shrink-0"
							title="Click to change emoji"
						>
							{list.emoji || '🛒'}
						</button>
						{emojiPickerVisible && emojiPickerPosition && createPortal(
							<>
								<div
									className="fixed inset-0 z-40"
									onClick={(event) => {
										event.stopPropagation()
										closeEmojiPicker()
									}}
								/>
								<div
									className={`fixed origin-top-left transition-all duration-100 ease-out z-50 ${emojiPickerOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
									style={{
										top: `${emojiPickerPosition.top}px`,
										left: `${emojiPickerPosition.left}px`
									}}
									onClick={(event) => event.stopPropagation()}
								>
									<EmojiPicker.Root
										onEmojiSelect={({ emoji }: any) => {
											onUpdateEmoji(list.id, emoji)
											closeEmojiPicker()
										}}
										columns={8}
										className="isolate flex flex-col bg-white border border-text/10 rounded-xl shadow-lg"
										style={{ width: '280px', height: '280px' }}
									>
										<div className="flex items-center gap-2 px-2 py-2 shrink-0">
											<EmojiPicker.Search placeholder={t('lists.emojiSearchPlaceholder')} className="flex-1 min-w-0 appearance-none rounded-md bg-secondary/25 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
											<button
												onClick={(event) => {
													event.stopPropagation()
													closeEmojiPicker()
												}}
												className="flex items-center justify-center text-text/70 hover:text-text hover:bg-text/5 rounded-md transition shrink-0 h-7 w-7 text-base"
												title="Close emoji picker"
											>
												✕
											</button>
										</div>
										<EmojiPicker.Viewport className="relative flex-1 outline-hidden">
											<EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-text/40 text-sm">
												Loading...
											</EmojiPicker.Loading>
											<EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-text/40 text-sm">
												No emoji found.
											</EmojiPicker.Empty>
											<EmojiPicker.List
												className="select-none pb-1.5"
												components={{
													CategoryHeader: ({ category, ...props }: any) => (
														<div
															className="bg-white px-3 pt-3 pb-1.5 font-medium text-text/60 text-xs"
															{...props}
														>
															{category.label}
														</div>
													),
													Row: ({ children, ...props }: any) => (
														<div className="scroll-my-1.5 px-1.5" {...props}>
															{children}
														</div>
													),
													Emoji: ({ emoji, ...props }: any) => (
														<button
															className="flex size-8 items-center justify-center rounded-md text-lg data-active:bg-primary/10 transition"
															onClick={(event) => event.stopPropagation()}
															{...props}
														>
															{emoji.emoji}
														</button>
													),
												}}
											/>
										</EmojiPicker.Viewport>
									</EmojiPicker.Root>
								</div>
							</>,
							document.body
						)}
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="text-lg font-semibold text-text wrap-break-word">{list.name}</h3>
						<div className="items-center gap-2 md:items-center md:gap-2 hidden md:flex">
							<p className="text-sm text-text/50">{itemCount} {t('lists.items')}</p>
							{budget === 0 && (
								<>
									<span className="text-text/30 lg:inline hidden">·</span>
									<p className="text-sm text-text/50 lg:block hidden">{t('lists.noBudget')}</p>
								</>
							)}
						</div>
					</div>
				</div>
				<div className="hidden md:flex items-center gap-2 shrink-0">
					<div className="text-right">
						<p className="text-xs text-text/50">{t('lists.remaining')}</p>
						<p className="text-base md:text-lg font-semibold text-text whitespace-nowrap">{currencyFormatter.format(remaining)}</p>
					</div>
					<div className="flex items-center gap-2 pl-2 border-l border-text/10">
						<div className="relative" ref={desktopMenuRef}>
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
								aria-label="More options"
								className="shrink-0"
							>
								<Icon size="20">
									<MoreVertical20Regular />
								</Icon>
							</Button>
							{menuVisible && (
								<div
									className={`absolute bottom-full right-0 mb-2 bg-white border border-text/10 rounded-lg shadow-lg z-40 min-w-max origin-bottom-right transition-all duration-100 ease-out ${menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
									onClick={(event) => event.stopPropagation()}
								>
									<button
										className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-text/5 transition text-left first:rounded-t-lg"
										onClick={(event) => {
											event.stopPropagation()
											closeMenu()
											setEditForm({ name: list.name, budget: String(list.budget ?? 0) })
											setEditModalOpen(true)
										}}
										aria-label={t('lists.edit')}
									>
										<Icon size="16">
											<Edit20Regular />
										</Icon>
										{t('lists.editMenuBtn')}
									</button>
									<button
										className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-left last:rounded-b-lg"
										onClick={(event) => {
											event.stopPropagation()
											closeMenu()
											setDeleteModalOpen(true)
										}}
										aria-label={t('lists.delete')}
									>
										<Icon size="16">
											<Delete20Regular />
										</Icon>
										{t('lists.deleteMenuBtn')}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			{budget > 0 && (
				<div className={`md:mb-0 ${budget > 0 ? 'mb-4 mt-4' : ''}`}>
					<div className="flex items-center justify-between gap-3 mb-2">
						<div className="flex-1">
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs text-text/60">
									{currencyFormatter.format(spent)} / {currencyFormatter.format(budget)}
								</span>
								<span className={`text-xs font-medium ${budgetPercentage >= 100 ? 'text-primary' : 'text-text/60'}`}>
									{Math.min(Math.round(budgetPercentage), 100)}%
								</span>
							</div>
							<div className="w-full bg-text/10 rounded-full h-2 overflow-hidden">
								<div
									className="h-full rounded-full transition-all duration-300"
									style={{
										width: `${Math.min(budgetPercentage, 100)}%`,
										backgroundColor: budgetPercentage >= 100 ? 'var(--color-accent)' : `color-mix(in srgb, var(--color-primary) calc(100% - ${Math.min(budgetPercentage, 100)}%), var(--color-accent))`
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
			<div className="md:hidden flex items-center justify-between">
				<div>
					<p className="text-xs text-text/50">{itemCount} {t('lists.items')}</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="text-right">
						<p className="text-xs text-text/50">{t('lists.remaining')}</p>
						<p className="text-sm font-semibold text-text">{currencyFormatter.format(remaining)}</p>
					</div>
					<div className="relative" ref={mobileMenuRef}>
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
							aria-label="More options"
							className="shrink-0"
						>
							<Icon size="20">
								<MoreVertical20Regular />
							</Icon>
						</Button>
						{menuVisible && (
							<div
								className={`absolute bottom-full right-0 mb-2 bg-white border border-text/10 rounded-lg shadow-lg z-40 min-w-max origin-bottom-right transition-all duration-100 ease-out ${menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
								onClick={(event) => event.stopPropagation()}
							>
								<button
									className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-text/5 transition text-left first:rounded-t-lg"
									onClick={(event) => {
										event.stopPropagation()
										closeMenu()
										setEditForm({ name: list.name, budget: String(list.budget ?? 0) })
										setEditModalOpen(true)
									}}
									aria-label={t('lists.edit')}
								>
									<Icon size="16">
										<Edit20Regular />
									</Icon>
									{t('lists.editMenuBtn')}
								</button>
								<button
									className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-left last:rounded-b-lg"
									onClick={(event) => {
										event.stopPropagation()
										closeMenu()
										setDeleteModalOpen(true)
									}}
									aria-label={t('lists.delete')}
								>
									<Icon size="16">
										<Delete20Regular />
									</Icon>
									{t('lists.deleteMenuBtn')}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			<ListFormModal
				isOpen={editModalOpen}
				title={t('modals.listForm.editTitle')}
				titleIcon={<Edit20Regular />}
				submitText={saving ? t('modals.editItem.saving') : t('modals.listForm.update')}
				submitIcon={<Save20Regular />}
				cancelText={t('items.cancel')}
				name={editForm.name}
				budget={editForm.budget}
				nameLabel={t('modals.listForm.listName')}
				budgetLabel={t('modals.listForm.budget')}
				budgetPrefix="€"
				onNameChange={(value) => setEditForm((prev) => ({ ...prev, name: value }))}
				onBudgetChange={(value) => setEditForm((prev) => ({ ...prev, budget: value }))}
				onSubmit={async (e) => {
					e.preventDefault()
					if (!editForm.name.trim()) return
					setSaving(true)
					await onUpdate(list.id, editForm.name.trim(), Number(editForm.budget ?? 0))
					setSaving(false)
					setEditModalOpen(false)
				}}
				onCancel={() => setEditModalOpen(false)}
				isLoading={saving}
				autoFocus
			/>
			<ConfirmModal
				isOpen={deleteModalOpen}
				title={t('lists.deleteListTitle')}
				titleIcon={<Delete20Regular />}
				message={t('lists.deleteListWarning')}
				confirmText={t('lists.deleteListBtn')}
				cancelText={t('items.cancel')}
				onConfirm={async () => {
					setDeleteModalOpen(false)
					setDeleting(true)
					await onDelete(list.id)
					setDeleting(false)
				}}
				onCancel={() => setDeleteModalOpen(false)}
				isLoading={deleting}
			/>
		</article>
	)
}