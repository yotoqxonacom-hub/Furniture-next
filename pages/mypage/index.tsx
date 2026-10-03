import React, { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyMenu from '../../libs/components/mypage/MyMenu';
import MyProfile from '../../libs/components/mypage/MyProfile';
import AddProduct from '../../libs/components/mypage/AddNewProduct';
import MyProducts from '../../libs/components/mypage/MyProducts';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import MyArticles from '../../libs/components/mypage/MyArticles';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MyReports from '../../libs/components/mypage/MyReports';
import MyOrders from '../../libs/components/mypage/MyOrders';
import MemberFollows from '../../libs/components/member/MemberFollows';
import useFollowActions from '../../libs/hooks/useFollowActions';
import { getJwtToken } from '../../libs/auth';
import { userVar } from '../../apollo/store';
import { isAgent, isLoggedIn } from '../../libs/member';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const router = useRouter();
	const category = (router.query?.category as string) ?? 'myProfile';
	const followActions = useFollowActions();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');

	/** LIFECYCLES **/
	useEffect(() => {
		// the user is restored from the token after mount, so check the token itself
		if (!getJwtToken()) router.replace('/account/join').then();
	}, []);

	return (
		<div className={'my-page fx-section'}>
			<div className={'fx-container my-layout'}>
				<aside className={'my-aside'}>
					<MyMenu />
				</aside>
				<div className={'my-content'}>
					{category === 'addProduct' && isAgent(user) && <AddProduct />}
					{category === 'addProduct' && isLoggedIn(user) && !isAgent(user) && (
						// opened by URL without a seller account: explain instead of showing a form that would fail
						<div className={'fx-empty'}>
							<strong>{t('Only seller accounts can add products. Sign up as a seller to start selling.')}</strong>
						</div>
					)}
					{category === 'myOrders' && <MyOrders key="buyer" mode="buyer" />}
					{category === 'sellerOrders' && <MyOrders key="seller" mode="seller" />}
					{category === 'myProducts' && <MyProducts />}
					{category === 'myFavorites' && <MyFavorites />}
					{category === 'recentlyVisited' && <RecentlyVisited />}
					{category === 'myArticles' && <MyArticles />}
					{category === 'writeArticle' && <WriteArticle />}
					{category === 'myReports' && <MyReports />}
					{category === 'myProfile' && <MyProfile />}
					{(category === 'followers' || category === 'followings') && (
						<MemberFollows mode={category} {...followActions} />
					)}
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);
