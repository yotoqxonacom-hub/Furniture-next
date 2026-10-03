import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { userVar } from '../../../apollo/store';
import { ADD_PRODUCT_HREF, SELLER_SIGNUP_HREF, canSeeAddProduct, isAgent } from '../../member';

interface AddProductButtonProps {
	/** visual style of the button */
	variant?: 'primary' | 'outline' | 'dark';
	size?: 'sm' | 'md';
	className?: string;
}

/**
 * "Add product" entry point. Only sellers can create products (backend: createProduct is @Roles(AGENT)):
 *  - seller (AGENT)  -> My Page › Add product
 *  - guest           -> sign-up form with "Seller" preselected
 *  - user / admin    -> button is not rendered (see canSeeAddProduct)
 */
const AddProductButton = ({ variant = 'primary', size = 'sm', className = '' }: AddProductButtonProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');

	if (!canSeeAddProduct(user)) return null;

	/** HANDLERS **/
	const clickHandler = async () => {
		await router.push(isAgent(user) ? ADD_PRODUCT_HREF : SELLER_SIGNUP_HREF);
	};

	return (
		<button type="button" onClick={clickHandler} className={`fx-btn ${variant} ${size === 'sm' ? 'sm' : ''} ${className}`}>
			<AddRoundedIcon fontSize="small" />
			{t('Add product')}
		</button>
	);
};

export default AddProductButton;
