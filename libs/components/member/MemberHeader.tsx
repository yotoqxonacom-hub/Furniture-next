import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { openChatWith } from '../../chat';
import { isAgent, isSameMember } from '../../member';
import { GET_MEMBER } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { T } from '../../types/common';
import { memberImageUrl } from '../../utils';
import FollowButton, { isFollowed } from '../common/FollowButton';

const MemberHeader = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const memberId = router.query.memberId as string;
	const category = (router.query.category as string) ?? 'products';
	const [member, setMember] = useState<Member | null>(null);

	/** APOLLO REQUESTS **/
	const { refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const loaded: Member | null = data?.getMember ?? null;
			setMember(loaded);
			// only sellers have a "Products" tab; everyone else starts on "Articles"
			if (loaded && !isAgent(loaded) && (router.query.category ?? 'products') === 'products') {
				router.replace({ pathname: '/member', query: { memberId, category: 'articles' } }, undefined, { shallow: true }).then();
			}
		},
	});

	if (!member) return null;

	const tabs = [
		...(member.memberType === 'AGENT' ? [{ key: 'products', label: 'Products', count: member.memberProducts }] : []),
		{ key: 'articles', label: 'Articles', count: member.memberArticles },
		{ key: 'followers', label: 'Followers', count: member.memberFollowers },
		{ key: 'followings', label: 'Followings', count: member.memberFollowings },
	];

	return (
		<div className={'member-header'}>
			<div className={'card'}>
				<img className={'avatar'} src={memberImageUrl(member.memberImage)} alt={member.memberNick} />
				<div className={'info'}>
					<span className={`fx-badge ${member.memberType === 'AGENT' ? 'clay' : 'sage'}`}>
						{member.memberType === 'AGENT' ? t('Seller') : t('Member')}
					</span>
					<h2>{member.memberFullName || member.memberNick}</h2>
					{member.memberPhone && (
						<span className={'phone'}>
							<PhoneOutlinedIcon />
							{member.memberPhone}
						</span>
					)}
					{member.memberDesc && <p>{member.memberDesc}</p>}
				</div>
				<div className={'actions'}>
					{!isSameMember(user, member) && (
						<button className={'fx-btn primary sm'} onClick={() => openChatWith(member, () => router.push('/account/join'))}>
							<ChatBubbleOutlineRoundedIcon fontSize="small" />
							{t('Message')}
						</button>
					)}
					{member.memberType === 'AGENT' && (
						<Link href={{ pathname: '/agent/detail', query: { agentId: member._id } }} className={'fx-btn outline sm'}>
							{t('View shop')}
						</Link>
					)}
					{/* refetch so the Followers tab count updates */}
					<FollowButton
						memberId={member._id}
						followed={isFollowed(member)}
						onChange={() => getMemberRefetch({ input: memberId })}
					/>
				</div>
			</div>
			<nav className={'member-tabs fx-chip-row'}>
				{tabs.map((tab) => (
					<Link
						key={tab.key}
						href={{ pathname: '/member', query: { memberId, category: tab.key } }}
						scroll={false}
						className={`fx-chip ${category === tab.key ? 'active' : ''}`}
					>
						{t(tab.label)} <span className={'count'}>{tab.count ?? 0}</span>
					</Link>
				))}
			</nav>
		</div>
	);
};

export default MemberHeader;
