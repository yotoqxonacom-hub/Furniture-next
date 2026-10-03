import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Pagination } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CommunityCard from '../../libs/components/common/CommunityCard';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { communityTabs } from '../../libs/config';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});



const LIMIT = 9;

const Community: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const category = ((router.query.articleCategory as string) ?? BoardArticleCategory.FREE) as BoardArticleCategory;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({
		page: 1,
		limit: LIMIT,
		sort: 'createdAt',
		direction: 'DESC' as any,
		search: { articleCategory: category },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading, refetch: boardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list ?? []);
			setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		setSearchCommunity((prev) => ({ ...prev, page: 1, search: { articleCategory: category } }));
	}, [router.isReady, category]);

	/** HANDLERS **/
	const tabChangeHandler = async (value: string) => {
		await router.push({ pathname: '/community', query: { articleCategory: value } }, undefined, { scroll: false });
	};

	const paginationHandler = (_: ChangeEvent<unknown>, page: number) => {
		setSearchCommunity((prev) => ({ ...prev, page }));
		window.scrollTo({ top: 260, behavior: 'smooth' });
	};

	const likeArticleHandler = async (e: any, user: T, id: string) => {
		try {
			e?.stopPropagation?.();
			if (!id) return;
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert(t('Saved'), 800);
		} catch (err: any) {
			console.log('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const writeHandler = async () => {
		if (!user?._id) {
			const confirmed = await sweetLoginConfirmAlert(t('Please login to write an article'));
			if (confirmed) await router.push('/account/join');
			return;
		}
		await router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
	};

	const activeTab = communityTabs.find((tab) => tab.value === category) ?? communityTabs[0];

	return (
		<div className={'community-page fx-section'}>
			<div className={'fx-container'}>
				<div className={'community-top'}>
					<div className={'fx-chip-row'}>
						{communityTabs.map((tab) => (
							<button
								key={tab.value}
								className={`fx-chip ${category === tab.value ? 'active' : ''}`}
								onClick={() => tabChangeHandler(tab.value)}
							>
								{t(tab.label)}
							</button>
						))}
					</div>
					<button className={'fx-btn primary sm'} onClick={writeHandler}>
						<EditOutlinedIcon fontSize="small" />
						{t('Write')}
					</button>
				</div>

				<div className={'fx-section-head'}>
					<div>
						<h2>{t(activeTab.label)}</h2>
						<p>{t(activeTab.desc)}</p>
					</div>
				</div>

				{!loading && boardArticles.length === 0 ? (
					<div className={'fx-empty'}>
						<img src="/img/furniture/col-relax.svg" alt="" />
						<strong>{t('No articles yet')}</strong>
						<span>{t('Start the conversation — write the first post.')}</span>
					</div>
				) : (
					<div className={'fx-product-grid'}>
						{boardArticles.map((article) => (
							<CommunityCard key={article._id} boardArticle={article} likeArticleHandler={likeArticleHandler} />
						))}
					</div>
				)}

				{totalCount > LIMIT && (
					<div className={'fx-pagination'}>
						<Pagination
							page={searchCommunity.page}
							count={Math.ceil(totalCount / LIMIT)}
							onChange={paginationHandler}
							shape="circular"
						/>
						<span className={'total'}>
							{totalCount} {t('articles')}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(Community);
