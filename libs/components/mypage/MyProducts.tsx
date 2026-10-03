import React, { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Pagination } from '@mui/material';
import ListingCard from './ListingCard';
import AddProductButton from '../common/AddProductButton';
import { Product } from '../../types/product/product';
import { AgentProductsInquiry } from '../../types/product/product.input';
import { ProductStatus } from '../../enums/product.enum';
import { GET_AGENT_PRODUCTS } from '../../../apollo/user/query';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { capitalize } from '../../utils';

const LIMIT = 6;

const MyProducts = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<AgentProductsInquiry>({
		page: 1,
		limit: LIMIT,
		sort: 'createdAt',
		direction: 'DESC' as any,
		search: { productStatus: ProductStatus.ACTIVE },
	});
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const { loading, refetch: getAgentProductsRefetch } = useQuery(GET_AGENT_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAgentProducts?.list ?? []);
			setTotal(data?.getAgentProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (user?._id && user.memberType !== 'AGENT') router.replace('/mypage?category=myProfile').then();
	}, [user?._id, user?.memberType]);

	/** HANDLERS **/
	const changeStatusHandler = (status: ProductStatus) => {
		setSearchFilter((prev) => ({ ...prev, page: 1, search: { productStatus: status } }));
	};

	const updateProductHandler = async (status: ProductStatus, id: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Change status to') + ` ${t(capitalize(status))}?`))) return;
			await updateProduct({ variables: { input: { _id: id, productStatus: status } } });
			await getAgentProductsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert(t('Updated'), 800);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const deleteProductHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Delete this product?')))) return;
			await updateProduct({ variables: { input: { _id: id, productStatus: ProductStatus.DELETE } } });
			await getAgentProductsRefetch({ input: searchFilter });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const statuses = [ProductStatus.ACTIVE, ProductStatus.SOLD, ProductStatus.DELETE];

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{t('My products')}</h2>
					<p>{t('Manage your listings, mark items as sold or edit details.')}</p>
				</div>
				<AddProductButton />
			</div>

			<div className={'fx-chip-row'} style={{ marginBottom: 18 }}>
				{statuses.map((status) => (
					<button
						key={status}
						className={`fx-chip ${searchFilter.search.productStatus === status ? 'active' : ''}`}
						onClick={() => changeStatusHandler(status)}
					>
						{t(capitalize(status))}
					</button>
				))}
			</div>

			{!loading && products.length === 0 ? (
				<div className={'fx-empty'}>
					<img src="/img/furniture/placeholder.svg" alt="" />
					<strong>{t('No products here yet')}</strong>
				</div>
			) : (
				<div className={'listing-list'}>
					{products.map((product) => (
						<ListingCard
							key={product._id}
							product={product}
							editable
							updateProductHandler={updateProductHandler}
							deleteProductHandler={deleteProductHandler}
						/>
					))}
				</div>
			)}

			{total > LIMIT && (
				<div className={'fx-pagination'}>
					<Pagination
						page={searchFilter.page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_: ChangeEvent<unknown>, page: number) => setSearchFilter((prev) => ({ ...prev, page }))}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default MyProducts;
