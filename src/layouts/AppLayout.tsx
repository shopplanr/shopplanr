import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Settings20Regular, SignOut20Regular, Navigation20Regular, Dismiss20Regular, Home20Regular, List20Regular, History20Regular } from '@ricons/fluent'
import { supabase } from '../lib/supabase'
import LanguageSelector from '../components/LanguageSelector'
import Button from '../components/Button'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo.svg'

export default function DashboardLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    const showSidebar = location.pathname !== '/settings'

    const isActive = (path: string) => location.pathname === path

    const navItems = [
        { path: '/dashboard', icon: Home20Regular, label: t('nav.dashboard') },
        { path: '/lists', icon: List20Regular, label: t('nav.lists') },
        { path: '/history', icon: History20Regular, label: t('nav.history') }
    ]

    return (
        <div className="min-h-screen bg-white">
            {showSidebar && <Sidebar />}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/55 backdrop-blur-md border-b border-text/10">
                <div className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
                    <img
                        src={logo}
                        alt="Shopplanr"
                        className="h-7 cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    />
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSelector />
                        <Button
                            variant="icon"
                            onClick={() => navigate('/settings')}
                            aria-label={t('layouts.dashboard.settingsAriaLabel')}
                        >
                            <Icon size="20">
                                <Settings20Regular />
                            </Icon>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            aria-label={t('layouts.dashboard.logoutAriaLabel')}
                        >
                            <Icon size="20">
                                <SignOut20Regular />
                            </Icon>
                            {t('nav.logout')}
                        </Button>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-text flex items-center justify-center"
                        aria-label={t('layouts.dashboard.toggleMenuAriaLabel')}
                    >
                        <Icon size="24">
                            {mobileMenuOpen ? <Dismiss20Regular /> : <Navigation20Regular />}
                        </Icon>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-text/10 bg-white">
                        <nav className="p-4 space-y-2">
                            {showSidebar && navItems.map((item) => (
                                <Button
                                    key={item.path}
                                    variant={isActive(item.path) ? 'normal' : 'ghost'}
                                    onClick={() => {
                                        navigate(item.path)
                                        setMobileMenuOpen(false)
                                    }}
                                    fullWidth
                                    className="justify-start"
                                >
                                    <Icon size="20">
                                        <item.icon />
                                    </Icon>
                                    <span>{item.label}</span>
                                </Button>
                            ))}
                            <div className="border-t border-text/10 pt-2 mt-2 space-y-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigate('/settings')
                                        setMobileMenuOpen(false)
                                    }}
                                    fullWidth
                                >
                                    <Icon size="20">
                                        <Settings20Regular />
                                    </Icon>
                                    <span>{t('nav.settings')}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        handleLogout()
                                        setMobileMenuOpen(false)
                                    }}
                                    fullWidth
                                >
                                    <Icon size="20">
                                        <SignOut20Regular />
                                    </Icon>
                                    <span>{t('nav.logout')}</span>
                                </Button>
                                <div className="pt-2 flex justify-center">
                                    <LanguageSelector />
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </nav>

            <div className={showSidebar ? 'md:ml-72 pt-20 md:pt-27 md:pl-8 px-4 md:px-0' : ''}>
                <Outlet />
            </div>
        </div>
    )
}
