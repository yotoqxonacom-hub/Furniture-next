import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { capitalize, imageUrl, timeAgo } from '../../utils';

const baseInput = { page: 1, sort: 'articleViews', direction: 'DESC' };

const articleHref = (article: BoardArticle) =>
	`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`;

const CommunityBoards = () => {
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const { data: featuredData } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { ...baseInput, limit: 2, search: { articleCategory: BoardArticleCategory.INTERIOR } } },
	});
	const { data: latestData } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { ...baseInput, limit: 4, search: { articleCategory: BoardArticleCategory.FREE } } },
	});
	const featured: BoardArticle[] = featuredData?.getBoardArticles?.list ?? [];
	const latest: BoardArticle[] = latestData?.getBoardArticles?.list ?? [];

	if (!featured.length && !latest.length) return null;

	return (
		<section className={'fx-section home-community'}>
			<div className={'fx-container'}>
				<div className={'fx-section-head'}>
					<div>
						<span className={'eyebrow'}>{t('Community')}</span>
						<h2>{t('Ideas from real homes')}</h2>
					</div>
					<div className={'head-actions'}>
						<Link href={'/community?articleCategory=INTERIOR'} className={'fx-btn outline sm'}>
							{t('Read more')}
							<EastRoundedIcon fontSize="small" />
						</Link>
					</div>
				</div>
				<div className={'community-layout'}>
					<div className={'featured'}>
						{featured.map((article) => (
							<Link key={article._id} href={articleHref(article)} className={'article-feature'}>
								<div className={'media'}>
									<img src={imageUrl(article?.articleImage, '/img/furniture/col-living.svg')} alt="" />
								</div>
								<span className={'fx-badge clay'}>{t(capitalize(article.articleCategory))}</span>
								<strong>{article.articleTitle}</strong>
								<small>
									{article?.memberData?.memberNick} · {timeAgo(article.createdAt)}
								</small>
							</Link>
						))}
					</div>
					<div className={'latest'}>
						<h3>{t('Latest discussions')}</h3>
						{latest.map((article) => (
							<Link key={article._id} href={articleHref(article)} className={'article-row'}>
								<img src={imageUrl(article?.articleImage, '/img/furniture/col-relax.svg')} alt="" />
								<div>
									<strong>{article.articleTitle}</strong>
									<small>
										{article?.articleViews ?? 0} {t('views')} · {timeAgo(article.createdAt)}
									</small>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default CommunityBoards;
