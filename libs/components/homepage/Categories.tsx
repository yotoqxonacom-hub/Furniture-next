import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { ProductType, productTypeIcon, productTypeLabel } from '../../enums/product.enum';
import { productSearchLink } from '../../utils';

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
								<img src={productTypeIcon[type]} alt="" />
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
