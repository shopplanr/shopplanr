import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import Button from '../../components/Button'
import ListCard from '../../components/ListCard'
import LoadingScreen from '../../components/LoadingScreen'
import ListFormModal from '../../components/ListFormModal'
import { Icon } from '@ricons/utils'
import { Add20Regular, Cart20Regular } from '@ricons/fluent'

type ShoppingList = {
	id: string
	name: string
	budget: number | string
	created_at: string
	emoji: string | null
}

type Product = {
	id: string
	list_id: string
	price: number | string
	quantity: number
}

const initialForm = {
	name: '',
	budget: ''
}

const currencyFormatter = new Intl.NumberFormat('bg-BG', {
	style: 'currency',
	currency: 'EUR',
})

export default function ShoppingLists() {
	const { t } = useTranslation()
	const [lists, setLists] = useState<ShoppingList[]>([])
	const [products, setProducts] = useState<Product[]>([])
	const [form, setForm] = useState(initialForm)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [createModalOpen, setCreateModalOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [removingListId, setRemovingListId] = useState<string | null>(null)

	const loadLists = async () => {
		const { data: listData, error: listError } = await supabase
			.from('lists')
			.select('id, name, budget, spent, created_at, emoji')
			.order('created_at', { ascending: false })

		if (listError) {
			setError(listError.message)
			setLoading(false)
			return
		}

		const listIds = (listData ?? []).map((list) => list.id)

		if (listIds.length === 0) {
			setLists(listData ?? [])
			setProducts([])
			setLoading(false)
			return
		}

		const { data: productData, error: productError } = await supabase
			.from('products')
			.select('id, list_id, price, quantity')
			.in('list_id', listIds)

		if (productError) {
			setError(productError.message)
			setLoading(false)
			return
		}

		setLists(listData ?? [])
		setProducts(productData ?? [])
		setLoading(false)
	}

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			loadLists()
		}, 0)

		return () => window.clearTimeout(timeout)
	}, [])

	const listMetrics = useMemo(() => {
		const totals = new Map<string, { itemCount: number; cost: number }>()

		products.forEach((product) => {
			const price = Number(product.price ?? 0)
			const quantity = Number(product.quantity ?? 0)
			const existing = totals.get(product.list_id) ?? { itemCount: 0, cost: 0 }
			totals.set(product.list_id, {
				itemCount: existing.itemCount + quantity,
				cost: existing.cost + price * quantity
			})
		})

		return totals
	}, [products])

	const filteredLists = useMemo(() => {
		if (!searchQuery.trim()) return lists
		const query = searchQuery.toLowerCase()
		return lists.filter((list) => list.name.toLowerCase().includes(query))
	}, [lists, searchQuery])

	const handleCreateList = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!form.name.trim()) return

		setSaving(true)
		setError(null)

		const budgetAmount = form.budget ? Number(form.budget) : 0
		const { error: insertError } = await supabase.from('lists').insert({
			name: form.name.trim(),
			budget: budgetAmount,
			spent: 0
		})

		if (insertError) {
			setError(insertError.message)
			setSaving(false)
			return
		}

		setForm(initialForm)
		setSaving(false)
		setCreateModalOpen(false)
		await loadLists()
	}

	const handleUpdateListEmoji = async (listId: string, emoji: string) => {
		const { error: updateError } = await supabase
			.from('lists')
			.update({ emoji: emoji || null })
			.eq('id', listId)

		if (updateError) {
			setError(updateError.message)
			return
		}

		await loadLists()
	}

	const handleUpdateList = async (listId: string, name: string, budget: number) => {
		const { error: updateError } = await supabase
			.from('lists')
			.update({ name, budget })
			.eq('id', listId)

		if (updateError) {
			setError(updateError.message)
			return
		}

		await loadLists()
	}

	const handleDeleteList = async (listId: string) => {
		setRemovingListId(listId)

		await new Promise((resolve) => setTimeout(resolve, 150))

		const { error: deleteError } = await supabase
			.from('lists')
			.delete()
			.eq('id', listId)

		if (deleteError) {
			setError(deleteError.message)
			setRemovingListId(null)
			return
		}

		await loadLists()
		setRemovingListId(null)
	}

	return (
		<>
			{loading ? (
				<LoadingScreen />
			) : (
				<main>
					<div className="w-full space-y-4 px-2 md:px-0 md:pr-8">
						<header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<h1 className="text-3xl font-bold text-text">{t('lists.title')}</h1>
								<p className="text-text/70 mt-1">{t('lists.subtitle')}</p>
							</div>
							<Button onClick={() => setCreateModalOpen(true)} className="md:shrink-0 w-full md:w-auto">
								<Icon size="20">
									<Add20Regular />
								</Icon>
								{t('lists.addList')}
							</Button>
						</header>

						{lists.length > 0 && (
							<>
								<div className="rounded-lg border border-text/10 bg-white p-1">
									<input
										type="text"
										placeholder={t('lists.searchPlaceholder')}
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full px-3 py-1.5 text-sm text-text bg-transparent border-none outline-none placeholder:text-text/40"
									/>
								</div>
								<hr className="border-text/10" />
							</>
						)}
						<section className="space-y-2">
							{lists.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-text/20 bg-white p-10 text-center text-text/60">
									No lists yet. Click on "Add list" to get started.
								</div>
							) : filteredLists.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-text/20 bg-white p-10 text-center text-text/60">
									No lists match your search.
								</div>
						) : (
							<div className="space-y-3 pb-4">
								{filteredLists.map((list) => {
										const metrics = listMetrics.get(list.id) ?? { itemCount: 0, cost: 0 }
										return (
											<ListCard
												key={list.id}
												list={list}
												itemCount={metrics.itemCount}
												totalCost={metrics.cost}
												currencyFormatter={currencyFormatter}
												onUpdateEmoji={handleUpdateListEmoji}
												onUpdate={handleUpdateList}
												onDelete={handleDeleteList}
												isRemoving={removingListId === list.id}
											/>
										)
									})}
								</div>
							)}
						</section>

						<ListFormModal
							isOpen={createModalOpen}
							title={t('modals.listForm.createTitle')}
							titleIcon={<Cart20Regular />}
							submitText={saving ? t('modals.editItem.saving') : t('modals.listForm.create')}
							submitIcon={<Add20Regular />}
							cancelText={t('items.cancel')}
							name={form.name}
							budget={form.budget}
							nameLabel={t('modals.listForm.listName')}
							budgetLabel={t('modals.listForm.budget')}
						namePlaceholder={t('lists.namePlaceholder')}
						budgetPlaceholder={t('lists.budgetPlaceholder')}
							budgetPrefix="€"
							onNameChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
							onBudgetChange={(value) => setForm((prev) => ({ ...prev, budget: value }))}
							onSubmit={handleCreateList}
							onCancel={() => setCreateModalOpen(false)}
							isLoading={saving}
							error={error}
							autoFocus
						/>
					</div>
				</main>
			)}
		</>
	)
}
