import React from 'react';
import { useTranslation } from 'next-i18next';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

interface QuantityStepperProps {
	value: number;
	max: number;
	min?: number;
	disabled?: boolean;
	size?: 'sm' | 'md';
	onChange: (value: number) => void;
}

const QuantityStepper = ({ value, max, min = 1, disabled = false, size = 'md', onChange }: QuantityStepperProps) => {
	const { t } = useTranslation('common');
	const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

	return (
		<div className={`fx-qty ${size}`}>
			<button type="button" onClick={() => set(value - 1)} disabled={disabled || value <= min} aria-label={t('Decrease')}>
				<RemoveRoundedIcon />
			</button>
			<span aria-live="polite">{value}</span>
			<button type="button" onClick={() => set(value + 1)} disabled={disabled || value >= max} aria-label={t('Increase')}>
				<AddRoundedIcon />
			</button>
		</div>
	);
};

export default QuantityStepper;
