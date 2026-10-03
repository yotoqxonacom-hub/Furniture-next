import React, { useEffect } from 'react';
import Head from 'next/head';
import { Stack } from '@mui/material';
import Top from '../Top';
import Footer from '../Footer';
import Chat from '../Chat';
import { getJwtToken, updateUserInfo } from '../../auth';
import { connectSocket } from '../../socket';

interface ShellProps {
	children: React.ReactNode;
	title?: string;
	/** pages without a banner need space for the fixed header */
	offsetTop?: boolean;
}

const Shell = ({ children, title, offsetTop = false }: ShellProps) => {
	/** LIFECYCLES **/
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
		connectSocket(); // no-op if this tab is already connected
	}, []);

	const pageTitle = title ? `${title} · Furniture` : 'Furniture — modern furniture marketplace';

	return (
		<>
			<Head>
				<title>{pageTitle}</title>
				<meta name={'title'} content={pageTitle} />
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
			</Head>
			<Stack id="app-wrap">
				<Top />
				<Stack id={'main'} className={offsetTop ? 'offset-top' : ''}>
					{children}
				</Stack>
				<Chat />
				<Footer />
			</Stack>
		</>
	);
};

export default Shell;
