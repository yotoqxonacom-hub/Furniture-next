import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import Shell from './Shell';
import { PAGE_IMAGES } from '../../pageImages';

interface BannerInfo {
	title: string;
	desc: string;
	image: string;
}

const banners: Record<string, BannerInfo> = {
	'/product': {
		title: 'Shop furniture',
		desc: 'Sofas, beds, armchairs and more from trusted sellers across Korea.',
		image: PAGE_IMAGES.shop,
	},
	'/agent': {
		title: 'Our sellers',
		desc: 'Meet the studios and makers behind every piece.',
		image: PAGE_IMAGES.agent,
	},
	'/agent/detail': {
		title: 'Seller profile',
		desc: 'Collection, reviews and contact details.',
		image: PAGE_IMAGES.agent,
	},
	'/mypage': {
		title: 'My page',
		desc: 'Your listings, favorites, reports and profile in one place.',
		image: PAGE_IMAGES.mypage,
	},
	'/community': {
		title: 'Community',
		desc: 'Interior ideas, recommendations and news from fellow home lovers.',
		image: PAGE_IMAGES.community,
	},
	'/community/detail': {
		title: 'Community',
		desc: 'Interior ideas, recommendations and news from fellow home lovers.',
		image: PAGE_IMAGES.community,
	},
	'/cs': {
		title: 'Help center',
		desc: 'Notices, answers to common questions and terms of service.',
		image: PAGE_IMAGES.help,
	},
	'/account/join': {
		title: 'Welcome',
		desc: 'Sign in or create an account to save favorites and list your furniture.',
		image: PAGE_IMAGES.about,
	},
	'/member': {
		title: 'Member page',
		desc: 'Products, articles and followers.',
		image: PAGE_IMAGES.mypage,
	},
	'/about': {
		title: 'About CozyLife',
		desc: 'Honest furniture for real homes, since 2024.',
		image: PAGE_IMAGES.about,
	},
};

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');

		const banner = useMemo<BannerInfo>(() => {
			return banners[router.pathname] ?? { title: '', desc: '', image: PAGE_IMAGES.main };
		}, [router.pathname]);

		return (
			<Shell title={t(banner.title)}>
				<section className={'fx-page-hero'}>
					<div className={'fx-container hero-grid'}>
						<div className={'copy'}>
							<div className={'crumbs'}>
								<Link href={'/'}>{t('Home')}</Link>
								<span>/</span>
								<span>{t(banner.title)}</span>
							</div>
							<h1>{t(banner.title)}</h1>
							<p>{t(banner.desc)}</p>
						</div>
						{/* --page-photo feeds the blurred backdrop in scss (.fx-page-hero .media::before) */}
						<div className={'media'} style={{ ['--page-photo' as any]: `url(${banner.image})` }}>
							<img src={banner.image} alt={t(banner.title)} />
						</div>
					</div>
				</section>
				<Component {...props} />
			</Shell>
		);
	};
};

export default withLayoutBasic;
