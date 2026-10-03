import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { translate } from '../i18n';

/**
 * Same flow as Nestar-next (logIn / signUp -> request token -> updateStorage -> updateUserInfo),
 * with one important difference: errors are NOT swallowed.
 * Nestar-next caught every error and called logOut(), which reloads the page — so a failed login
 * looked like a success and the join page redirected to home while the alert was wiped by the reload.
 * Here the error is re-thrown with a readable message and the page decides what to show.
 */

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

/** backend messages (furniture-api libs/enums/common.enum.ts) -> what the user should read */
const authErrorText: Record<string, string> = {
	'No member with that member nick!': 'No account found with this username',
	'Wrong password, try again!': 'Wrong password, please try again',
	'You have been blocked!': 'Your account has been blocked. Please contact support',
	'Already used member nick or phone!': 'This username or phone number is already taken',
};

export const readableAuthError = (err: any): string => {
	const status = err?.networkError?.statusCode;
	if (status === 404) return translate('API address is wrong (404). Check REACT_APP_API_GRAPHQL_URL in .env.local');
	if (err?.networkError) return translate('Server is not reachable. Is the backend running?');
	const raw = err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Something went wrong!';
	const message = Array.isArray(raw) ? raw.join(', ') : String(raw);
	return translate(authErrorText[message] ?? message);
};

export const logIn = async (nick: string, password: string): Promise<void> => {
	const { jwtToken } = await requestJwtToken({ nick, password });
	if (!jwtToken) throw new Error(translate('Login failed, please try again'));
	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

const requestJwtToken = async ({ nick, password }: { nick: string; password: string }): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});
		return { jwtToken: result?.data?.login?.accessToken };
	} catch (err: any) {
		console.log('login error:', err?.graphQLErrors ?? err);
		throw new Error(readableAuthError(err));
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });
	if (!jwtToken) throw new Error(translate('Sign up failed, please try again'));
	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});
		return { jwtToken: result?.data?.signup?.accessToken };
	} catch (err: any) {
		console.log('signup error:', err?.graphQLErrors ?? err);
		throw new Error(readableAuthError(err));
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	let claims: CustomJwtPayload;
	try {
		claims = decodeJWT<CustomJwtPayload>(jwtToken);
	} catch (err) {
		// broken / foreign token in storage: drop it silently
		localStorage.removeItem('accessToken');
		return false;
	}

	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage: claims.memberImage ?? '',
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProducts: claims.memberProducts,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
	return true;
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProducts: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
