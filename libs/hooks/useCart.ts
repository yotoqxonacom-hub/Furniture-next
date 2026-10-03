import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { cartCountVar, userVar } from '../../apollo/store';
import { GET_CART_COUNT } from '../../apollo/user/query';
import { ADD_TO_CART, REMOVE_CART_ITEM, UPDATE_CART_ITEM } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetLoginConfirmAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';

/** Header badge: loads the count for the logged-in member and resets it on logout */
export const useCartCount = (): number => {
	const user = useReactiveVar(userVar);
	const count = useReactiveVar(cartCountVar);

	useQuery(GET_CART_COUNT, {
		fetchPolicy: 'network-only',
		context: { silent: true },
		skip: !user?._id,
		onCompleted: (data) => cartCountVar(data?.getCartCount ?? 0),
	});

	useEffect(() => {
		if (!user?._id) cartCountVar(0);
	}, [user?._id]);

	return count;
};

/** Cart mutations used by product cards, the product page and the cart page */
export const useCartActions = () => {
	const router = useRouter();
	const client = useApolloClient();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [addToCartMutation] = useMutation(ADD_TO_CART);
	const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM);
	const [removeCartItemMutation] = useMutation(REMOVE_CART_ITEM);

	const refreshCount = async (): Promise<void> => {
		const { data } = await client.query({ query: GET_CART_COUNT, fetchPolicy: 'network-only', context: { silent: true } });
		cartCountVar(data?.getCartCount ?? 0);
	};

	/** guests are asked to log in first; returns true when the member may use the cart */
	const ensureMember = async (): Promise<boolean> => {
		if (user?._id) return true;
		if (await sweetLoginConfirmAlert(t('Please login to use the cart'))) await router.push('/account/join');
		return false;
	};

	const run = async (action: () => Promise<unknown>, successText?: string): Promise<boolean> => {
		try {
			await action();
			await refreshCount();
			if (successText) sweetTopSmallSuccessAlert(t(successText), 900).then();
			return true;
		} catch (err: any) {
			await sweetErrorHandling(err);
			return false;
		}
	};

	const addToCart = async (productId: string, quantity: number = 1, successText: string | null = 'Added to cart') =>
		(await ensureMember()) &&
		run(() => addToCartMutation({ variables: { input: { productId, quantity } } }), successText ?? undefined);

	/** "Buy now": the cart row gets exactly `quantity` (added when missing) */
	const setExactQuantity = async (productId: string, quantity: number): Promise<boolean> => {
		if (!(await ensureMember())) return false;
		return run(async () => {
			try {
				await updateCartItemMutation({ variables: { input: { productId, quantity } } });
			} catch {
				await addToCartMutation({ variables: { input: { productId, quantity } } });
			}
		});
	};

	const updateQuantity = (productId: string, quantity: number) =>
		run(() => updateCartItemMutation({ variables: { input: { productId, quantity } } }));

	const removeItem = (productId: string) =>
		run(() => removeCartItemMutation({ variables: { input: productId } }), 'Removed from cart');

	return { addToCart, setExactQuantity, updateQuantity, removeItem, refreshCount };
};
