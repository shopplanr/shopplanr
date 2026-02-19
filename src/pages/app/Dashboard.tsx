import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { User } from '@supabase/supabase-js'
import { BarChart } from '@mui/x-charts/BarChart'
import { AppsListDetail20Regular, Cube20Regular, Calculator20Regular, MoneyHand20Regular, MoneySettings20Regular } from '@ricons/fluent'
import { supabase } from '../../lib/supabase'
import LoadingScreen from '../../components/LoadingScreen'
import Button from '../../components/Button'
import StatCard from '../../components/StatCard'

type ShoppingList = {
    id: string
    name: string
    budget: number | string
    created_at: string
}

type Product = {
    id: string
    list_id: string
    price: number | string
    quantity: number
}

type ShoppingHistoryItem = {
    id: string
    price: number | string
    quantity: number | string
    purchased_at: string
}

const currencyFormatter = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
})

const formatShortEuro = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 1000) {
        const rounded = Number((value / 1000).toFixed(absValue % 1000 === 0 ? 0 : 1))
        return `${rounded}k €`
    }
    return currencyFormatter.format(value)
}

const formatBoxEuro = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 1000000) {
        const rounded = Number((value / 1000000).toFixed(absValue % 1000000 === 0 ? 0 : 1))
        return `${rounded}M €`
    }
    if (absValue >= 10000) {
        const rounded = Number((value / 1000).toFixed(absValue % 1000 === 0 ? 0 : 1))
        return `${rounded}k €`
    }
    return currencyFormatter.format(value)
}

export default function Dashboard() {
    const { t } = useTranslation()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [lists, setLists] = useState<ShoppingList[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [history, setHistory] = useState<ShoppingHistoryItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const [chartDateRange, setChartDateRange] = useState<number>(30)
    const navigate = useNavigate()

    const getUser = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
            }
        } catch (err) {
            console.error('Error getting user:', err)
        }
    }

    const loadOverview = async () => {
        const { data: listData, error: listError } = await supabase
            .from('lists')
            .select('id, name, budget, created_at')
            .order('created_at', { ascending: false })
            .limit(4)

        if (listError) {
            setError(listError.message)
            setLoading(false)
            return
        }

        const { data: historyData, error: historyError } = await supabase
            .from('shopping_history')
            .select('id, price, quantity, purchased_at')
            .order('purchased_at', { ascending: true })
            .limit(90)

        if (historyError) {
            console.error('Error fetching history:', historyError)
        }

        const listIds = (listData ?? []).map((list) => list.id)

        if (listIds.length === 0) {
            setLists(listData ?? [])
            setProducts([])
            setHistory(historyData ?? [])
            setLoading(false)
            return
        }

        const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id, list_id, price, quantity')
            .in('list_id', listIds)

        if (productError) {
            setError(productError.message)
            setHistory(historyData ?? [])
            setLoading(false)
            return
        }

        setLists(listData ?? [])
        setProducts(productData ?? [])
        setHistory(historyData ?? [])
        setLoading(false)
    }

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            getUser()
            loadOverview()
        }, 0)

        return () => window.clearTimeout(timeout)
    }, [])

    const overview = useMemo(() => {
        const totalItems = products.reduce((sum, product) => sum + Number(product.quantity ?? 0), 0)
        const totalCost = products.reduce(
            (sum, product) => sum + Number(product.price ?? 0) * Number(product.quantity ?? 0),
            0
        )
        const totalBudget = lists.reduce((sum, list) => sum + Number(list.budget ?? 0), 0)
        const totalSpent = history.reduce(
            (sum, entry) => sum + Number(entry.price ?? 0) * Number(entry.quantity ?? 0),
            0
        )

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - chartDateRange)
        startDate.setHours(0, 0, 0, 0)

        const filteredHistory = history.filter((entry) => {
            const entryDate = new Date(entry.purchased_at)
            return entryDate >= startDate
        })

        const spendingMap = new Map<number, { label: string; total: number }>()

        for (let i = 0; i < chartDateRange; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
            const label = date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
            spendingMap.set(dayStart, { label, total: 0 })
        }

        filteredHistory.forEach((entry) => {
            const date = new Date(entry.purchased_at)
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
            const label = date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
            const amount = Number(entry.price ?? 0) * Number(entry.quantity ?? 0)
            const current = spendingMap.get(dayStart)
            spendingMap.set(dayStart, {
                label,
                total: (current?.total ?? 0) + amount,
            })
        })

        const spendingSeries = Array.from(spendingMap.entries())
            .map(([timestamp, data]) => ({ timestamp, ...data }))
            .sort((a, b) => a.timestamp - b.timestamp)

        const spendingLabels = spendingSeries.map((entry) => entry.label)
        const spendingValues = spendingSeries.map((entry) => Number(entry.total.toFixed(2)))

        return {
            totalLists: lists.length,
            totalItems,
            totalCost,
            totalBudget,
            totalSpent,
            spendingLabels,
            spendingValues
        }
    }, [lists, products, history, chartDateRange])

    return (
        <>
            {loading ? (
                <LoadingScreen />
            ) : (
                <main>
                    <div className="w-full space-y-8 px-2 md:px-0 md:pr-8 pb-7">
                        <div className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-text/10 bg-white p-6">
                                <h2 className="text-3xl font-bold text-text">{t('dashboard.title', { email: user?.email })}</h2>
                                <p className="text-text/60 mt-2">{t('dashboard.subtitle')}</p>
                                <div className="mt-4 flex flex-col md:flex-row gap-3">
                                    <Button onClick={() => navigate('/lists')} className="w-full md:w-auto">{t('dashboard.goToLists')}</Button>
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            setLoading(true)
                                            setError(null)
                                            await loadOverview()
                                        }}
                                        className="w-full md:w-auto"
                                    >
                                        {t('dashboard.refreshOverview')}
                                    </Button>
                                </div>
                                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                            </div>

                            <section className="grid gap-4 grid-cols-1 sm:grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                                <style>{`
                                    @media (min-width: 1400px) {
                                        section[style*="grid-template-columns"] {
                                            grid-template-columns: repeat(5, 1fr) !important;
                                        }
                                    }
                                `}</style>
                                <StatCard
                                    label={t('dashboard.statsLists')}
                                    value={overview.totalLists}
                                    icon={<AppsListDetail20Regular />}
                                    colorClass="bg-primary/10 text-primary"
                                />
                                <StatCard
                                    label={t('dashboard.statsItems')}
                                    value={overview.totalItems}
                                    icon={<Cube20Regular />}
                                    colorClass="bg-primary/10 text-primary"
                                />
                                <StatCard
                                    label={t('dashboard.statsTotalCost')}
                                    value={formatBoxEuro(overview.totalCost)}
                                    icon={<Calculator20Regular />}
                                    colorClass="bg-primary/10 text-primary"
                                />
                                <StatCard
                                    label={t('dashboard.statsBudgeted')}
                                    value={formatBoxEuro(overview.totalBudget)}
                                    icon={<MoneySettings20Regular />}
                                    colorClass="bg-primary/10 text-primary"
                                />
                                <StatCard
                                    label={t('dashboard.statsTotalSpent')}
                                    value={formatBoxEuro(overview.totalSpent)}
                                    icon={<MoneyHand20Regular />}
                                    colorClass="bg-primary/10 text-primary"
                                />
                            </section>
                        </div>

                        <section className="rounded-2xl border border-text/10 bg-white p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-text">{t('dashboard.moneySpent')}</h3>
                                    <p className="text-sm text-text/50">{t('dashboard.moneySpentDescription')}</p>
                                </div>
                                <div className="hidden md:flex gap-2">
                                    <button
                                        onClick={() => setChartDateRange(7)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartDateRange === 7
                                                ? 'bg-primary text-white'
                                                : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                            }`}
                                    >
                                        {t('dashboard.days7')}
                                    </button>
                                    <button
                                        onClick={() => setChartDateRange(30)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartDateRange === 30
                                                ? 'bg-primary text-white'
                                                : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                            }`}
                                    >
                                        {t('dashboard.days30')}
                                    </button>
                                    <button
                                        onClick={() => setChartDateRange(90)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartDateRange === 90
                                                ? 'bg-primary text-white'
                                                : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                            }`}
                                    >
                                        {t('dashboard.days90')}
                                    </button>
                                </div>
                            </div>
                            <div className="flex md:hidden gap-2 mb-4">
                                <button
                                    onClick={() => setChartDateRange(7)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${chartDateRange === 7
                                            ? 'bg-primary text-white'
                                            : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                        }`}
                                >
                                    {t('dashboard.days7')}
                                </button>
                                <button
                                    onClick={() => setChartDateRange(30)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${chartDateRange === 30
                                            ? 'bg-primary text-white'
                                            : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                        }`}
                                >
                                    {t('dashboard.days30')}
                                </button>
                                <button
                                    onClick={() => setChartDateRange(90)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${chartDateRange === 90
                                            ? 'bg-primary text-white'
                                            : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                        }`}
                                >
                                    {t('dashboard.days90')}
                                </button>
                            </div>
                            {history.length > 0 ? (
                                <div className="w-full">
                                    <BarChart
                                        height={240}
                                        xAxis={[{
                                            scaleType: 'band',
                                            data: overview.spendingLabels,
                                        }]}
                                        yAxis={[{
                                            valueFormatter: (value: number | null) => formatShortEuro(Number(value ?? 0)),
                                            width: 60,
                                        }]}
                                        series={[{
                                            data: overview.spendingValues,
                                            label: t('dashboard.chartLabel'),
                                            color: 'var(--color-primary)',
                                            valueFormatter: (value) => currencyFormatter.format(Number(value ?? 0)),
                                        }]}
                                        borderRadius={8}
                                        margin={{ top: 8, right: 20, bottom: 8, left: -12 }}
                                        sx={{
                                            '& .MuiChartsAxis-tickLabel': { fill: 'var(--color-text)' },
                                            '& .MuiChartsAxis-line': { stroke: 'var(--color-text)' },
                                            '& .MuiChartsAxis-tick': { stroke: 'var(--color-text)' },
                                            '& .MuiChartsGrid-line': { stroke: 'rgba(75, 68, 87, 0.12)' },
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-text/10 bg-white p-20 text-center">
                                    <p className="text-sm text-text/50">{t('dashboard.noHistory')}</p>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            )}
        </>
    )
}

