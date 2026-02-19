import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo.svg'
import { Icon } from '@ricons/utils'
import { ArrowLeft12Regular, Eye20Regular, EyeOff20Regular } from '@ricons/fluent'
import LanguageSelector from '../components/LanguageSelector'
import Button from '../components/Button'

export default function Login() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', session.user.id)
                    .single()

                if (data?.is_admin) {
                    navigate('/stats')
                } else {
                    navigate('/dashboard')
                }
            }
        }
        checkUser()
    }, [navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            const { data: profileData } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', data.user.id)
                .single()

            if (profileData?.is_admin) {
                navigate('/stats')
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen bg-white flex items-center justify-center px-6 relative overflow-hidden"
        >
            <div className="background-glow" />
            <div className="absolute top-6 right-6 z-20">
                <LanguageSelector />
            </div>
            <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 flex items-center gap-2"
                aria-label="Go back"
            >
                <Icon size="20">
                    <ArrowLeft12Regular />
                </Icon>
                <span className="text-sm font-medium">{t('login.goBack')}</span>
            </Button>
            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <img src={logo} alt="logo" className="h-13 mx-auto mb-4" />
                    <p className="text-text opacity-60">{t('login.subtitle')}</p>
                </div>

                {error && (
                    <div className="bg-secondary/30 border border-accent/40 text-text px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">{t('login.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-primary bg-white text-text focus:outline-none focus:ring-2 focus:ring-accent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">{t('login.password')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-primary bg-white text-text focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            />
                            {password && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.25 border border-text/20 hover:bg-text/10 rounded-md transition-colors text-text/60 hover:text-text flex items-center justify-center"
                                >
                                    <Icon size="16">
                                        {showPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                                    </Icon>
                                </button>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? t('login.submitting') : t('login.submit')}
                    </Button>

                    <div className="text-center mt-6">
                        <p className="text-text/70 text-sm">
                            {t('login.noAccount')}{' '}
                            <Link to="/signup" className="text-accent font-semibold hover:text-primary transition-colors">
                                {t('login.createOne')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
