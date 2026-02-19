import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@ricons/utils'
import Button from './Button'

interface ListFormModalProps {
	isOpen: boolean
	title: string
	titleIcon?: ReactNode
	submitText: string
	cancelText: string
	submitIcon?: ReactNode
	name: string
	budget: string
	nameLabel?: string
	budgetLabel?: string
	namePlaceholder?: string
	budgetPlaceholder?: string
	budgetPrefix?: string
	onNameChange: (value: string) => void
	onBudgetChange: (value: string) => void
	onSubmit: (event: React.FormEvent) => void | Promise<void>
	onCancel: () => void
	isLoading?: boolean
	error?: string | null
	autoFocus?: boolean
}

export default function ListFormModal({
	isOpen,
	title,
	titleIcon,
	submitText,
	cancelText,
	submitIcon,
	name,
	budget,
	nameLabel = 'List name',
	budgetLabel = 'Budget',
	namePlaceholder,
	budgetPlaceholder,
	budgetPrefix,
	onNameChange,
	onBudgetChange,
	onSubmit,
	onCancel,
	isLoading = false,
	error,
	autoFocus = false
}: ListFormModalProps) {
	const [showModal, setShowModal] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setShowModal(true), 10)
		} else {
			setShowModal(false)
		}
	}, [isOpen])

	const handleCancel = () => {
		setShowModal(false)
		setTimeout(onCancel, 200)
	}

	if (!isOpen) return null

	return createPortal(
		<div
			className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${showModal ? 'opacity-100' : 'opacity-0'}`}
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<div
				className={`bg-white rounded-xl border border-accent shadow-2xl max-w-md w-full p-6 transition-all duration-200 ${showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
			>
				<h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
					{titleIcon && <Icon size="20">{titleIcon}</Icon>}
					{title}
				</h3>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-text/70 mb-2">
							{nameLabel}
						</label>
						<input
							className="w-full rounded-lg border border-text/10 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder={namePlaceholder}
							value={name}
							onChange={(e) => onNameChange(e.target.value)}
							autoFocus={autoFocus}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-text/70 mb-2">
							{budgetLabel}
						</label>
						<div className="relative">
							{budgetPrefix && (
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50">
									{budgetPrefix}
								</span>
							)}
							<input
								className={`w-full rounded-lg border border-text/10 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 ${budgetPrefix ? 'pl-8 pr-4' : 'px-4'}`}
								placeholder={budgetPlaceholder}
								type="number"
								min="0"
								step="1"
								value={budget}
								onChange={(e) => onBudgetChange(e.target.value)}
							/>
						</div>
					</div>
					{error && <p className="text-sm text-accent">{error}</p>}
					<div className="flex gap-3 pt-2">
						<Button type="submit" disabled={isLoading} className="flex-1">
							{submitIcon && <Icon size="18">{submitIcon}</Icon>}
							{submitText}
						</Button>
						<Button
							type="button"
							variant="gray"
							onClick={handleCancel}
							disabled={isLoading}
						className="flex-1"
					>
						{cancelText}
					</Button>
				</div>
			</form>
		</div>
	</div>,
	document.body
	)
}