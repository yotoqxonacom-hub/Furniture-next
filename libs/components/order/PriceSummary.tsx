import React from 'react';
import { useTranslation } from 'next-i18next';
import { formatPrice } from '../../utils';
import { ORDER_RULES } from '../../config';

interface PriceSummaryProps {
	subtotal: number;
	deliveryFee: number;
	total: number;
	/** show the "free delivery from …" hint */
	showRule?: boolean;
}

const PriceSummary = ({ subtotal, deliveryFee, total, showRule = false }: PriceSummaryProps) => {
	const { t } = useTranslation('common');
	return (
		<dl className={'fx-price-summary'}>
			<div>
				<dt>{t('Subtotal')}</dt>
				<dd>{formatPrice(subtotal)}</dd>
			</div>
			<div>
				<dt>{t('Delivery')}</dt>
				<dd className={deliveryFee === 0 ? 'free' : ''}>{deliveryFee === 0 ? t('Free of charge') : formatPrice(deliveryFee)}</dd>
			</div>
			<div className={'total'}>
				<dt>{t('Total')}</dt>
				<dd>{formatPrice(total)}</dd>
			</div>
			{showRule && (
				<p className={'rule'}>
					{t('Free delivery from')} {formatPrice(ORDER_RULES.FREE_DELIVERY_FROM)} {t('per seller')}
				</p>
			)}
		</dl>
	);
};

export default PriceSummary;
