import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import 'swiper/css';
import { GET_AGENTS } from '../../../apollo/user/query';
import { Member } from '../../types/member/member';
import AgentCard from '../common/AgentCard';
import useLikeMember from '../../hooks/useLikeMember';

// karusel aylanib yurishi uchun ekranda ko'rinadiganidan ko'proq agent olamiz
const input = { page: 1, limit: 10, sort: 'memberRank', direction: 'DESC', search: {} };

const autoplayConfig = {
	delay: 0, // slaydlar orasida to'xtamaydi — o'ngdan chapga uzluksiz suriladi
	disableOnInteraction: false, // foydalanuvchi tekkandan keyin ham davom etadi
	pauseOnMouseEnter: true, // sichqoncha ustida bo'lsa to'xtaydi
};

const TopAgents = () => {
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const { data, refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const topAgents: Member[] = data?.getAgents?.list ?? [];

	const likeMemberHandler = useLikeMember(() => getAgentsRefetch({ input }));

	if (!topAgents.length) return null;

	return (
		<section className={'fx-section home-agents'}>
			<div className={'fx-container'}>
				<div className={'fx-section-head'}>
					<div>
						<span className={'eyebrow'}>{t('Makers & stores')}</span>
						<h2>{t('Top sellers')}</h2>
						<p>{t('Highest rated studios this month.')}</p>
					</div>
					<div className={'head-actions'}>
						<Link href={'/agent'} className={'fx-btn outline sm'}>
							{t('All sellers')}
							<EastRoundedIcon fontSize="small" />
						</Link>
					</div>
				</div>
				<Swiper
					className={'fx-agent-swiper'}
					modules={[Autoplay]}
					slidesPerView={1.2}
					spaceBetween={14}
					loop={topAgents.length > 4}
					speed={5000}
					autoplay={autoplayConfig}
					breakpoints={{
						600: { slidesPerView: 2, spaceBetween: 16 },
						900: { slidesPerView: 3, spaceBetween: 22 },
						1100: { slidesPerView: 4, spaceBetween: 22 },
					}}
				>
					{topAgents.map((agent) => (
						<SwiperSlide key={agent._id}>
							<AgentCard agent={agent} likeMemberHandler={likeMemberHandler} />
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};

export default TopAgents;
