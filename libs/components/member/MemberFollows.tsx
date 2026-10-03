import React, { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Pagination } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { openChatWith } from '../../chat';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { FollowInquiry } from '../../types/follow/follow.input';
import { T } from '../../types/common';
import { memberImageUrl } from '../../utils';
import FollowButton, { isFollowed } from '../common/FollowButton';

export type FollowHandler = (id: string, refetch: any, query: any) => Promise<void>;

interface MemberFollowsProps {
	mode: 'followers' | 'followings';
	likeMemberHandler: FollowHandler;
	redirectToMemberPageHandler: (memberId: string) => Promise<void>;
}

const LIMIT = 8;

const MemberFollows = ({
	mode,
	likeMemberHandler,
	redirectToMemberPageHandler,
}: MemberFollowsProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const isFollowers = mode === 'followers';
	const [inquiry, setInquiry] = useState<FollowInquiry>({ page: 1, limit: LIMIT, search: {} });
	const [items, setItems] = useState<any[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const searchKey = isFollowers ? 'followingId' : 'followerId';
	const { loading, refetch } = useQuery(isFollowers ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		skip: !inquiry.search?.[searchKey],
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const result = isFollowers ? data?.getMemberFollowers : data?.getMemberFollowings;
			setItems(result?.list ?? []);
			setTotal(result?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const memberId = (router.query.memberId as string) || user?._id;
		if (!memberId) return;
		setInquiry((prev) => ({ ...prev, page: 1, search: { [searchKey]: memberId } }));
	}, [router.query.memberId, user?._id, mode]);

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{isFollowers ? t('Followers') : t('Followings')}</h2>
					<p>
						{total} {isFollowers ? t('people follow') : t('people followed')}
					</p>
				</div>
			</div>

			{!loading && items.length === 0 ? (
				<div className={'fx-empty'}>
					<strong>{isFollowers ? t('No followers yet') : t('Not following anyone yet')}</strong>
				</div>
			) : (
				<div className={'follow-list'}>
					{items.map((item) => {
						const member = isFollowers ? item.followerData : item.followingData;
						if (!member) return null;
						const liked = Boolean(item?.meLiked && item.meLiked[0]?.myFavorite);
						return (
							<div key={item._id} className={'follow-row'}>
								<button className={'who'} onClick={() => redirectToMemberPageHandler(member._id)}>
									<img src={memberImageUrl(member.memberImage)} alt="" />
									<div>
										<strong>{member.memberNick}</strong>
										<span>
											{member.memberFollowers ?? 0} {t('followers')} · {member.memberFollowings ?? 0} {t('following')}
										</span>
									</div>
								</button>
								<div className={'acts'}>
									{user?._id && user._id !== member._id && (
										<button className={'fx-icon-btn'} onClick={() => openChatWith(member)} aria-label={'Message'}>
											<ChatBubbleOutlineRoundedIcon />
										</button>
									)}
									<button
										className={`fx-icon-btn ${liked ? 'liked' : ''}`}
										onClick={() => likeMemberHandler(member._id, refetch, inquiry)}
										aria-label={'Like'}
									>
										{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
									</button>
									<FollowButton
										memberId={member._id}
										followed={isFollowed(item)}
										onChange={() => refetch({ input: inquiry })}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{total > LIMIT && (
				<div className={'fx-pagination'}>
					<Pagination
						page={inquiry.page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_: ChangeEvent<unknown>, page: number) => setInquiry((prev) => ({ ...prev, page }))}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default MemberFollows;
