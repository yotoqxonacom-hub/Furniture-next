import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { ProductType, productTypeLabel } from '../../enums/product.enum';
import { productSearchLink } from '../../utils';

const icons: Record<string, string> = {
	SOFA: '/img/furniture/cat-sofa.svg',
	CORNER_SOFA: '/img/furniture/cat-corner-sofa.svg',
	ARMCHAIR: '/img/furniture/cat-armchair.svg',
	BED: '/img/furniture/cat-bed.svg',
	POUF: '/img/furniture/cat-pouf.svg',
	MATTRESS: '/img/furniture/cat-mattress.svg',
	KIDS: '/img/furniture/cat-kids.svg',
};

const Categories = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'fx-section home-categories'}>
			<div className={'fx-container'}>
				<div className={'fx-section-head'}>
					<div>
						<span className={'eyebrow'}>{t('Browse')}</span>
						<h2>{t('Shop by category')}</h2>
					</div>
				</div>
				<div className={'category-grid'}>
					{Object.values(ProductType).map((type) => (
						<Link key={type} href={productSearchLink({ typeList: [type] })} className={'category-item'}>
							<span className={'icon'}>
								<img src={icons[type]} alt="" />
							</span>
							<strong>{t(productTypeLabel[type])}</strong>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
};

export default Categories;
