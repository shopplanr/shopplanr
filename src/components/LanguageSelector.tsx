import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { ChevronDown20Regular } from '@ricons/fluent'

const languages = [
    { code: 'en', labelKey: 'language.en' },
    { code: 'bg', labelKey: 'language.bg' }
]

export default function LanguageSelector() {
    const { i18n, t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode)
        setIsOpen(false)
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-3 py-2 text-text hover:text-accent transition-colors cursor-pointer"
            >
                <span className="text-sm font-medium">{t(currentLang.labelKey)}</span>
                <Icon size="16">
                    <ChevronDown20Regular />
                </Icon>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-text/10 rounded-lg shadow-lg overflow-hidden z-50 min-w-30">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-accent/10 transition-colors cursor-pointer ${
                                lang.code === i18n.language ? 'text-accent font-medium' : 'text-text'
                            }`}
                        >
                            {t(lang.labelKey)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
