import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { memberImageUrl } from '../../utils';

interface MenuItemDef {
	key: string;
	label: string;
	icon: React.ReactNode;
	agentOnly?: boolean;
	/** a separate page instead of a My Page tab */
	href?: string;
}

const sections: { title: string; items: MenuItemDef[] }[] = [
	{
		title: 'Orders',
		items: [
			{ key: 'myOrders', label: 'My orders', icon: <ReceiptLongOutlinedIcon /> },
			{ key: 'sellerOrders', label: 'Customer orders', icon: <LocalShippingOutlinedIcon />, agentOnly: true },
			{ key: 'cart', label: 'Cart', icon: <ShoppingBagOutlinedIcon />, href: '/cart' },
		],
	},
	{
		title: 'Listings',
		items: [
			{ key: 'addProduct', label: 'Add product', icon: <AddCircleOutlineRoundedIcon />, agentOnly: true },
			{ key: 'myProducts', label: 'My products', icon: <ChairOutlinedIcon />, agentOnly: true },
			{ key: 'myFavorites', label: 'Favorites', icon: <FavoriteBorderRoundedIcon /> },
			{ key: 'recentlyVisited', label: 'Recently viewed', icon: <HistoryRoundedIcon /> },
		],
	},
	{
		title: 'Community',
		items: [
			{ key: 'myArticles', label: 'My articles', icon: <ArticleOutlinedIcon /> },
			{ key: 'writeArticle', label: 'Write article', icon: <EditNoteRoundedIcon /> },
			{ key: 'followers', label: 'Followers', icon: <GroupOutlinedIcon /> },
			{ key: 'followings', label: 'Followings', icon: <PersonAddAltOutlinedIcon /> },
		],
	},
	{
		title: 'Account',
		items: [
			{ key: 'myReports', label: 'My reports', icon: <FlagOutlinedIcon /> },
			{ key: 'myProfile', label: 'Profile settings', icon: <ManageAccountsOutlinedIcon /> },
		],
	},
];

const MyMenu = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const category = (router.query?.category as string) ?? 'myProfile';
	const isAgent = user?.memberType === 'AGENT';

	/** HANDLERS **/
	const logoutHandler = async () => {
		if (await sweetConfirmAlert(t('Do you want to logout?'))) logOut();
	};

	const visible = (item: MenuItemDef) => !item.agentOnly || isAgent;

	return (
		<div className={'my-menu'}>
			<div className={'profile'}>
				<img src={memberImageUrl(user?.memberImage)} alt={user?.memberNick} />
				<div>
					<strong>{user?.memberFullName || user?.memberNick}</strong>
					{user?.memberPhone && (
						<span className={'phone'}>
							<PhoneOutlinedIcon />
							{user.memberPhone}
						</span>
					)}
					{user?.memberType === 'ADMIN' ? (
						<Link href={'/_admin/users'} className={'fx-badge clay'}>
							{t('Admin')} ↗
						</Link>
					) : (
						<span className={`fx-badge ${isAgent ? 'clay' : 'sage'}`}>{isAgent ? t('Seller') : t('Member')}</span>
					)}
				</div>
			</div>

			{/* desktop: grouped list */}
			<nav className={'menu-groups'}>
				{sections.map((section) => {
					const items = section.items.filter(visible);
					if (!items.length) return null;
					return (
						<div key={section.title} className={'group'}>
							<span className={'group-title'}>{t(section.title)}</span>
							{items.map((item) => (
								<Link
									key={item.key}
									href={item.href ?? { pathname: '/mypage', query: { category: item.key } }}
									scroll={false}
									className={category === item.key ? 'active' : ''}
								>
									{item.icon}
									{t(item.label)}
								</Link>
							))}
						</div>
					);
				})}
				<button className={'logout'} onClick={logoutHandler}>
					<LogoutRoundedIcon />
					{t('Logout')}
				</button>
			</nav>

			{/* mobile: horizontal tabs */}
			<nav className={'menu-chips fx-chip-row'}>
				{sections
					.flatMap((section) => section.items)
					.filter(visible)
					.map((item) => (
						<Link
							key={item.key}
							href={item.href ?? { pathname: '/mypage', query: { category: item.key } }}
							scroll={false}
							className={`fx-chip ${category === item.key ? 'active' : ''}`}
						>
							{t(item.label)}
						</Link>
					))}
			</nav>
		</div>
	);
};

export default MyMenu;
