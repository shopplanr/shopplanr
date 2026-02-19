import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import HistoryCard from '../../components/HistoryCard'
import LoadingScreen from '../../components/LoadingScreen'

type HistoryItem = {
	id: string
	list_name: string
	item_name: string
	quantity: number
	price: number | string
	purchased_at: string
}

const currencyFormatter = new Intl.NumberFormat('bg-BG', {
	style: 'currency',
	currency: 'EUR'
})

export default function History() {
	const { t } = useTranslation()
	const [items, setItems] = useState<HistoryItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		loadHistory()
	}, [])

	const loadHistory = async () => {
		try {
			setLoading(true)
			const { data: historyData, error: historyError } = await supabase
				.from('shopping_history')
				.select('id, list_name, item_name, quantity, price, purchased_at')
				.order('purchased_at', { ascending: false })

			if (historyError) {
				setError(historyError.message)
				return
			}

			setItems(historyData ?? [])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load history')
		} finally {
			setLoading(false)
		}
	}

	const totalSpent = items.reduce((sum, item) => {
		return sum + (Number(item.price) * Number(item.quantity))
	}, 0)

	const filteredItems = items.filter((item) => {
		const query = searchQuery.toLowerCase()
		return (
			item.item_name.toLowerCase().includes(query) ||
			item.list_name.toLowerCase().includes(query)
		)
	})

	return (
		<>
			{loading ? (
				<LoadingScreen />
			) : (
				<main className="flex flex-col h-full">
					<div className="shrink-0 w-full space-y-4 px-2 md:px-0 md:pr-8 pb-4">
						<header>
						<h1 className="text-3xl font-bold text-text">{t('history.title')}</h1>
						<p className="text-text/70 mt-1">{t('history.subtitle')}</p>
						</header>

						{error && (
							<div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
								{error}
							</div>
						)}

						{items.length > 0 && (
							<>
								<div className="rounded-xl border border-text/10 bg-white p-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
										<p className="text-sm text-text/60">{t('history.totalItemsPurchased')}</p>
										<p className="text-2xl font-semibold text-text">{items.length}</p>
										</div>
										<div>
										<p className="text-sm text-text/60">{t('history.totalSpent')}</p>
										<p className="text-2xl font-semibold text-text">{currencyFormatter.format(totalSpent)}</p>
										</div>
									</div>
								</div>

								<div className="rounded-lg border border-text/10 bg-white p-1">
									<input
										type="text"
										placeholder={t('history.searchPlaceholder')}
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full px-3 py-1.5 text-sm text-text bg-transparent border-none outline-none placeholder:text-text/40"
									/>
								</div>
							</>
						)}

						<hr className="border-text/10" />
					</div>

				<div className="flex-1 overflow-y-auto w-full px-2 md:px-0 md:pr-8">
					{items.length === 0 ? (
					<div className="rounded-xl border border-dashed border-text/20 bg-white p-12 text-center">
						<p className="text-text/60">{t('history.noItems')}</p>
						</div>
					) : (
						<div className="space-y-2 pb-8">
							{filteredItems.length === 0 ? (
								<div className="rounded-xl border border-dashed border-text/20 bg-white p-12 text-center">
									<p className="text-text/60">{t('history.noMatches')}</p>
								</div>
							) : (
								filteredItems.map((item) => (
									<HistoryCard
										key={item.id}
										itemName={item.item_name}
										listName={item.list_name}
										quantity={Number(item.quantity)}
										price={Number(item.price)}
										purchasedAt={item.purchased_at}
									/>
								))
							)}
						</div>
					)}
				</div>
			</main>
			)}
		</>
	)
}
