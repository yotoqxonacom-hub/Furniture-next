import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { GET_AGENTS } from '../../../apollo/user/query';
import { Member } from '../../types/member/member';
import { T } from '../../types/common';
import AgentCard from '../common/AgentCard';
import useLikeMember from '../../hooks/useLikeMember';

const input = { page: 1, limit: 4, sort: 'memberRank', direction: 'DESC', search: {} };

const TopAgents = () => {
	const { t } = useTranslation('common');
	const [topAgents, setTopAgents] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const { refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(data?.getAgents?.list ?? []);
		},
	});

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
				<div className={'fx-product-grid cols-4 fx-rail'}>
					{topAgents.map((agent) => (
						<AgentCard key={agent._id} agent={agent} likeMemberHandler={likeMemberHandler} />
					))}
				</div>
			</div>
		</section>
	);
};

export default TopAgents;
