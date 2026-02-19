import type { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'normal' | 'outline' | 'icon' | 'secondary' | 'ghost' | 'ghosticon' | 'gray'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    children: ReactNode
    fullWidth?: boolean
}

export default function Button({
    variant = 'normal',
    children,
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'

    const variantStyles: Record<ButtonVariant, string> = {
        normal: 'bg-primary text-white hover:bg-primary/60',
        outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
        icon: 'border border-primary text-primary hover:bg-primary hover:text-white p-2.5',
        secondary: 'bg-secondary text-white hover:bg-secondary/50',
        ghost: 'text-primary hover:bg-secondary/30 hover:border-secondary',
        ghosticon: 'text-primary hover:bg-secondary/30 p-2.5',
        gray: 'bg-gray-200 text-text hover:bg-gray-300'
    }

    const sizeStyles = variant === 'icon' || variant === 'ghosticon' ? '' : 'px-4 py-2'
    const widthStyles = fullWidth ? 'w-full' : ''

    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles} ${widthStyles} ${className}`

    return (
        <button className={combinedStyles} {...props}>
            {children}
        </button>
    )
}
