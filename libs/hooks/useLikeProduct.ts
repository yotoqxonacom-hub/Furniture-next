import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { Message } from '../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { T } from '../types/common';

/** Shared like handler for product cards. `onDone` usually refetches the list. */
const useLikeProduct = (onDone?: () => Promise<any> | void) => {
	const { t } = useTranslation('common');
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	return async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			await likeTargetProduct({ variables: { input: id } });
			if (onDone) await onDone();
			await sweetTopSmallSuccessAlert(t('Saved'), 800);
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};
};

export default useLikeProduct;
