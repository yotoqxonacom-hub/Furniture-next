import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { productSearchLink } from '../../utils';
import { PAGE_IMAGES } from '../../pageImages';

const Promo = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'fx-section'}>
			<div className={'fx-container'}>
				<div className={'home-promo'} style={{ backgroundImage: `url(${PAGE_IMAGES.main})` }}>
					<div className={'copy'}>
						<span className={'eyebrow'}>{t('Autumn edit')}</span>
						<h2>{t('Up to 30% off warm-toned sofas')}</h2>
						<p>{t('Terracotta, mustard and walnut pieces to make the cold months cosy.')}</p>
						<Link href={productSearchLink({ typeList: ['SOFA', 'CORNER_SOFA'] }, 'productPrice')} className={'fx-btn primary'}>
							{t('Shop the edit')}
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Promo;
