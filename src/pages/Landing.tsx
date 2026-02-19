import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { ClipboardTaskListLtr20Filled, MoneyCalculator20Filled, DesktopPulse20Filled, Navigation20Regular, Dismiss20Regular } from '@ricons/fluent'
import logo from '../assets/logo.svg'
import screenshot from '../assets/screenshot.png'
import LanguageSelector from '../components/LanguageSelector'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
)

export default function Landing() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsLoggedIn(!!session)
        }
        checkUser()
    }, [])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget
        const rect = card.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        card.style.setProperty('--mouse-x', `${x}%`)
        card.style.setProperty('--mouse-y', `${y}%`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/55 backdrop-blur-md border-b border-text/10">
                <div className="px-6 lg:px-16 xl:px-50 py-4 flex justify-between items-center">
                    <img src={logo} alt="Shopplanr" className="h-7" />
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="https://github.com/shopplanr/shopplanr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text/70 hover:text-accent transition-colors"
                            aria-label="GitHub"
                        >
                            <GitHubIcon />
                        </a>
                        <LanguageSelector />
                        <Button
                            variant="outline"
                            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                        >
                            {isLoggedIn ? t('nav.openApp') : t('nav.login')}
                        </Button>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-text"
                        aria-label="Toggle menu"
                    >
                        <Icon size="24">
                            {mobileMenuOpen ? <Dismiss20Regular /> : <Navigation20Regular />}
                        </Icon>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-text/10">
                        <div className="px-6 py-4 flex flex-col items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setMobileMenuOpen(false)
                                    navigate(isLoggedIn ? '/dashboard' : '/login')
                                }}
                                fullWidth
                            >
                                {isLoggedIn ? t('nav.openApp') : t('nav.login')}
                            </Button>
                            <a
                                href="https://github.com/shopplanr/shopplanr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-text/70 hover:text-accent transition-colors"
                                aria-label="GitHub"
                            >
                                <GitHubIcon />
                                <span>GitHub</span>
                            </a>
                            <LanguageSelector />
                        </div>
                    </div>
                )}
            </nav>
            <section className="relative min-h-screen overflow-hidden px-6 lg:px-16 flex items-center" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(215, 204, 235, 0.3) 0%, rgba(170, 138, 212, 0.35) 15%, transparent 30%), radial-gradient(circle at 100% 100%, var(--color-secondary) 0%, rgba(165, 138, 212, 0.9) 25%, transparent 50%)' }}>
                <div className="relative z-10 w-full max-w-387.5 mx-auto flex flex-col lg:flex-row items-center lg:items-start lg:gap-0 pt-24 lg:pt-0">
                    <div className="max-w-2xl text-center lg:text-left space-y-5 py-6 relative z-20">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl leading-tight text-text" style={{ fontWeight: 800 }}>
                            {t('landing.hero.title1')} <br /> {t('landing.hero.title2')} <span className="text-primary">{t('landing.hero.title3')}</span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-text/80 whitespace-pre-line">
                            {t('landing.hero.subtitle')}
                        </p>
                        <p className="text-base lg:text-lg text-text/70 whitespace-pre-line">
                            {t('landing.hero.description')}
                        </p>
                        <div className="flex justify-center lg:justify-start">
                            <Button
                                onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                                className="px-10 py-4 rounded-xl shadow-lg"
                            >
                                {isLoggedIn ? t('landing.hero.openApp') : t('landing.hero.cta')}
                            </Button>
                        </div>
                    </div>
                    <div className="w-full lg:absolute lg:inset-0 lg:pointer-events-none px-4 lg:px-0 pb-16 lg:pb-0">
                        <img
                            src={screenshot}
                            alt="App Dashboard"
                            className="rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md mx-auto lg:max-w-none lg:w-275 h-auto lg:rotate-4 lg:scale-[1.12] transition-transform duration-300 origin-center lg:absolute lg:-right-137.5 xl:-right-112.5 2xl:-right-75 3xl:-right-50 lg:top-[70%] lg:-translate-y-1/2"
                        />
                    </div>
                </div>
            </section>
            <section className="py-32 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-20 text-text">{t('landing.features.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div onMouseMove={handleMouseMove} className="group relative rounded-xl p-8 border border-accent/30 hover:shadow-lg transition-all bg-linear-to-br from-white via-accent/10 to-secondary/15 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--color-primary)_0%,transparent_60%)] opacity-15" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-primary), transparent 50%)' }} />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 text-accent">
                                    <Icon size="48">
                                        <ClipboardTaskListLtr20Filled />
                                    </Icon>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text">{t('landing.features.lists.title')}</h3>
                                <p className="text-text/70">{t('landing.features.lists.description')}</p>
                            </div>
                        </div>
                        <div onMouseMove={handleMouseMove} className="group relative rounded-xl p-8 border border-accent/30 hover:shadow-lg transition-all bg-linear-to-br from-white via-accent/10 to-secondary/15 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--color-primary)_0%,transparent_60%)] opacity-15" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-primary), transparent 50%)' }} />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 text-accent">
                                    <Icon size="48">
                                        <MoneyCalculator20Filled />
                                    </Icon>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text">{t('landing.features.spending.title')}</h3>
                                <p className="text-text/70">{t('landing.features.spending.description')}</p>
                            </div>
                        </div>
                        <div onMouseMove={handleMouseMove} className="group relative rounded-xl p-8 border border-accent/30 hover:shadow-lg transition-all bg-linear-to-br from-white via-accent/10 to-secondary/15 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--color-primary)_0%,transparent_60%)] opacity-15" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-primary), transparent 50%)' }} />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 text-accent">
                                    <Icon size="48">
                                        <DesktopPulse20Filled />
                                    </Icon>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text">{t('landing.features.habits.title')}</h3>
                                <p className="text-text/70">{t('landing.features.habits.description')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="relative py-28 px-4 bg-linear-to-br from-primary/40 via-gray-100 to-primary/30">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6 text-text">{t('landing.cta.title')}</h2>
                    <p className="text-lg mb-8 text-text/80">
                        {t('landing.cta.description')}
                    </p>
                    <div className="flex justify-center">
                        <Button
                            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                            className="px-8 py-3"
                        >
                            {isLoggedIn ? t('landing.cta.openApp') : t('landing.cta.button')}
                        </Button>
                    </div>
                </div>
            </section>
            <footer className="py-8 px-4 bg-text text-white/80">
                <div className="max-w-6xl mx-auto flex flex-row items-center justify-center gap-4">
                    <p className="text-xs md:text-base">{t('landing.footer.copyright')}</p>
                    <a
                        href="https://github.com/shopplanr/shopplanr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="GitHub"
                    >
                        <GitHubIcon />
                    </a>
                </div>
            </footer>
        </div>
    )
}