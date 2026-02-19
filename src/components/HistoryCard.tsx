import { useTranslation } from 'react-i18next'

type HistoryCardProps = {
    itemName: string
    listName: string
    quantity: number
    price: number
    purchasedAt: string
}

const currencyFormatter = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR'
})

export default function HistoryCard({ itemName, listName, quantity, price, purchasedAt }: HistoryCardProps) {
    const { t } = useTranslation()
    const itemTotal = price * quantity
    const purchaseDate = new Date(purchasedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
    const purchaseTime = new Date(purchasedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className="rounded-xl border border-text/10 bg-white p-4 hover:bg-black/2 transition">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text">{itemName}</h3>
                        <span className="text-xs text-text/60 bg-text/5 px-2 py-1 rounded w-fit">
                            {listName}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 text-sm text-text/60">
                        <span>{t('items.qty')}: {quantity} · {currencyFormatter.format(price)} {t('items.each')}</span>
                        <span className="hidden md:inline">·</span>
                        <span className="hidden md:inline">{purchaseDate} {t('history.at')} {purchaseTime}</span>
                        <span className="md:hidden">{purchaseDate} {t('history.at')} {purchaseTime}</span>
                    </div>
                </div>
                <div className="flex flex-row items-baseline gap-2 md:flex-col md:items-end md:gap-1 md:text-right shrink-0">
                    <p className="text-xs text-text/50">{t('history.total')}</p>
                    <p className="text-lg font-semibold text-text">
                        {currencyFormatter.format(itemTotal)}
                    </p>
                </div>
            </div>
        </div>
    )
}
