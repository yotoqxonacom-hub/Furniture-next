import { MemberType } from './enums/member.enum';

/**
 * Small role helpers so pages don't repeat string comparisons.
 * `member` can be the logged-in user (userVar) or any member coming from the API.
 */
type MemberLike = { _id?: string; memberType?: string } | null | undefined;

export const isLoggedIn = (user: MemberLike): boolean => Boolean(user?._id);

export const isAgent = (member: MemberLike): boolean => member?.memberType === MemberType.AGENT;

export const isAdmin = (member: MemberLike): boolean => member?.memberType === MemberType.ADMIN;

/**
 * Who sees the "Add product" button: sellers (they can add products) and guests
 * (the button leads them to seller sign-up). Logged-in users and admins don't see it.
 */
export const canSeeAddProduct = (user: MemberLike): boolean => !isLoggedIn(user) || isAgent(user);

/** true when both refer to the same member (e.g. an agent looking at their own card) */
export const isSameMember = (a: MemberLike, b: MemberLike): boolean => Boolean(a?._id) && a?._id === b?._id;

/** where a member's public profile lives: sellers have a shop page, everyone else a member page */
export const profileHref = (member: MemberLike) =>
	isAgent(member)
		? { pathname: '/agent/detail', query: { agentId: member?._id } }
		: { pathname: '/member', query: { memberId: member?._id } };

/** My Page entry points used across the app */
export const ADD_PRODUCT_HREF = { pathname: '/mypage', query: { category: 'addProduct' } };
export const MY_PRODUCTS_HREF = { pathname: '/mypage', query: { category: 'myProducts' } };
export const MY_PROFILE_HREF = { pathname: '/mypage', query: { category: 'myProfile' } };
export const MY_ORDERS_HREF = { pathname: '/mypage', query: { category: 'myOrders' } };
export const SELLER_ORDERS_HREF = { pathname: '/mypage', query: { category: 'sellerOrders' } };

/** sign-up form with "Seller" preselected; after sign-up the new seller lands on Add product */
export const SELLER_SIGNUP_HREF = {
	pathname: '/account/join',
	query: { mode: 'signup', type: 'AGENT', referrer: '/mypage?category=addProduct' },
};
