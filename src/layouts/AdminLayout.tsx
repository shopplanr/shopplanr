import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Settings20Regular, SignOut20Regular, ChartMultiple20Regular, People20Regular, Navigation20Regular, Dismiss20Regular } from '@ricons/fluent'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo.svg'
import LanguageSelector from '../components/LanguageSelector'
import Button from '../components/Button'

export default function AdminLayout() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const isActive = (path: string) => location.pathname === path

    const navItems = [
        { path: '/stats', icon: ChartMultiple20Regular, label: t('admin.nav.stats') },
        { path: '/users', icon: People20Regular, label: t('admin.nav.users') }
    ]

    return (
        <div className="min-h-screen bg-white flex">
            <aside className="hidden md:flex md:flex-col md:w-64 border-r border-text/10 fixed h-screen">
                <div className="p-6 border-b border-text/10">
                    <img
                        src={logo}
                        alt="Shopplanr"
                        className="h-8 cursor-pointer"
                        onClick={() => navigate('/stats')}
                    />
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-primary text-white'
                                : 'text-text hover:bg-accent/10'
                                }`}
                        >
                            <Icon size="20">
                                <item.icon />
                            </Icon>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-text/10">
                    <LanguageSelector />
                </div>

                <div className="p-4 border-t border-text/10 space-y-2">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/settings')}
                        className="w-full justify-start"
                    >
                        <Icon size="20">
                            <Settings20Regular />
                        </Icon>
                        <span>{t('nav.settings')}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start"
                    >
                        <Icon size="20">
                            <SignOut20Regular />
                        </Icon>
                        <span>{t('nav.logout')}</span>
                    </Button>
                </div>
            </aside>
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/55 backdrop-blur-md border-b border-text/10">
                <div className="flex items-center justify-between px-4 py-3">
                    <img
                        src={logo}
                        alt="Shopplanr"
                        className="h-7 cursor-pointer"
                        onClick={() => navigate('/stats')}
                    />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-text flex items-center justify-center"
                    >
                        <Icon size="24">
                            {mobileMenuOpen ? <Dismiss20Regular /> : <Navigation20Regular />}
                        </Icon>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="border-t border-text/10 bg-white">
                        <nav className="p-4 space-y-2">
                            {navItems.map((item) => (
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
                                    onClick={handleLogout}
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
            </div>
            <div className="flex-1 md:ml-64">
                <div className="pt-16 md:pt-0">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
