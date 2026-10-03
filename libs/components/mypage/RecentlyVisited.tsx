import React, { ChangeEvent, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Pagination } from '@mui/material';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { GET_VISITED } from '../../../apollo/user/query';
import { T } from '../../types/common';
import useLikeProduct from '../../hooks/useLikeProduct';

const LIMIT = 6;

const RecentlyVisited = () => {
	const { t } = useTranslation('common');
	const [page, setPage] = useState<number>(1);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { loading, refetch: getVisitedRefetch } = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: LIMIT } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getVisited?.list ?? []);
			setTotal(data?.getVisited?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const likeProductHandler = useLikeProduct(() => getVisitedRefetch({ input: { page, limit: LIMIT } }));

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{t('Recently viewed')}</h2>
					<p>{t('Pieces you looked at recently.')}</p>
				</div>
			</div>
			{!loading && products.length === 0 ? (
				<div className={'fx-empty'}>
					<img src="/img/furniture/col-living.svg" alt="" />
					<strong>{t('No viewed products yet')}</strong>
				</div>
			) : (
				<div className={'fx-product-grid'}>
					{products.map((product) => (
						<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
					))}
				</div>
			)}
			{total > LIMIT && (
				<div className={'fx-pagination'}>
					<Pagination
						page={page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_: ChangeEvent<unknown>, p: number) => setPage(p)}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default RecentlyVisited;
