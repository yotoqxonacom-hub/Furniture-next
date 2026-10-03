import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { isLoggedIn } from '../../member';
import { sweetErrorHandling, sweetLoginConfirmAlert } from '../../sweetAlert';

interface FollowButtonProps {
	/** member to follow (user or agent) */
	memberId: string;
	/** current state from the API: member.meFollowed?.[0]?.myFollowing */
	followed: boolean;
	/** called after a successful follow / unfollow, e.g. to refetch follower counts */
	onChange?: (followed: boolean) => void;
	size?: 'sm' | 'md';
	className?: string;
}

/** true when the API says the logged-in member follows this member */
export const isFollowed = (member?: { meFollowed?: { myFollowing?: boolean }[] } | null): boolean =>
	Boolean(member?.meFollowed?.[0]?.myFollowing);

/**
 * Follow / Unfollow toggle for any member page or card.
 * - hidden on your own profile
 * - guests are asked to log in
 * - optimistic: flips immediately, rolls back if the request fails
 */
const FollowButton = ({ memberId, followed, onChange, size = 'sm', className = '' }: FollowButtonProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [following, setFollowing] = useState<boolean>(followed);
	const [busy, setBusy] = useState<boolean>(false);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	/** LIFECYCLES **/
	useEffect(() => setFollowing(followed), [followed]);

	if (!memberId || memberId === user?._id) return null;

	/** HANDLERS **/
	const clickHandler = async (e: React.MouseEvent) => {
		e.preventDefault(); // buttons can sit inside clickable cards / links
		e.stopPropagation();
		if (busy) return;

		if (!isLoggedIn(user)) {
			if (await sweetLoginConfirmAlert(t('Log in to follow members'))) {
				await router.push({ pathname: '/account/join', query: { referrer: router.asPath } });
			}
			return;
		}

		const next = !following;
		setFollowing(next);
		setBusy(true);
		try {
			if (next) await subscribe({ variables: { input: memberId } });
			else await unsubscribe({ variables: { input: memberId } });
			onChange?.(next);
		} catch (err: any) {
			setFollowing(!next);
			sweetErrorHandling(err).then();
		} finally {
			setBusy(false);
		}
	};

	return (
		<button
			type="button"
			onClick={clickHandler}
			disabled={busy}
			aria-pressed={following}
			className={`fx-btn ${following ? 'outline' : 'dark'} ${size === 'sm' ? 'sm' : ''} follow-btn ${className}`}
		>
			{following ? <HowToRegRoundedIcon fontSize="small" /> : <PersonAddAlt1RoundedIcon fontSize="small" />}
			{following ? t('Unfollow') : t('Follow')}
		</button>
	);
};

export default FollowButton;
