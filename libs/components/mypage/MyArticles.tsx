import React, { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Pagination } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CommunityCard from '../common/CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const LIMIT = 6;

interface MyArticlesProps {
	/** member page passes another member id */
	memberId?: string;
	readOnly?: boolean;
}

const MyArticles = ({ memberId, readOnly = false }: MyArticlesProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const targetId = memberId ?? user?._id;
	const [input, setInput] = useState<any>({
		page: 1,
		limit: LIMIT,
		sort: 'createdAt',
		direction: 'DESC',
		search: { memberId: targetId },
	});
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !input.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getBoardArticles?.list ?? []);
			setTotal(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (targetId) setInput((prev: any) => ({ ...prev, page: 1, search: { memberId: targetId } }));
	}, [targetId]);

	/** HANDLERS **/
	const likeArticleHandler = async (e: any, user: T, id: string) => {
		try {
			e?.stopPropagation?.();
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			await likeTargetBoardArticle({ variables: { input: id } });
			await refetch({ input });
			await sweetTopSmallSuccessAlert(t('Saved'), 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{readOnly ? t('Articles') : t('My articles')}</h2>
					<p>
						{total} {t(total === 1 ? 'article' : 'articles')}
					</p>
				</div>
				{!readOnly && (
					<Link href={{ pathname: '/mypage', query: { category: 'writeArticle' } }} className={'fx-btn primary sm'}>
						<EditOutlinedIcon fontSize="small" />
						{t('Write')}
					</Link>
				)}
			</div>
			{!loading && articles.length === 0 ? (
				<div className={'fx-empty'}>
					<strong>{t('No articles yet')}</strong>
				</div>
			) : (
				<div className={'fx-product-grid'}>
					{articles.map((article) => (
						<CommunityCard key={article._id} boardArticle={article} likeArticleHandler={likeArticleHandler} />
					))}
				</div>
			)}
			{total > LIMIT && (
				<div className={'fx-pagination'}>
					<Pagination
						page={input.page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_: ChangeEvent<unknown>, page: number) => setInput((prev: any) => ({ ...prev, page }))}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default MyArticles;
