import React, { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Pagination } from '@mui/material';
import ProductCard from '../common/ProductCard';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import useLikeProduct from '../../hooks/useLikeProduct';

const LIMIT = 6;

const MemberProducts = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const memberId = router.query.memberId as string;
	const [input, setInput] = useState<ProductsInquiry>({
		page: 1,
		limit: LIMIT,
		sort: 'createdAt',
		direction: 'DESC' as any,
		search: { memberId: '' },
	});
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { loading, refetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !input.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const likeProductHandler = useLikeProduct(() => refetch({ input }));

	/** LIFECYCLES **/
	useEffect(() => {
		if (memberId) setInput((prev) => ({ ...prev, page: 1, search: { memberId } }));
	}, [memberId]);

	return (
		<div className={'my-section'}>
			{!loading && products.length === 0 ? (
				<div className={'fx-empty'}>
					<strong>{t('No products listed yet')}</strong>
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
						page={input.page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_: ChangeEvent<unknown>, page: number) => setInput((prev) => ({ ...prev, page }))}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default MemberProducts;
