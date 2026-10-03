import { errorMessageOf } from '../libs/errorMessage';
import { GRAPHQL_URL } from '../libs/env';
import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: GRAPHQL_URL,
		});

		/**
		 * Mutations: the calling component catches the error and shows ONE alert (login, report, upload…).
		 * Showing another alert here closed that one (Swal shows one popup at a time) — so we only log.
		 * Queries: show an alert unless the query asked to stay quiet (background polling, badges).
		 */
		const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
			const definition: any = operation.query.definitions.find((d: any) => d.kind === 'OperationDefinition');
			const isMutation = definition?.operation === 'mutation';
			const silent = Boolean(operation.getContext()?.silent);

			if (graphQLErrors) {
				graphQLErrors.forEach(({ message, path }) => {
					console.log(`[GraphQL error]: ${operation.operationName}:`, message, path);
				});
				const text = errorMessageOf(graphQLErrors[0]?.message);
				if (!isMutation && !silent && text && !text.includes('input')) sweetErrorAlert(text);
			}
			if (networkError) console.log(`[Network error]: ${operation.operationName}:`, networkError);
		});

		return from([errorLink, tokenRefreshLink, authLink.concat(link)]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
