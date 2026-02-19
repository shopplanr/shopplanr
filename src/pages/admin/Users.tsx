import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import type { User } from '@supabase/supabase-js'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmModal from '../../components/ConfirmModal'
import UserCard from '../../components/UserCard'

interface AdminUser {
    id: string
    email: string
    created_at: string
}

export default function Users() {
    const { t } = useTranslation()
    const [user, setUser] = useState<User | null>(null)
    const [allUsers, setAllUsers] = useState<AdminUser[]>([])
    const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)

    const fetchAllUsers = useCallback(async (currentUserId?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                return
            }

            const adminUserId = currentUserId || user?.id

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-get-users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                const filteredUsers = (data.users || []).filter((u: AdminUser) => u.id !== adminUserId)
                setAllUsers(filteredUsers)
                setFilteredUsers(filteredUsers)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    const getUser = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
                fetchAllUsers(session.user.id)
            }
        } catch (err) {
            console.error('Error getting user:', err)
            setLoading(false)
        }
    }, [fetchAllUsers])

    useEffect(() => {
        getUser()
    }, [getUser])

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(allUsers)
        } else {
            const query = searchQuery.toLowerCase()
            setFilteredUsers(
                allUsers.filter((u) =>
                    u.email.toLowerCase().includes(query)
                )
            )
        }
    }, [searchQuery, allUsers])


    const handleDeleteUser = async () => {
        if (!deleteModalUser) return

        setDeleting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                return
            }

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ user_id: deleteModalUser.id })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete user')
            }

            fetchAllUsers()
            setDeleteModalUser(null)
        } catch (error: unknown) {
            const messageText = error instanceof Error ? error.message : 'An unexpected error occurred'
            alert(messageText)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            {loading ? (
                <LoadingScreen />
            ) : (
                <>
                    <div className="md:hidden fixed top-16 left-0 right-0 bg-white z-40 px-6 pt-4 pb-4">
                        <div className="mb-6 mt-4 ml-2">
                            <h1 className="text-3xl font-bold text-text mb-2">{t('admin.users.title')}</h1>
                            <p className="text-text/60">{t('admin.users.subtitle')}</p>
                        </div>
                        <div className="mb-4">
                            <div className="relative">

                                <input
                                    type="text"
                                    placeholder={t('admin.users.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-4 py-2.5 bg-white border border-accent/30 rounded-lg text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                />
                            </div>
                        </div>
                        <div className="-mx-6 mb-0">
                            <div className="border-t border-accent/20"></div>
                        </div>
                    </div>
                    <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 flex flex-col overflow-hidden">
                        <div className="shrink-0 invisible px-6 pt-4 pb-4">
                            <div className="mb-6 mt-4 ml-2">
                                <h1 className="text-3xl font-bold text-text mb-2">{t('admin.users.title')}</h1>
                                <p className="text-text/60">{t('admin.users.subtitle')}</p>
                            </div>
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-4 pr-4 py-2.5 bg-white border border-accent/30 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="-mx-6 mb-0">
                                <div className="border-t border-accent/20"></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 pb-24">
                            {filteredUsers.length === 0 ? (
                                <div className="py-12 text-center text-text/60">
                                    {searchQuery ? t('admin.users.noUsersMatch') : t('admin.users.noUsersFound')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredUsers.map((u) => (
                                        <UserCard
                                            key={u.id}
                                            user={u}
                                            currentUserId={user?.id}
                                            variant="mobile"
                                            onDelete={setDeleteModalUser}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <main className="hidden md:flex md:p-8 md:flex-col md:h-screen md:pb-8 md:overflow-hidden">
                        <div className="flex-none">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-text mb-2">{t('admin.users.title')}</h1>
                                <p className="text-text/60">{t('admin.users.subtitle')}</p>
                            </div>
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t('admin.users.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-4 pr-4 py-2.5 bg-white border border-accent/30 rounded-lg text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    />
                                </div>
                            </div>
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3">
                                <div className="col-span-4 text-xs font-medium text-text/70 uppercase tracking-wider">
                                    {t('admin.users.columnEmail')}
                                </div>
                                <div className="col-span-3 text-xs font-medium text-text/70 uppercase tracking-wider">
                                    {t('admin.users.columnCreatedAt')}
                                </div>
                                <div className="col-span-3 text-xs font-medium text-text/70 uppercase tracking-wider">
                                    {t('admin.users.columnUserId')}
                                </div>
                                <div className="col-span-2 text-xs font-medium text-text/70 uppercase tracking-wider text-right">
                                    {t('admin.users.columnActions')}
                                </div>
                            </div>
                            <div className="-mx-6 md:mx-0 md:px-4 mb-4">
                                <div className="border-t border-accent/20"></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 -mx-4 min-h-0">
                            <div className="px-4">
                                {filteredUsers.length === 0 ? (
                                    <div className="py-12 text-center text-text/60">
                                        {searchQuery ? t('admin.users.noUsersMatch') : t('admin.users.noUsersFound')}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredUsers.map((u) => (
                                            <UserCard
                                                key={u.id}
                                                user={u}
                                                currentUserId={user?.id}
                                                variant="desktop"
                                                onDelete={setDeleteModalUser}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-none">
                            <div className="md:px-4 mt-4 mb-3">
                                <div className="border-t border-accent/20"></div>
                            </div>
                            <div className="px-4 pt-4 text-sm text-text/60">
                                {searchQuery
                                    ? t('admin.users.showingUsers', { filtered: filteredUsers.length, total: allUsers.length })
                                    : `${t('admin.users.totalUsers')}: ${allUsers.length}`
                                }
                            </div>
                        </div>
                    </main>
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-accent/20 z-10">
                        <div className="px-6 py-6 text-sm text-text/60">
                            {searchQuery
                                ? t('admin.users.showingUsers', { filtered: filteredUsers.length, total: allUsers.length })
                                : `${t('admin.users.totalUsers')}: ${allUsers.length}`
                            }
                        </div>
                    </div>
                </>
            )}
            <ConfirmModal
                isOpen={!!deleteModalUser}
                title={t('admin.deleteUserTitle')}
                message={t('admin.deleteUserWarning')}
                confirmText={t('admin.confirmDelete')}
                cancelText={t('admin.cancel')}
                highlightInfo={deleteModalUser ? {
                    label: t('admin.userEmail'),
                    value: deleteModalUser.email
                } : undefined}
                onConfirm={handleDeleteUser}
                onCancel={() => setDeleteModalUser(null)}
                isLoading={deleting}
            />
        </>
    )
}
