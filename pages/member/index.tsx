import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MemberHeader from '../../libs/components/member/MemberHeader';
import MemberProducts from '../../libs/components/member/MemberProducts';
import MemberFollows from '../../libs/components/member/MemberFollows';
import MyArticles from '../../libs/components/mypage/MyArticles';
import useFollowActions from '../../libs/hooks/useFollowActions';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const memberId = router.query.memberId as string;
	const category = (router.query?.category as string) ?? 'products';
	const followActions = useFollowActions();

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		if (memberId && user?._id && memberId === user._id) router.replace('/mypage').then();
	}, [router.isReady, memberId, user?._id]);

	return (
		<div className={'member-page fx-section'}>
			<div className={'fx-container'}>
				<MemberHeader />
				<div className={'member-content'}>
					{category === 'products' && <MemberProducts />}
					{category === 'articles' && memberId && <MyArticles memberId={memberId} readOnly />}
					{(category === 'followers' || category === 'followings') && (
						<MemberFollows mode={category} {...followActions} />
					)}
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);
