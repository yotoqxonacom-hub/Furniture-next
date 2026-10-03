import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import Badge from '@mui/material/Badge';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useCartCount } from '../../hooks/useCart';

/**
 * Header cart link with a "ripple" badge: the count sits in a MUI Badge whose ring
 * keeps pulsing while the cart has items (scss: .fx-ripple-badge).
 * The badge is re-mounted when the count changes, so every add restarts the ripple.
 */
const CartButton = () => {
	const { t } = useTranslation('common');
	const count = useCartCount();

	return (
		<Link href={'/cart'} className={'fx-icon-btn cart-btn'} aria-label={`${t('Cart')} (${count})`}>
			<Badge
				key={count}
				className={'fx-ripple-badge'}
				badgeContent={count}
				max={99}
				invisible={count === 0}
				overlap="circular"
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<ShoppingBagOutlinedIcon />
			</Badge>
		</Link>
	);
};

export default CartButton;
