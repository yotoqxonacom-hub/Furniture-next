import type { AppProps } from 'next/app';
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ApolloProvider } from '@apollo/client';
import { appWithTranslation } from 'next-i18next';
import { light } from '../scss/MaterialTheme';
import { useApollo } from '../apollo/client';
import useScrollRestoration from '../libs/hooks/useScrollRestoration';
// @ts-ignore — stylesheet imports are handled by Next.js at runtime.
import '../scss/app.scss';
// @ts-ignore
import '../scss/furniture/index.scss';
// @ts-ignore — admin panel styles (desktop only)
import '../scss/admin/admin.scss';

const App = ({ Component, pageProps, router }: AppProps) => {
	// @ts-ignore
	const [theme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);
	useScrollRestoration(router); // Back returns to the same place on the page

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
