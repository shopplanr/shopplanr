import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ricons/utils'
import { Delete20Regular } from '@ricons/fluent'
import Button from './Button'

interface ConfirmModalProps {
	isOpen: boolean
	title: string
	titleIcon?: ReactNode
	message: string
	confirmText: string
	cancelText: string
	highlightInfo?: {
		label: string
		value: string
	}
	onConfirm: () => void | Promise<void>
	onCancel: () => void
	isLoading?: boolean
}

export default function ConfirmModal({
	isOpen,
	title,
	titleIcon,
	message,
	confirmText,
	cancelText,
	highlightInfo,
	onConfirm,
	onCancel,
	isLoading = false
}: ConfirmModalProps) {
	const { t } = useTranslation()
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

	const handleConfirm = async () => {
		await onConfirm()
	}

	if (!isOpen) return null

	return createPortal(
		<div
			className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${showModal ? 'opacity-100' : 'opacity-0'}`}
			onClick={(e) => e.stopPropagation()}
		>
			<div
				className={`bg-white rounded-xl border border-accent shadow-2xl max-w-md w-full p-6 transition-all duration-200 ${showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
			>
				<h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
					{titleIcon && <Icon size="20">{titleIcon}</Icon>}
					{title}
				</h3>
				<p className="text-text/70 mb-4">{message}</p>
				{highlightInfo && (
					<div className="bg-accent/5 p-3 rounded-lg mb-6 border border-accent/20">
						<p className="text-sm text-text/60 mb-1">{highlightInfo.label}:</p>
						<p className="font-medium text-text">{highlightInfo.value}</p>
					</div>
				)}
				<div className="flex gap-3">
					<Button
						variant="normal"
						onClick={handleConfirm}
						disabled={isLoading}
						className="flex-1"
					>
						<Icon size="18">
							<Delete20Regular />
						</Icon>
						{isLoading ? t('modals.confirm.deleting') : confirmText}
					</Button>
					<Button
						variant="gray"
						onClick={handleCancel}
						disabled={isLoading}
						className="flex-1"
					>
						{cancelText}
					</Button>
				</div>
			</div>
		</div>,
		document.body
	)
}
