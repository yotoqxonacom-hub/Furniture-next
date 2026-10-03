import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Drawer, Pagination } from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { COUNT_PLUS, NO_LIMIT, toProductsQuery, withFilter } from '../../libs/productFilter';
import Filter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/common/ProductCard';
import AddProductButton from '../../libs/components/common/AddProductButton';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import useLikeProduct from '../../libs/hooks/useLikeProduct';
import { productTypeLabel } from '../../libs/enums/product.enum';
import { capitalize } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const initialInput: ProductsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: 'DESC' as any,
	// no hidden price / size caps: a default range silently hid expensive or large pieces (e.g. corner sofas)
	search: {},
};

const sortOptions = [
	{ id: 'new', label: 'Newest', sort: 'createdAt', direction: 'DESC' },
	{ id: 'lowest', label: 'Price: low to high', sort: 'productPrice', direction: 'ASC' },
	{ id: 'highest', label: 'Price: high to low', sort: 'productPrice', direction: 'DESC' },
	{ id: 'likes', label: 'Most liked', sort: 'productLikes', direction: 'DESC' },
	{ id: 'views', label: 'Most viewed', sort: 'productViews', direction: 'DESC' },
];

const parseInput = (raw: unknown): ProductsInquiry | null => {
	if (!raw || typeof raw !== 'string') return null;
	try {
		const parsed = JSON.parse(raw);
		return { ...initialInput, ...parsed, search: { ...(parsed?.search ?? {}) } };
	} catch {
		return null;
	}
};

const ProductList: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(parseInput(router.query.input) ?? initialInput);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [filterOpen, setFilterOpen] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { loading, refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		// the URL keeps what the user picked; toProductsQuery adapts it for the backend ("5+" etc.)
		variables: { input: toProductsQuery(searchFilter) },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const likeProductHandler = useLikeProduct(() => getProductsRefetch({ input: toProductsQuery(searchFilter) }));

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		const parsed = parseInput(router.query.input);
		setSearchFilter(parsed ?? initialInput);
	}, [router.isReady, router.query.input]);

	/** HANDLERS **/
	const applyFilter = async (next: ProductsInquiry) => {
		const url = `/product?input=${encodeURIComponent(JSON.stringify(next))}`;
		await router.push(url, url, { scroll: false });
	};

	const paginationHandler = async (_: ChangeEvent<unknown>, page: number) => {
		await applyFilter({ ...searchFilter, page });
		window.scrollTo({ top: 260, behavior: 'smooth' });
	};

	const sortHandler = async (id: string) => {
		const option = sortOptions.find((o) => o.id === id) ?? sortOptions[0];
		await applyFilter({ ...searchFilter, page: 1, sort: option.sort, direction: option.direction as any });
	};

	const currentSort =
		sortOptions.find((o) => o.sort === searchFilter.sort && o.direction === searchFilter.direction)?.id ?? 'new';

	/** one removable chip per active filter, so users always see why the list is short */
	const activeChips = useMemo(() => {
		const s: Record<string, any> = searchFilter?.search ?? {};
		const chips: { key: string; label: string; remove: () => void }[] = [];
		const setSearch = (nextSearch: Record<string, any>) => applyFilter({ ...searchFilter, page: 1, search: nextSearch });
		const listChips = (key: string, label: (v: any) => string) =>
			(s[key] ?? []).forEach((v: any) =>
				chips.push({
					key: `${key}-${v}`,
					label: label(v),
					remove: () => setSearch(withFilter(s, key, (s[key] ?? []).filter((x: any) => x !== v))),
				}),
			);
		const plus = (n: number) => (n === COUNT_PLUS ? `${n}+` : String(n));
		const range = (r: { start: number; end: number }, unit: string) =>
			r.end === NO_LIMIT ? `${r.start}${unit}+` : `${r.start}–${r.end}${unit}`;

		listChips('typeList', (v) => t(productTypeLabel[v]));
		listChips('locationList', (v) => t(capitalize(v)));
		listChips('bedsList', (v) => `${plus(v)} ${t('seats')}`);
		listChips('roomsList', (v) => `${plus(v)} ${t('pcs')}`);
		if (s.pricesRange) chips.push({ key: 'price', label: `$${range(s.pricesRange, '')}`, remove: () => setSearch(withFilter(s, 'pricesRange', undefined)) });
		if (s.squaresRange) chips.push({ key: 'size', label: range(s.squaresRange, ' cm'), remove: () => setSearch(withFilter(s, 'squaresRange', undefined)) });
		if ((s.options ?? []).includes('productBarter'))
			chips.push({ key: 'barter', label: t('Barter'), remove: () => setSearch(withFilter(s, 'options', undefined)) });
		if (s.text) chips.push({ key: 'text', label: `“${s.text}”`, remove: () => setSearch(withFilter(s, 'text', undefined)) });
		return chips;
	}, [searchFilter]);

	const pageCount = Math.max(1, Math.ceil(total / (searchFilter.limit || 9)));

	return (
		<div className={'shop-page fx-section'}>
			<div className={'fx-container shop-layout'}>
				<aside className={'shop-aside'}>
					<Filter searchFilter={searchFilter} applyFilter={applyFilter} initialInput={initialInput} />
				</aside>

				<div className={'shop-main'}>
					<div className={'shop-toolbar'}>
						<div className={'count'}>
							<strong>{total}</strong> {t(total === 1 ? 'product' : 'products')}
						</div>
						<div className={'controls'}>
							<AddProductButton />
							<button className={'fx-btn outline sm filter-toggle'} onClick={() => setFilterOpen(true)}>
								<TuneRoundedIcon fontSize="small" />
								{t('Filters')}
							</button>
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

					{activeChips.length > 0 && (
						<div className={'active-chips fx-chip-row'}>
							{activeChips.map((chip) => (
								<button key={chip.key} className={'fx-chip active'} onClick={chip.remove}>
									{chip.label}
									<CloseRoundedIcon fontSize="small" />
								</button>
							))}
						</div>
					)}

					{!loading && products.length === 0 ? (
						<div className={'fx-empty'}>
							<img src="/img/furniture/placeholder.svg" alt="" />
							<strong>{t('No furniture matches these filters')}</strong>
							<span>{t('Try removing a filter or searching for something else.')}</span>
							<button className={'fx-btn outline sm'} onClick={() => applyFilter(initialInput)}>
								{t('Clear filters')}
							</button>
							<AddProductButton variant={'primary'} />
						</div>
					) : (
						<div className={`fx-product-grid ${loading ? 'is-loading' : ''}`}>
							{products.map((product) => (
								<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
							))}
						</div>
					)}

					{products.length > 0 && pageCount > 1 && (
						<div className={'fx-pagination'}>
							<Pagination
								page={searchFilter.page}
								count={pageCount}
								onChange={paginationHandler}
								shape="circular"
								color="primary"
							/>
						</div>
					)}
				</div>
			</div>

			<Drawer anchor={'left'} open={filterOpen} onClose={() => setFilterOpen(false)}>
				<div className={'filter-drawer'}>
					<div className={'drawer-top'}>
						<strong>{t('Filters')}</strong>
						<button className={'fx-icon-btn'} onClick={() => setFilterOpen(false)} aria-label={'Close filters'}>
							<CloseRoundedIcon />
						</button>
					</div>
					<Filter searchFilter={searchFilter} applyFilter={applyFilter} initialInput={initialInput} />
					<div className={'drawer-bottom'}>
						<button className={'fx-btn primary block'} onClick={() => setFilterOpen(false)}>
							{t('Show')} {total} {t(total === 1 ? 'product' : 'products')}
						</button>
					</div>
				</div>
			</Drawer>
		</div>
	);
};

export default withLayoutBasic(ProductList);
