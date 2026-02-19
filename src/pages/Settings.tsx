import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Password20Regular, Delete20Regular, Mail20Regular, ArrowLeft20Regular } from '@ricons/fluent'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import LoadingScreen from '../components/LoadingScreen'
import Button from '../components/Button'

export default function Settings() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')

    const checkAdminStatus = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', userId)
                .single()

            if (!error && data?.is_admin) {
                setIsAdmin(true)
            }
        } catch (err) {
            console.error('Error checking admin status:', err)
        } finally {
            setPageLoading(false)
        }
    }, [])

    const getUser = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
                await checkAdminStatus(session.user.id)
            }
        } catch (err) {
            console.error('Error getting user:', err)
        }
    }, [checkAdminStatus])

    useEffect(() => {
        getUser()
    }, [getUser])

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: t('settings.passwordMismatch') })
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: t('settings.passwordTooShort') })
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setMessage({ type: 'success', text: t('settings.passwordChangeSuccess') })
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: unknown) {
            const messageText = error instanceof Error ? error.message : 'An unexpected error occurred'
            setMessage({ type: 'error', text: messageText })
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmEmail !== user?.email) {
            setMessage({ type: 'error', text: t('settings.deleteEmailMismatch') })
            return
        }

        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error('No active session')
            }

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete account')
            }

            await supabase.auth.signOut()
            navigate('/login')
        } catch (error: unknown) {
            const messageText = error instanceof Error ? error.message : 'An unexpected error occurred'
            setMessage({ type: 'error', text: messageText })
            setLoading(false)
        }
    }

    return (
        <>
            {pageLoading ? (
                <LoadingScreen />
            ) : (
                <main className={`max-w-4xl ${isAdmin ? 'px-4 md:pl-12 md:pr-8 md:py-8 py-8' : 'pt-16 md:pt-24 mx-auto px-6 py-8'}`}>
                    {!isAdmin && (
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            className="mb-6 mt-4 flex items-center gap-2"
                        >
                            <Icon size="20">
                                <ArrowLeft20Regular />
                            </Icon>
                            <span>Back</span>
                        </Button>
                    )}
                    <h1 className="text-3xl font-bold text-text mb-8 md:mb-20">{t('settings.title')}</h1>
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}
                    <section className="mb-8 md:mb-18">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-accent translate-y-1">
                                <Icon size="24">
                                    <Mail20Regular />
                                </Icon>
                            </div>
                            <h2 className="text-xl font-semibold text-text">{t('settings.accountInfo')}</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-text/60">{t('settings.email')}</label>
                                <p className="text-text font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-text/60">{t('settings.accountCreated')}</label>
                                <p className="text-text font-medium">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </section>
                    <section className="mb-8 md:mb-18">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-accent translate-y-1">
                                <Icon size="24">
                                    <Password20Regular />
                                </Icon>
                            </div>
                            <h2 className="text-xl font-semibold text-text">{t('settings.changePassword')}</h2>
                        </div>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-text/70 mb-2">
                                    {t('settings.newPassword')}
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 bg-white text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text/70 mb-2">
                                    {t('settings.confirmPassword')}
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 bg-white text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto"
                            >
                                {loading ? t('settings.updating') : t('settings.updatePassword')}
                            </Button>
                        </form>
                    </section>
                    {!isAdmin && (
                        <section className="mb-8 md:mb-16">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="translate-y-1 text-accent">
                                    <Icon size="24">
                                        <Delete20Regular />
                                    </Icon>
                                </div>
                                <h2 className="text-xl font-semibold text-text">{t('settings.dangerZone')}</h2>
                            </div>

                            {!showDeleteConfirm ? (
                                <div>
                                    <p className="text-text/70 mb-4">{t('settings.deleteWarning')}</p>
                                    <Button
                                        variant="normal"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        {t('settings.deleteAccount')}
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-text/70 mb-4">{t('settings.deleteConfirmation')}</p>
                                    <p className="text-sm text-text/60 mb-4">
                                        {t('settings.typeEmailToConfirm')}: <strong>{user?.email}</strong>
                                    </p>
                                    <input
                                        type="email"
                                        value={deleteConfirmEmail}
                                        onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                                        placeholder={user?.email}
                                        className="w-full px-4 py-2 border border-gray-300 bg-white text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent mb-4"
                                        disabled={loading}
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            variant="normal"
                                            onClick={handleDeleteAccount}
                                            disabled={loading || deleteConfirmEmail !== user?.email}
                                        >
                                            {loading ? t('settings.deleting') : t('settings.confirmDelete')}
                                        </Button>
                                        <Button
                                            variant="gray"
                                            onClick={() => {
                                                setShowDeleteConfirm(false)
                                                setDeleteConfirmEmail('')
                                            }}
                                            disabled={loading}
                                        >
                                            {t('settings.cancel')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </main>
            )}
        </>
    )
}
