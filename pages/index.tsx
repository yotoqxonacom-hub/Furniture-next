import { NextPage } from 'next';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import HomeHero from '../libs/components/homepage/HomeHero';
import Categories from '../libs/components/homepage/Categories';
import ProductSection from '../libs/components/homepage/ProductSection';
import Collections from '../libs/components/homepage/Collections';
import HomeVideo from '../libs/components/homepage/HomeVideo';
import Promo from '../libs/components/homepage/Promo';
import TopAgents from '../libs/components/homepage/TopAgents';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import Perks from '../libs/components/homepage/Perks';
import HomeFaq from '../libs/components/homepage/HomeFaq';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<HomeHero />
			<Perks />
			<Categories />
			<ProductSection
				eyebrow={'Trending now'}
				title={'Most loved pieces'}
				desc={'Ranked by likes from our community.'}
				sort={'productLikes'}
			/>
			<Collections />
			<HomeVideo />
			<ProductSection
				eyebrow={'Popular'}
				title={'Everyone is looking at'}
				desc={'The most viewed listings this week.'}
				sort={'productViews'}
			/>
			<Promo />
			<ProductSection eyebrow={'Editor’s choice'} title={'Top picks'} sort={'productRank'} />
			<TopAgents />
			<CommunityBoards />
			<HomeFaq />
		</Stack>
	);
};

export default withLayoutMain(Home);
