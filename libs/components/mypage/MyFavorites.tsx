import React, { ChangeEvent, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Pagination } from '@mui/material';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import useLikeProduct from '../../hooks/useLikeProduct';

const LIMIT = 6;

const MyFavorites = () => {
	const { t } = useTranslation('common');
	const [page, setPage] = useState<number>(1);
	const [favorites, setFavorites] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { loading, refetch: getFavoritesRefetch } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: LIMIT } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			// everything in this list is liked by the current member
			const list: Product[] = (data?.getFavorites?.list ?? []).map((item: Product) => ({
				...item,
				meLiked: [{ memberId: '', likeRefId: item._id, myFavorite: true }],
			}));
			setFavorites(list);
			setTotal(data?.getFavorites?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const likeProductHandler = useLikeProduct(() => getFavoritesRefetch({ input: { page, limit: LIMIT } }));

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{t('Favorites')}</h2>
					<p>
						{total} {t(total === 1 ? 'saved product' : 'saved products')}
					</p>
				</div>
			</div>
			{!loading && favorites.length === 0 ? (
				<div className={'fx-empty'}>
					<img src="/img/furniture/col-relax.svg" alt="" />
					<strong>{t('Nothing saved yet')}</strong>
					<span>{t('Tap the heart on any product to keep it here.')}</span>
				</div>
			) : (
				<div className={'fx-product-grid'}>
					{favorites.map((product) => (
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

export default MyFavorites;
