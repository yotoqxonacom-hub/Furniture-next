import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { ProductType } from '../../enums/product.enum';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { imageUrl, productSearchLink } from '../../utils';

interface Collection {
	title: string;
	desc: string;
	types: ProductType[];
	/** shown until a real product photo is loaded, or when the collection has no products yet */
	fallbackImage: string;
}

const collections: Collection[] = [
	{ title: 'Living room', desc: 'Sofas made for slow Sundays', types: [ProductType.SOFA, ProductType.CORNER_SOFA], fallbackImage: '/img/furniture/col-living.svg' },
	{ title: 'Bedroom', desc: 'Beds and mattresses for deep sleep', types: [ProductType.BED, ProductType.MATTRESS], fallbackImage: '/img/furniture/col-bedroom.svg' },
	{ title: 'Kids room', desc: 'Playful, safe and built to last', types: [ProductType.KIDS], fallbackImage: '/img/furniture/col-kids.svg' },
	{ title: 'Reading corner', desc: 'Armchairs and poufs to sink into', types: [ProductType.ARMCHAIR, ProductType.POUF], fallbackImage: '/img/furniture/col-relax.svg' },
];

/**
 * One "room" card. It shows the photo of the most liked product of that room's
 * categories and how many products the room has.
 */
const CollectionCard = ({ collection }: { collection: Collection }) => {
	const { t } = useTranslation('common');
	const [coverProduct, setCoverProduct] = useState<Product | null>(null);
	const [total, setTotal] = useState<number>(0);

	const input: ProductsInquiry = {
		page: 1,
		limit: 1,
		sort: 'productLikes',
		direction: 'DESC' as any,
		search: { typeList: collection.types },
	};

	/** APOLLO REQUESTS **/
	useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		context: { silent: true }, // decorative section: no error alert if it fails
		onCompleted: (data: T) => {
			setCoverProduct(data?.getProducts?.list?.[0] ?? null);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const cover = coverProduct?.productImages?.[0] ? imageUrl(coverProduct.productImages[0]) : collection.fallbackImage;

	return (
		<Link href={productSearchLink({ typeList: collection.types })} className={'collection-card'}>
			<img src={cover} alt={coverProduct?.productTitle ?? t(collection.title)} loading="lazy" />
			{total > 0 && (
				<span className={'count'}>
					{total} {t(total === 1 ? 'product' : 'products')}
				</span>
			)}
			<div className={'info'}>
				<div>
					<strong>{t(collection.title)}</strong>
					<span>{t(collection.desc)}</span>
				</div>
				<span className={'arrow'}>
					<EastRoundedIcon />
				</span>
			</div>
		</Link>
	);
};

const Collections = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'fx-section home-collections'}>
			<div className={'fx-container'}>
				<div className={'fx-section-head'}>
					<div>
						<span className={'eyebrow'}>{t('Collections')}</span>
						<h2>{t('Rooms we love')}</h2>
						<p>{t('Real pieces from our sellers, grouped by room.')}</p>
					</div>
				</div>
				<div className={'collection-grid fx-rail'}>
					{collections.map((collection) => (
						<CollectionCard key={collection.title} collection={collection} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Collections;
