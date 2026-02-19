import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.svg'
import { Icon } from '@ricons/utils'
import { Mail20Regular } from '@ricons/fluent'

export default function ConfirmEmail() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
            <div className="background-glow" />
            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <img src={logo} alt="logo" className="h-14 mx-auto mb-4" />
                    <div className="mx-auto mb-4 mt-10 px-3 pt-2 pb-1 w-min rounded-md border-accent border flex items-center justify-center">
                        <span className="text-accent">
                            <Icon size="40">
                                <Mail20Regular />
                            </Icon>
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-text mb-4">{t('confirmEmail.title')}</h1>
                    <p className="text-text/70 mb-6">{t('confirmEmail.description')}</p>
                    <p className="text-sm text-text/60 mb-8">{t('confirmEmail.checkSpam')}</p>
                </div>

                <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-accent text-white py-2 rounded-lg font-semibold hover:bg-primary transition-colors"
                >
                    {t('confirmEmail.goToLogin')}
                </button>
            </div>
        </div>
    )
}
