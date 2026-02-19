import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { ArrowLeft20Regular, Add20Regular, Delete20Regular, ArrowSort20Regular, Cart20Regular, Info20Regular } from '@ricons/fluent'
import { supabase } from '../../lib/supabase'
import Button from '../../components/Button'
import ItemCard from '../../components/ItemCard'
import ItemModal from '../../components/ItemModal'
import EditItemModal from '../../components/EditItemModal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingScreen from '../../components/LoadingScreen'

type ShoppingList = {
	id: string
	name: string
	emoji?: string | null
	budget: number | string
	spent: number | string
}

type Product = {
	id: string
	list_id: string
	name: string
	quantity: number
	price: number | string
	note: string | null
	link: string | null
	priority: string
	image_url: string | null
}

const currencyFormatter = new Intl.NumberFormat('bg-BG', {
	style: 'currency',
	currency: 'EUR'
})

const initialProductForm = {
	name: '',
	quantity: 1,
	price: '',
	note: '',
	link: '',
	priority: 'normal',
	image_url: null as string | null
}

export default function ShoppingListView() {
	const { t } = useTranslation()
	const { id } = useParams()
	const navigate = useNavigate()
	const [list, setList] = useState<ShoppingList | null>(null)
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editingProductId, setEditingProductId] = useState<string | null>(null)
	const [productForm, setProductForm] = useState(initialProductForm)
	const [itemModalOpen, setItemModalOpen] = useState(false)
	const [viewingProductId, setViewingProductId] = useState<string | null>(null)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [productToDelete, setProductToDelete] = useState<Product | null>(null)
	const [clearModalOpen, setClearModalOpen] = useState(false)
	const [clearing, setClearing] = useState(false)
	const [removingIds, setRemovingIds] = useState<string[]>([])
	const [orderBy, setOrderBy] = useState<'priority' | 'price' | 'name'>('priority')
	const [orderMenuOpen, setOrderMenuOpen] = useState(false)
	const [orderMenuVisible, setOrderMenuVisible] = useState(false)
	const orderMenuRef = useRef<HTMLDivElement>(null)
	const orderMenuTimeoutRef = useRef<number | null>(null)
	const removalTimeoutsRef = useRef<Record<string, number>>({})
	const [toastMessage, setToastMessage] = useState<string | null>(null)
	const [toastVisible, setToastVisible] = useState(false)
	const toastTimeoutRef = useRef<number | null>(null)

	const openOrderMenu = () => {
		if (orderMenuTimeoutRef.current) {
			window.clearTimeout(orderMenuTimeoutRef.current)
		}
		setOrderMenuVisible(true)
		orderMenuTimeoutRef.current = window.setTimeout(() => setOrderMenuOpen(true), 0)
	}

	const closeOrderMenu = () => {
		if (orderMenuTimeoutRef.current) {
			window.clearTimeout(orderMenuTimeoutRef.current)
		}
		setOrderMenuOpen(false)
		orderMenuTimeoutRef.current = window.setTimeout(() => setOrderMenuVisible(false), 150)
	}

	const showToast = () => {
		if (toastTimeoutRef.current) {
			window.clearTimeout(toastTimeoutRef.current)
		}
		setToastMessage(t('shoppingList.itemMarkedPurchased'))
		setToastVisible(true)
		toastTimeoutRef.current = window.setTimeout(() => setToastVisible(false), 3200)
	}

	const startRemoveItem = (productId: string) => {
		setRemovingIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
		if (removalTimeoutsRef.current[productId]) {
			window.clearTimeout(removalTimeoutsRef.current[productId])
		}
		removalTimeoutsRef.current[productId] = window.setTimeout(() => {
			setProducts((prev) => prev.filter((item) => item.id !== productId))
			setRemovingIds((prev) => prev.filter((id) => id !== productId))
			delete removalTimeoutsRef.current[productId]
		}, 150)
	}

	const loadList = async (listId: string) => {
		const { data: listData, error: listError } = await supabase
			.from('lists')
			.select('id, name, budget, spent, emoji')
			.eq('id', listId)
			.single()

		if (listError) {
			setError(listError.message)
			setLoading(false)
			return
		}

		const { data: productData, error: productError } = await supabase
			.from('products')
			.select('id, list_id, name, quantity, price, note, link, priority, image_url')
			.eq('list_id', listData.id)
			.order('created_at', { ascending: true })

		if (productError) {
			setError(productError.message)
			setLoading(false)
			return
		}

		setList(listData)
		setProducts(productData ?? [])
		setLoading(false)
	}

	useEffect(() => {
		if (!id) return
		const timeout = window.setTimeout(() => {
			loadList(id)
		}, 0)

		return () => window.clearTimeout(timeout)
	}, [id])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (orderMenuRef.current && !orderMenuRef.current.contains(event.target as Node)) {
				closeOrderMenu()
			}
		}

		if (orderMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [orderMenuOpen])

	const totals = useMemo(() => {
		const totalItems = products.reduce((sum, product) => sum + Number(product.quantity ?? 0), 0)
		const budget = Number(list?.budget ?? 0)
		const spent = Number(list?.spent ?? 0)
		const remaining = budget - spent

		return { spent, totalItems, budget, remaining }
	}, [products, list?.budget, list?.spent])

	const sortedProducts = useMemo(() => {
		const priorityOrder: Record<string, number> = { normal: 0, higher: 1, highest: 2 }
		return [...products].sort((a, b) => {
			if (orderBy === 'priority') {
				const priorityDiff = (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0)
				if (priorityDiff !== 0) return priorityDiff
				return a.name.localeCompare(b.name)
			}
			if (orderBy === 'price') {
				const totalA = Number(a.price ?? 0) * Number(a.quantity ?? 0)
				const totalB = Number(b.price ?? 0) * Number(b.quantity ?? 0)
				if (totalB !== totalA) return totalB - totalA
				return a.name.localeCompare(b.name)
			}
			return a.name.localeCompare(b.name)
		})
	}, [products, orderBy])

	useEffect(() => {
		const removalTimeouts = removalTimeoutsRef.current
		return () => {
			if (orderMenuTimeoutRef.current) {
				window.clearTimeout(orderMenuTimeoutRef.current)
			}
			if (toastTimeoutRef.current) {
				window.clearTimeout(toastTimeoutRef.current)
			}
			Object.values(removalTimeouts).forEach((timeoutId) => {
				window.clearTimeout(timeoutId)
			})
		}
	}, [])

	const handleSubmitProduct = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!list) return
		if (!productForm.name.trim()) return

		setSaving(true)
		setError(null)

		try {
			if (editingProductId) {
				const { error: updateError } = await supabase
					.from('products')
					.update({
						name: productForm.name.trim(),
						quantity: Number(productForm.quantity ?? 1),
						price: Number(productForm.price ?? 0),
						note: productForm.note ? productForm.note.trim() : null,
						link: productForm.link ? productForm.link.trim() : null,
						priority: productForm.priority,
						image_url: productForm.image_url
					})
					.eq('id', editingProductId)
				if (updateError) {
					setError(updateError.message)
					setSaving(false)
					return
				}
			} else {
				const { error: insertError } = await supabase
					.from('products')
					.insert({
						list_id: list.id,
						name: productForm.name.trim(),
						quantity: Number(productForm.quantity ?? 1),
						price: Number(productForm.price ?? 0),
						note: productForm.note ? productForm.note.trim() : null,
						link: productForm.link ? productForm.link.trim() : null,
						priority: productForm.priority,
						image_url: productForm.image_url
					})
				if (insertError) {
					setError(insertError.message)
					setSaving(false)
					return
				}
			}

			setSaving(false)
			setEditingProductId(null)
			setProductForm(initialProductForm)
			setItemModalOpen(false)
			if (id) {
				setLoading(true)
				setError(null)
				await loadList(id)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
			setSaving(false)
		}
	}

	const startEditProduct = (product: Product) => {
		setEditingProductId(product.id)
		setProductForm({
			name: product.name,
			quantity: Number(product.quantity ?? 1),
			price: product.price ? String(product.price) : '',
			note: product.note ?? '',
			link: product.link ?? '',
			priority: product.priority,
			image_url: product.image_url ?? null
		})
		setItemModalOpen(true)
	}

	const handleDeleteProduct = (product: Product) => {
		setProductToDelete(product)
		setDeleteModalOpen(true)
	}

	const confirmClearList = async () => {
		if (!list) return
		setClearing(true)

		try {
			const { error: deleteError } = await supabase
				.from('products')
				.delete()
				.eq('list_id', list.id)

			if (!deleteError) {
				const { error: updateError } = await supabase
					.from('lists')
					.update({ spent: 0 })
					.eq('id', list.id)
				if (!updateError) {
					setProducts([])
					setList(prev => prev ? { ...prev, spent: 0 } : null)
					setClearModalOpen(false)
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setClearing(false)
		}
	}

	const confirmDeleteProduct = async () => {
		if (!productToDelete || !list) return
		setDeleting(true)

		try {
			const { error: deleteError } = await supabase
				.from('products')
				.delete()
				.eq('id', productToDelete.id)

			if (deleteError) {
				setError(deleteError.message)
				setDeleting(false)
				return
			}

			setDeleting(false)
			setDeleteModalOpen(false)
			setProductToDelete(null)

			if (id) {
				setLoading(true)
				setError(null)
				await loadList(id)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
			setDeleting(false)
		}
	}

	const handleMarkPurchased = async (product: Product) => {
		try {
			const { data: { session } } = await supabase.auth.getSession()
			if (!session?.user.id) return
			if (!list) return

			const { error: historyError } = await supabase
				.from('shopping_history')
				.insert({
					user_id: session.user.id,
					list_name: list.name,
					item_name: product.name,
					quantity: product.quantity,
					price: Number(product.price),
					purchased_at: new Date().toISOString()
				})

			if (historyError) {
				setError(historyError.message)
				return
			}

			const { error: deleteError } = await supabase
				.from('products')
				.delete()
				.eq('id', product.id)

			if (deleteError) {
				setError(deleteError.message)
				return
			}

			const itemCost = Number(product.quantity ?? 1) * Number(product.price ?? 0)
			const currentSpent = Number(list?.spent ?? 0)
			const newSpent = currentSpent + itemCost
			const { error: spentError } = await supabase
				.from('lists')
				.update({ spent: newSpent })
				.eq('id', list.id)

			if (spentError) {
				setError(spentError.message)
				return
			}

			setList(prev => prev ? { ...prev, spent: newSpent } : null)

			showToast()

			if (id) {
				setError(null)
				await loadList(id)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to mark as purchased')
		}
	}

	if (loading) {
		return <LoadingScreen />
	}

	if (!list) {
		return (
			<main>
				<div className="max-w-5xl mx-auto rounded-2xl border border-text/10 bg-white p-10 text-text/60">
					{t('shoppingList.listNotFound')}
				</div>
			</main>
		)
	}

	return (
		<main>
			<div className="w-full space-y-6 px-2 md:px-0 md:pr-8">
				<div className="flex flex-col gap-2">
					<div className="flex items-start gap-2">
						<h1 className="text-3xl font-bold text-text leading-10">
							<Button
								variant="ghosticon"
								onClick={() => navigate('/lists')}
								aria-label={t('shoppingList.goBack')}
								className="shrink-0 float-left mr-3 -ml-2"
							>
								<Icon size="20">
									<ArrowLeft20Regular />
								</Icon>
							</Button>
							<span className="text-2xl" aria-hidden>
								{list.emoji || '🛒'}
							</span>
							{' '}
							{list.name}
						</h1>
						<div className="flex-1" />
						<Button
							onClick={() => setItemModalOpen(true)}
							className="shrink-0 hidden md:flex"
						>
							<Icon size="20">
								<Add20Regular />
							</Icon>
							{t('shoppingList.addItem')}
						</Button>
					</div>
					<p className="text-text/70 clear-both">{t('shoppingList.manageItems')}</p>
				</div>
				<section className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span className="text-text/70 flex flex-wrap items-center gap-1.5">
							<span className="font-semibold text-text">{currencyFormatter.format(totals.spent)}</span>
							<span>/ {currencyFormatter.format(totals.budget)}</span>
							<span className="relative group inline-flex items-center">
								<Icon size="16">
									<Info20Regular />
								</Icon>
								<span className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 w-56 -translate-x-1/2 rounded-lg border border-text/10 bg-white px-2.5 py-2 text-xs text-text shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100">
									{t('shoppingList.spentInfo')}
								</span>
							</span>
							{totals.budget > 0 && totals.spent > totals.budget ? (
								<span className="font-semibold text-accent w-full sm:w-auto">
									{t('shoppingList.budgetExceeded', { percentage: Math.round(((totals.spent - totals.budget) / totals.budget) * 100) })}
								</span>
							) : null}
						</span>
						<span className="text-text/60">
							{totals.totalItems} {t('shoppingList.itemCount', { count: totals.totalItems })}
						</span>
					</div>
					<div className="flex flex-col md:flex-row md:items-center gap-3">
						<div className="w-full h-3 bg-text/10 rounded-full overflow-hidden md:flex-1">
							<div
								className="h-full transition-all duration-300 rounded-full"
								style={{
									width: `${Math.min((totals.spent / totals.budget) * 100, 100)}%`,
									backgroundColor: totals.remaining > 0 ? `color-mix(in srgb, var(--color-primary) calc(100% - ${Math.min((totals.spent / totals.budget) * 100, 100)}%), var(--color-accent))` : 'var(--color-accent)'
								}}
							/>
						</div>
						<div className="flex flex-col gap-3 w-full md:w-auto">
							<Button
								onClick={() => setItemModalOpen(true)}
								className="shrink-0 w-full md:hidden"
							>
								<Icon size="20">
									<Add20Regular />
								</Icon>
								{t('shoppingList.addItem')}
							</Button>
							<div className="flex flex-row gap-3 w-full md:flex-row md:w-auto">
								<Button
									variant="ghost"
									onClick={() => setClearModalOpen(true)}
									aria-label={t('shoppingList.clear')}
									className="shrink-0 flex-1 md:w-auto"
								>
									<Icon size="20">
										<Delete20Regular />
									</Icon>
									{t('shoppingList.clearButton')}
								</Button>
								<div className="relative flex-1 md:w-auto" ref={orderMenuRef}>
									<Button
										variant="ghost"
										onClick={() => {
											if (orderMenuOpen) {
												closeOrderMenu()
											} else {
												openOrderMenu()
											}
										}}
										aria-label={t('shoppingList.sort')}
										className="shrink-0 w-full md:w-auto"
									>
										<Icon size="20">
											<ArrowSort20Regular />
										</Icon>
										{t('shoppingList.sort')}
									</Button>

									{orderMenuVisible && (
										<div
											className={`absolute top-full right-0 md:right-0 mt-2 bg-white border border-text/10 rounded-lg shadow-lg z-40 min-w-45 origin-top-right transition-all duration-150 ease-out ${orderMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
												}`}
										>
											<div className="px-3 py-2 text-xs font-semibold text-text flex items-center gap-1.5">
												<Icon size="14">
													<ArrowSort20Regular />
												</Icon>
												{t('shoppingList.sortBy')}
											</div>
											<button
												onClick={() => {
													setOrderBy('priority')
													closeOrderMenu()
												}}
												className={`w-full px-3 py-2 text-sm text-left transition hover:bg-primary/5 ${orderBy === 'priority' ? 'text-primary font-semibold' : 'text-text'}`}
											>
												{t('shoppingList.sortByPriority')}
											</button>
											<button
												onClick={() => {
													setOrderBy('price')
													closeOrderMenu()
												}}
												className={`w-full px-3 py-2 text-sm text-left transition hover:bg-primary/5 ${orderBy === 'price' ? 'text-primary font-semibold' : 'text-text'}`}
											>
												{t('shoppingList.sortByPrice')}
											</button>
											<button
												onClick={() => {
													setOrderBy('name')
													closeOrderMenu()
												}}
												className={`w-full px-3 py-2 text-sm text-left transition hover:bg-primary/5 ${orderBy === 'name' ? 'text-primary font-semibold' : 'text-text'}`}
											>
												{t('shoppingList.sortByName')}
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className="border-b border-text/10" />
				<section className="space-y-4">
					{products.length === 0 ? (
						<div className="rounded-xl border border-dashed border-text/20 bg-white p-12 text-center">
							<p className="text-text/60 mb-4">{t('shoppingList.noItems')}</p>
							<div className="flex justify-center">
								<Button onClick={() => setItemModalOpen(true)}>
									<Icon size="20">
										<Add20Regular />
									</Icon>
									{t('shoppingList.addItem')}
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-3 pb-6">
							{sortedProducts.map((product) => {
								const isRemoving = removingIds.includes(product.id)
								return (
									<div
										key={product.id}
										className={`overflow-visible transition-all duration-150 ${isRemoving ? 'max-h-0 opacity-0 scale-95' : 'max-h-125 opacity-100 scale-100'
											}`}
									>
										<ItemCard
											product={product}
											currencyFormatter={currencyFormatter}
											onViewDetails={() => setViewingProductId(product.id)}
											onEdit={() => startEditProduct(product)}
											onDelete={() => handleDeleteProduct(product)}
											onMarkPurchased={() => {
												startRemoveItem(product.id)
												handleMarkPurchased(product)
											}}
											isRemoving={isRemoving}
										/>
									</div>
								)
							})}
						</div>
					)}
				</section>
				<ItemModal
					isOpen={viewingProductId !== null}
					product={products.find((p) => p.id === viewingProductId) ?? null}
					currencyFormatter={currencyFormatter}
					onClose={() => setViewingProductId(null)}
				/>
				<EditItemModal
					isOpen={itemModalOpen}
					isEditing={editingProductId !== null}
					isLoading={saving}
					error={error}
					form={productForm}
					onFormChange={(field, value) => {
						setProductForm((prev) => ({ ...prev, [field]: value }))
					}}
					onSubmit={handleSubmitProduct}
					onCancel={() => {
						setItemModalOpen(false)
						setEditingProductId(null)
						setProductForm(initialProductForm)
					}}
				/>
				<ConfirmModal
					isOpen={clearModalOpen}
					title={t('shoppingList.clearConfirmTitle') || 'Clear list?'}
					titleIcon={<Delete20Regular />}
					message={t('shoppingList.clearConfirmWarning') || 'This will delete all items and reset the budget spent.'}
					confirmText={clearing ? t('modals.confirm.clearing') || 'Clearing...' : t('shoppingList.confirmClear') || 'Clear'}
					cancelText={t('items.cancel')}
					onConfirm={confirmClearList}
					onCancel={() => setClearModalOpen(false)}
					isLoading={clearing}
				/>
				<ConfirmModal
					isOpen={deleteModalOpen}
					title={t('items.deleteItemTitle')}
					titleIcon={<Delete20Regular />}
					message={t('items.deleteItemWarning')}
					confirmText={deleting ? t('modals.confirm.deleting') : t('items.confirmDelete')}
					cancelText={t('items.cancel')}
					highlightInfo={
						productToDelete
							? { label: t('items.item') || 'Item', value: productToDelete.name }
							: undefined
					}
					onConfirm={confirmDeleteProduct}
					onCancel={() => {
						setDeleteModalOpen(false)
						setProductToDelete(null)
					}}
					isLoading={deleting}
				/>

				{toastMessage && (
					<div
						className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border border-text/10 bg-white px-5 py-4 text-text shadow-lg transition-all duration-150 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
							}`}
					>
						<div className="mt-0.5">
							<Icon size="18">
								<Cart20Regular />
							</Icon>
						</div>
						<div className="space-y-0.5">
							<div className="text-sm font-semibold">{t('shoppingList.itemMarkedPurchased')}</div>
							<div className="text-xs text-text/60">{t('shoppingList.savedToHistory')}</div>
						</div>
					</div>
				)}
			</div>
		</main>
	)
}
