import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { Message } from '../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { T } from '../types/common';

const useLikeMember = (onDone?: () => Promise<any> | void) => {
	const { t } = useTranslation('common');
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	return async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			await likeTargetMember({ variables: { input: id } });
			if (onDone) await onDone();
			await sweetTopSmallSuccessAlert(t('Saved'), 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};
};

export default useLikeMember;
