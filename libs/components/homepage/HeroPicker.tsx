import React, { ReactNode, useRef, useState } from 'react';
import { Popover } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

export interface HeroPickerOption {
	value: string;
	label: string;
	icon?: ReactNode;
}

interface HeroPickerProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	/** the first option is the "all" choice (value '') */
	options: HeroPickerOption[];
	columns?: 1 | 2;
	className?: string;
}

/** Hero search field that opens a branded option panel instead of the native <select> list */
const HeroPicker = ({ label, value, onChange, options, columns = 1, className = '' }: HeroPickerProps) => {
	const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const open = Boolean(anchor);
	const selected = options.find((option) => option.value === value) ?? options[0];

	/** HANDLERS **/
	const focusSelected = () => {
		const list = listRef.current;
		const target = list?.querySelector<HTMLButtonElement>('[aria-selected="true"]') ?? list?.querySelector('button');
		target?.focus();
	};

	const selectHandler = (next: string) => {
		onChange(next);
		setAnchor(null);
	};

	/** arrow keys move between options (Enter / Space click the focused one, Esc closes the Popover) */
	const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
		e.preventDefault();
		const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
		const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
		const last = buttons.length - 1;
		const next =
			e.key === 'Home'
				? 0
				: e.key === 'End'
				? last
				: e.key === 'ArrowDown'
				? Math.min(index + 1, last)
				: Math.max(index - 1, 0);
		buttons[next]?.focus();
	};

	return (
		<>
			<button
				type="button"
				className={`field picker ${open ? 'open' : ''} ${className}`}
				onClick={(e) => setAnchor(e.currentTarget)}
				aria-haspopup="listbox"
				aria-expanded={open}
			>
				<span>{label}</span>
				<strong>{selected?.label}</strong>
				<KeyboardArrowDownRoundedIcon className={'chevron'} />
			</button>

			<Popover
				anchorEl={anchor}
				open={open}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				TransitionProps={{ onEntered: focusSelected }}
				sx={{ mt: '10px' }}
				PaperProps={{
					className: `hero-picker-panel cols-${columns}`,
					sx: { borderRadius: '16px', minWidth: anchor?.offsetWidth },
				}}
			>
				<div className={'panel-head'}>{label}</div>
				<div className={'panel-list'} role="listbox" aria-label={label} ref={listRef} onKeyDown={keyDownHandler}>
					{options.map((option, index) => {
						const active = option.value === selected?.value;
						return (
							<button
								key={option.value || 'all'}
								type="button"
								role="option"
								aria-selected={active}
								className={`option ${active ? 'active' : ''} ${index === 0 ? 'all' : ''}`}
								onClick={() => selectHandler(option.value)}
							>
								{option.icon && <span className={'option-icon'}>{option.icon}</span>}
								<span className={'option-label'}>{option.label}</span>
								{active && <CheckRoundedIcon className={'option-check'} />}
							</button>
						);
					})}
				</div>
			</Popover>
		</>
	);
};

export default HeroPicker;
