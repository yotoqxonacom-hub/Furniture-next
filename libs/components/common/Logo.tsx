import React from 'react';

export const BRAND_NAME = 'CozyLife';

interface LogoProps {
	/** light = white text for dark backgrounds (footer) */
	variant?: 'dark' | 'light';
	className?: string;
}

/** Brand mark + name as inline SVG/text so the parts can animate on hover (styles: .fx-logo in scss/app.scss) */
const Logo = ({ variant = 'dark', className = '' }: LogoProps) => (
	<span className={`fx-logo ${variant} ${className}`}>
		<svg className={'mark'} viewBox="0 0 44 44" aria-hidden="true">
			<rect x="0" y="0" width="44" height="44" rx="12" className={'badge'} />
			<path
				d="M12 25v-7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v7"
				stroke="#fff"
				strokeWidth="2.6"
				fill="none"
				strokeLinecap="round"
			/>
			<path
				d="M9 23a3 3 0 0 1 3 3v3h20v-3a3 3 0 0 1 6 0v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a3 3 0 0 1 3-3z"
				fill="#fff"
			/>
			<path d="M12 35v3M32 35v3" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
		</svg>
		<span className={'logo-text'}>{BRAND_NAME}</span>
	</span>
);

export default Logo;
