import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { BoardArticle } from '../../types/board-article/board-article';
import { userVar } from '../../../apollo/store';
import { capitalize, imageUrl, memberImageUrl, timeAgo } from '../../utils';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	likeArticleHandler?: (e: any, user: any, id: string) => void;
}

const CommunityCard = ({ boardArticle, likeArticleHandler }: CommunityCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const liked = Boolean(boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite);

	/** HANDLERS **/
	const openArticleHandler = async () => {
		await router.push({
			pathname: '/community/detail',
			query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
		});
	};

	const goMemberPage = async (e: React.MouseEvent, id?: string) => {
		e.stopPropagation();
		if (!id) return;
		if (id === user?._id) await router.push('/mypage');
		else await router.push(`/member?memberId=${id}`);
	};

	return (
		<article className={'fx-article-card'} onClick={openArticleHandler}>
			<div className={'media'}>
				<img src={imageUrl(boardArticle?.articleImage, '/img/furniture/col-living.svg')} alt="" loading="lazy" />
				<span className={'fx-badge'}>{t(capitalize(boardArticle?.articleCategory))}</span>
			</div>
			<div className={'body'}>
				<strong className={'title'}>{boardArticle?.articleTitle}</strong>
				<div className={'author'} onClick={(e) => goMemberPage(e, boardArticle?.memberData?._id)}>
					<img src={memberImageUrl(boardArticle?.memberData?.memberImage)} alt="" />
					<span>{boardArticle?.memberData?.memberNick}</span>
					<small>· {timeAgo(boardArticle?.createdAt)}</small>
				</div>
				<div className={'stats'}>
					<span>
						<RemoveRedEyeOutlinedIcon />
						{boardArticle?.articleViews ?? 0}
					</span>
					<span>
						<ChatBubbleOutlineRoundedIcon />
						{boardArticle?.articleComments ?? 0}
					</span>
					<button
						className={liked ? 'liked' : ''}
						onClick={(e) => {
							e.stopPropagation();
							likeArticleHandler && likeArticleHandler(e, user, boardArticle?._id);
						}}
						aria-label={'Like'}
					>
						{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
						{boardArticle?.articleLikes ?? 0}
					</button>
				</div>
			</div>
		</article>
	);
};

export default CommunityCard;
