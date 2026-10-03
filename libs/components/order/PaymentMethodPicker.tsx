import React from 'react';
import { useTranslation } from 'next-i18next';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import { PaymentMethod, paymentMethodLabel } from '../../enums/payment.enum';

const ICONS: Record<PaymentMethod, React.ReactNode> = {
	[PaymentMethod.CARD]: <CreditCardRoundedIcon />,
	[PaymentMethod.KAKAO_PAY]: <ChatBubbleRoundedIcon />,
	[PaymentMethod.TOSS_PAY]: <AccountBalanceWalletRoundedIcon />,
	[PaymentMethod.BANK_TRANSFER]: <AccountBalanceRoundedIcon />,
};

interface PaymentMethodPickerProps {
	value: PaymentMethod;
	onChange: (method: PaymentMethod) => void;
	compact?: boolean;
}

const PaymentMethodPicker = ({ value, onChange, compact = false }: PaymentMethodPickerProps) => {
	const { t } = useTranslation('common');
	return (
		<div className={`fx-pay-methods ${compact ? 'compact' : ''}`} role="radiogroup" aria-label={t('Payment method')}>
			{Object.values(PaymentMethod).map((method) => (
				<button
					key={method}
					type="button"
					role="radio"
					aria-checked={value === method}
					className={`method ${value === method ? 'active' : ''} ${method.toLowerCase()}`}
					onClick={() => onChange(method)}
				>
					<span className={'icon'}>{ICONS[method]}</span>
					{t(paymentMethodLabel[method])}
				</button>
			))}
		</div>
	);
};

export default PaymentMethodPicker;
