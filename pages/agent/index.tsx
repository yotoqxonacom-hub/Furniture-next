import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Pagination } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import AgentCard from '../../libs/components/common/AgentCard';
import AddProductButton from '../../libs/components/common/AddProductButton';
import MyShopPanel from '../../libs/components/agent/MyShopPanel';
import { Member } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import useLikeMember from '../../libs/hooks/useLikeMember';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const initialInput: AgentsInquiry = {
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: 'DESC' as any,
	search: {},
};

const sortOptions = [
	{ id: 'recent', label: 'Newest', sort: 'createdAt', direction: 'DESC' },
	{ id: 'old', label: 'Oldest', sort: 'createdAt', direction: 'ASC' },
	{ id: 'likes', label: 'Most liked', sort: 'memberLikes', direction: 'DESC' },
	{ id: 'views', label: 'Most viewed', sort: 'memberViews', direction: 'DESC' },
	{ id: 'rank', label: 'Top rated', sort: 'memberRank', direction: 'DESC' },
];

const parseInput = (raw: unknown): AgentsInquiry | null => {
	if (!raw || typeof raw !== 'string') return null;
	try {
		return { ...initialInput, ...JSON.parse(raw) };
	} catch {
		return null;
	}
};

const AgentList: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<AgentsInquiry>(parseInput(router.query.input) ?? initialInput);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const { loading, refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list ?? []);
			setTotal(data?.getAgents?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const likeMemberHandler = useLikeMember(() => getAgentsRefetch({ input: searchFilter }));

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		const parsed = parseInput(router.query.input) ?? initialInput;
		setSearchFilter(parsed);
		setSearchText(parsed?.search?.text ?? '');
	}, [router.isReady, router.query.input]);

	/** HANDLERS **/
	const applyFilter = async (next: AgentsInquiry) => {
		const url = `/agent?input=${encodeURIComponent(JSON.stringify(next))}`;
		await router.push(url, url, { scroll: false });
	};

	const searchHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		const search: any = {};
		if (searchText.trim()) search.text = searchText.trim();
		await applyFilter({ ...searchFilter, page: 1, search });
	};

	const sortHandler = async (id: string) => {
		const option = sortOptions.find((o) => o.id === id) ?? sortOptions[0];
		await applyFilter({ ...searchFilter, page: 1, sort: option.sort, direction: option.direction as any });
	};

	const paginationHandler = async (_: ChangeEvent<unknown>, page: number) => {
		await applyFilter({ ...searchFilter, page });
		window.scrollTo({ top: 260, behavior: 'smooth' });
	};

	const currentSort =
		sortOptions.find((o) => o.sort === searchFilter.sort && o.direction === searchFilter.direction)?.id ?? 'recent';
	const pageCount = Math.max(1, Math.ceil(total / (searchFilter.limit || 12)));

	return (
		<div className={'agents-page fx-section'}>
			<div className={'fx-container'}>
				<MyShopPanel />
				<div className={'agents-toolbar'}>
					<form className={'agents-search'} onSubmit={searchHandler}>
						<SearchRoundedIcon />
						<input
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							placeholder={t('Search sellers by name')}
						/>
						<button type="submit" className={'fx-btn dark sm'}>
							{t('Search')}
						</button>
					</form>
					<div className={'toolbar-actions'}>
						<AddProductButton />
						<label className={'sort'}>
							<span>{t('Sort by')}</span>
							<select value={currentSort} onChange={(e) => sortHandler(e.target.value)}>
								{sortOptions.map((o) => (
									<option key={o.id} value={o.id}>
										{t(o.label)}
									</option>
								))}
							</select>
						</label>
					</div>
				</div>

				{!loading && agents.length === 0 ? (
					<div className={'fx-empty'}>
						<img src="/img/furniture/col-relax.svg" alt="" />
						<strong>{t('No sellers found')}</strong>
					</div>
				) : (
					<div className={'fx-product-grid cols-4'}>
						{agents.map((agent) => (
							<AgentCard key={agent._id} agent={agent} likeMemberHandler={likeMemberHandler} />
						))}
					</div>
				)}

				{agents.length > 0 && (
					<div className={'fx-pagination'}>
						{pageCount > 1 && (
							<Pagination page={searchFilter.page} count={pageCount} onChange={paginationHandler} shape="circular" />
						)}
						<span className={'total'}>
							{total} {t(total === 1 ? 'seller' : 'sellers')}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(AgentList);
