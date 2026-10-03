import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Message } from '../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';

/** like member + open profile actions shared by My Page and Member page (follow lives in <FollowButton />) */
const useFollowActions = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			await likeTargetMember({ variables: { input: id } });
			await sweetTopSmallSuccessAlert(t('Saved'), 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		if (!memberId) return;
		if (memberId === user?._id) await router.push('/mypage?category=myProfile');
		else await router.push(`/member?memberId=${memberId}`);
	};

	return { likeMemberHandler, redirectToMemberPageHandler };
};

export default useFollowActions;
