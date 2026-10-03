import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import ProductCard from '../common/ProductCard';
import useLikeProduct from '../../hooks/useLikeProduct';
import { productSearchLink } from '../../utils';

interface ProductSectionProps {
	eyebrow: string;
	title: string;
	desc?: string;
	sort: string;
	limit?: number;
	className?: string;
}

/** Homepage product row: trending (likes), popular (views) and top picks (rank) */
const ProductSection = ({ eyebrow, title, desc, sort, limit = 4, className = '' }: ProductSectionProps) => {
	const { t } = useTranslation('common');
	const [products, setProducts] = useState<Product[]>([]);
	const input: ProductsInquiry = { page: 1, limit, sort, direction: 'DESC' as any, search: {} };

	/** APOLLO REQUESTS **/
	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
		},
	});

	const likeProductHandler = useLikeProduct(() => getProductsRefetch({ input }));

	if (!products.length) return null;

	return (
		<section className={`fx-section ${className}`}>
			<div className={'fx-container'}>
				<div className={'fx-section-head'}>
					<div>
						<span className={'eyebrow'}>{t(eyebrow)}</span>
						<h2>{t(title)}</h2>
						{desc && <p>{t(desc)}</p>}
					</div>
					<div className={'head-actions'}>
						<Link href={productSearchLink({}, sort)} className={'fx-btn outline sm'}>
							{t('View all')}
							<EastRoundedIcon fontSize="small" />
						</Link>
					</div>
				</div>
				<div className={'fx-product-grid cols-4 fx-rail'}>
					{products.map((product) => (
						<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
					))}
				</div>
			</div>
		</section>
	);
};

export default ProductSection;
