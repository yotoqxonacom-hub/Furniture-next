import React from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { userVar } from '../../../apollo/store';
import { isAgent, MY_PRODUCTS_HREF } from '../../member';
import { memberImageUrl } from '../../utils';

/**
 * Shown on the Sellers page to a logged-in seller: their own shop is always one click away,
 * no matter on which page of the list their card ends up.
 */
const MyShopPanel = () => {
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');

	if (!isAgent(user)) return null;

	return (
		<div className={'my-shop-panel'}>
			<img src={memberImageUrl(user.memberImage)} alt="" />
			<div className={'text'}>
				<span className={'fx-badge clay'}>{t('Your shop')}</span>
				<strong>{user.memberFullName || user.memberNick}</strong>
				<p>{t('You are listed among the sellers. This is how buyers find you.')}</p>
			</div>
			<div className={'actions'}>
				<Link href={{ pathname: '/agent/detail', query: { agentId: user._id } }} className={'fx-btn outline sm'}>
					<StorefrontOutlinedIcon fontSize="small" />
					{t('View my shop')}
				</Link>
				<Link href={MY_PRODUCTS_HREF} className={'fx-btn ghost sm'}>
					{t('My products')}
				</Link>
				{/* "Add product" lives in the Sellers toolbar right below, so it isn't repeated here */}
			</div>
		</div>
	);
};

export default MyShopPanel;
