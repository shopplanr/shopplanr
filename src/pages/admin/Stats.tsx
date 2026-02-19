import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartMultiple20Regular, People20Regular, AppsListDetail20Regular } from '@ricons/fluent'
import { BarChart } from '@mui/x-charts/BarChart'
import StatCard from '../../components/StatCard'
import { supabase } from '../../lib/supabase'
import LoadingScreen from '../../components/LoadingScreen'

type UserSignup = {
    id: string
    created_at: string
}

export default function Stats() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<UserSignup[]>([])
    const [dateRange, setDateRange] = useState<number>(30)
    const [totalUsers, setTotalUsers] = useState<number>(0)
    const [totalLists, setTotalLists] = useState<number>(0)

    const loadUserSignups = async () => {
        setLoading(true)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - dateRange)
        startDate.setHours(0, 0, 0, 0)

        try {
            const { data, error } = await supabase.functions.invoke('list-all-users')

            if (error || !data?.users) {
                console.error('Error fetching user signups:', error || 'No users returned')
                setLoading(false)
                return
            }

            setTotalUsers(data.users.length - 1)

            const filteredUsers = data.users.filter((user: any) => {
                const userDate = new Date(user.created_at)
                return userDate >= startDate
            })

            setUsers(filteredUsers.map((user: any) => ({
                id: user.id,
                created_at: user.created_at,
            })))
        } catch (error) {
            console.error('Error fetching user signups:', error)
        }

        try {
            const { data: listData, error: listError } = await supabase.functions.invoke('get-list-count')

            if (!listError && listData?.count !== undefined) {
                setTotalLists(listData.count)
            }
        } catch (error) {
            console.error('Error fetching lists:', error)
        }

        setLoading(false)
    }

    useEffect(() => {
        loadUserSignups()
    }, [dateRange])

    const chartData = useMemo(() => {
        const signupsMap = new Map<number, { label: string; count: number }>()

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - dateRange)
        startDate.setHours(0, 0, 0, 0)

        for (let i = 0; i < dateRange; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
            const label = date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
            signupsMap.set(dayStart, { label, count: 0 })
        }

        users.forEach((user) => {
            const date = new Date(user.created_at)
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
            const label = date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })

            const current = signupsMap.get(dayStart)
            signupsMap.set(dayStart, {
                label,
                count: (current?.count ?? 0) + 1,
            })
        })

        const signupsSeries = Array.from(signupsMap.entries())
            .map(([timestamp, data]) => ({ timestamp, ...data }))
            .sort((a, b) => a.timestamp - b.timestamp)

        const averageNewUsersPerDay = users.length > 0 ? (users.length / dateRange).toFixed(1) : '0'

        return {
            labels: signupsSeries.map((entry) => entry.label),
            values: signupsSeries.map((entry) => entry.count),
            averageNewUsersPerDay,
        }
    }, [users, dateRange])

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <main className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">{t('admin.stats.title')}</h1>
                <p className="text-text/60">{t('admin.stats.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label={t('admin.stats.totalUsers')}
                    value={totalUsers}
                    icon={<People20Regular />}
                    colorClass="bg-primary/10 text-primary"
                />

                <StatCard
                    label={t('admin.stats.activeLists')}
                    value={totalLists}
                    icon={<AppsListDetail20Regular />}
                    colorClass="bg-primary/10 text-primary"
                />

                <StatCard
                    label={t('admin.stats.avgNewUsersPerDay')}
                    value={chartData.averageNewUsersPerDay}
                    icon={<ChartMultiple20Regular />}
                    colorClass="bg-primary/10 text-primary"
                />
            </div>
            <div className="bg-white border border-accent/20 rounded-xl p-4 md:p-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-text">{t('admin.stats.chartTitle')}</h2>
                        <p className="text-sm text-text/60">{t('admin.stats.chartSubtitle')}</p>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => setDateRange(7)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 7
                                ? 'bg-primary text-white'
                                : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                }`}
                        >
                            {t('admin.stats.days7')}
                        </button>
                        <button
                            onClick={() => setDateRange(30)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 30
                                ? 'bg-primary text-white'
                                : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                }`}
                        >
                            {t('admin.stats.days30')}
                        </button>
                        <button
                            onClick={() => setDateRange(90)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 90
                                ? 'bg-primary text-white'
                                : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                                }`}
                        >
                            {t('admin.stats.days90')}
                        </button>
                    </div>
                </div>
                <div className="flex md:hidden gap-2 mb-4">
                    <button
                        onClick={() => setDateRange(7)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${dateRange === 7
                            ? 'bg-primary text-white'
                            : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                            }`}
                    >
                        {t('admin.stats.days7')}
                    </button>
                    <button
                        onClick={() => setDateRange(30)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${dateRange === 30
                            ? 'bg-primary text-white'
                            : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                            }`}
                    >
                        {t('admin.stats.days30')}
                    </button>
                    <button
                        onClick={() => setDateRange(90)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${dateRange === 90
                            ? 'bg-primary text-white'
                            : 'bg-background-lighter text-text/60 hover:bg-background-lighter/80'
                            }`}
                    >
                        {t('admin.stats.days90')}
                    </button>
                </div>
                {chartData.values.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                        <BarChart
                            height={300}
                            xAxis={[{
                                scaleType: 'band',
                                data: chartData.labels,
                            }]}
                            yAxis={[{
                                valueFormatter: (value: number | null) => `${value ?? 0}`,
                                tickMinStep: 1,
                            }]}
                            series={[{
                                data: chartData.values,
                                label: t('admin.stats.chartLabel'),
                                color: 'var(--color-primary)',
                                valueFormatter: (value) => value === 1 ? t('admin.stats.chartValueSingular', { count: value ?? 0 }) : t('admin.stats.chartValuePlural', { count: value ?? 0 }),
                            }]}
                            borderRadius={8}
                            margin={{ top: 8, right: 20, bottom: 10, left: -20 }}
                            sx={{
                                '& .MuiChartsAxis-tickLabel': { fill: 'var(--color-text)' },
                                '& .MuiChartsAxis-line': { stroke: 'var(--color-text)' },
                                '& .MuiChartsAxis-tick': { stroke: 'var(--color-text)' },
                                '& .MuiChartsGrid-line': { stroke: 'rgba(75, 68, 87, 0.12)' },
                            }}
                        />
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-text/20 rounded-lg">
                        <p className="text-text/40">{t('admin.stats.noSignups')}</p>
                    </div>
                )}
            </div>
        </main>
    )
}
