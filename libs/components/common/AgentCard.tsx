import React from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { openChatWith } from '../../chat';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { memberImageUrl } from '../../utils';
import { isSameMember } from '../../member';
import FollowButton, { isFollowed } from './FollowButton';

interface AgentCardProps {
	agent: Member;
	likeMemberHandler?: (user: any, id: string) => void;
}

const AgentCard = ({ agent, likeMemberHandler }: AgentCardProps) => {
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const liked = Boolean(agent?.meLiked && agent?.meLiked[0]?.myFavorite);
	const isMe = isSameMember(user, agent);
	const href = { pathname: '/agent/detail', query: { agentId: agent?._id } };

	return (
		<div className={`fx-agent-card ${isMe ? 'is-me' : ''}`}>
			{isMe && <span className={'fx-badge clay me-badge'}>{t('You')}</span>}
			<Link href={href}>
				<img className={'avatar'} src={memberImageUrl(agent?.memberImage)} alt={agent?.memberNick} />
			</Link>
			<Link href={href}>
				<strong>{agent?.memberFullName || agent?.memberNick}</strong>
			</Link>
			<span className={'role'}>{agent?.memberAddress ? agent.memberAddress : t('Furniture seller')}</span>
			<div className={'meta'}>
				<span title={t('products')}>
					<ChairOutlinedIcon />
					{agent?.memberProducts ?? 0}
				</span>
				<span title={t('views')}>
					<RemoveRedEyeOutlinedIcon />
					{agent?.memberViews ?? 0}
				</span>
				<span title={t('likes')}>
					<FavoriteBorderRoundedIcon />
					{agent?.memberLikes ?? 0}
				</span>
			</div>
			<FollowButton memberId={agent?._id} followed={isFollowed(agent)} className={'card-follow'} />
			<div className={'actions'}>
				<Link href={href} className={'fx-btn outline sm'}>
					{isMe ? t('View my shop') : t('View shop')}
				</Link>
				{/* you cannot message or like yourself */}
				{!isMe && (
					<button className={'fx-icon-btn'} onClick={() => openChatWith(agent)} aria-label={t('Message seller')}>
						<ChatBubbleOutlineRoundedIcon />
					</button>
				)}
				{!isMe && likeMemberHandler && (
					<button
						className={`fx-icon-btn ${liked ? 'liked' : ''}`}
						onClick={() => likeMemberHandler(user, agent?._id)}
						aria-label={t('Like')}
					>
						{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					</button>
				)}
			</div>
		</div>
	);
};

export default AgentCard;
