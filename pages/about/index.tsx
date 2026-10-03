import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const stats = [
	{ value: '12k+', label: 'homes furnished' },
	{ value: '850+', label: 'independent sellers' },
	{ value: '9', label: 'cities with delivery' },
	{ value: '4.9', label: 'average rating' },
];

const values = [
	{
		icon: <ForestOutlinedIcon />,
		title: 'Made to last',
		desc: 'We favour solid wood, honest materials and pieces that can be repaired instead of replaced.',
	},
	{
		icon: <HandshakeOutlinedIcon />,
		title: 'Fair for makers',
		desc: 'Sellers keep their own prices and talk to buyers directly — no hidden middlemen.',
	},
	{
		icon: <VerifiedUserOutlinedIcon />,
		title: 'Safe for buyers',
		desc: 'Every report is reviewed by our team, and repeated violations lead to warnings and blocks.',
	},
];

const About: NextPage = () => {
	const { t } = useTranslation('common');

	return (
		<div className={'about-page'}>
			<section className={'fx-section'}>
				<div className={'fx-container about-intro'}>
					<h2>{t('We help people furnish homes they love living in.')}</h2>
					<p>
						{t(
							'Furniture started as a small Seoul community of makers who were tired of disposable furniture. Today it is a marketplace where independent workshops and trusted stores meet people looking for the right sofa, bed or armchair — with clear prices, real reviews and delivery across Korea.',
						)}
					</p>
				</div>
			</section>

			<section className={'about-stats'}>
				<div className={'fx-container stats-grid'}>
					{stats.map((item) => (
						<div key={item.label}>
							<strong>{item.value}</strong>
							<span>{t(item.label)}</span>
						</div>
					))}
				</div>
			</section>

			<section className={'fx-section'}>
				<div className={'fx-container'}>
					<div className={'fx-section-head'}>
						<div>
							<span className={'eyebrow'}>{t('Our values')}</span>
							<h2>{t('What we stand for')}</h2>
						</div>
					</div>
					<div className={'values-grid'}>
						{values.map((item) => (
							<div key={item.title} className={'fx-card value'}>
								<span className={'icon'}>{item.icon}</span>
								<h3>{t(item.title)}</h3>
								<p>{t(item.desc)}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className={'fx-section'}>
				<div className={'fx-container'}>
					<div className={'about-cta'}>
						<div>
							<h2>{t('Have furniture to sell?')}</h2>
							<p>{t('Open a seller account and list your first piece in minutes.')}</p>
						</div>
						<Link href={'/account/join'} className={'fx-btn primary'}>
							{t('Become a seller')}
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default withLayoutBasic(About);
