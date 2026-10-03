import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { ProductLocation, ProductType, productTypeLabel } from '../../enums/product.enum';
import { capitalize, productSearchLink } from '../../utils';
import { PAGE_IMAGES } from '../../pageImages';
import AddProductButton from '../common/AddProductButton';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { canSeeAddProduct } from '../../member';

const HomeHero = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [type, setType] = useState<string>('');
	const [location, setLocation] = useState<string>('');
	const [text, setText] = useState<string>('');

	/** HANDLERS **/
	const searchHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		const search: Record<string, any> = {};
		if (type) search.typeList = [type];
		if (location) search.locationList = [location];
		if (text.trim()) search.text = text.trim();
		await router.push(productSearchLink(search));
	};

	return (
		<section className={'home-hero'}>
			<div className={'fx-container hero-inner'}>
				<div className={'hero-copy'}>
					<span className={'eyebrow'}>{t('New season · 2026 collection')}</span>
					<h1>
						{t('Furniture that makes a house')} <em>{t('feel like home')}</em>
					</h1>
					<p>
						{t(
							'Discover sofas, beds and armchairs from independent makers and trusted stores across Korea — delivered and assembled.',
						)}
					</p>

					<form className={'hero-search'} onSubmit={searchHandler}>
						<div className={'field'}>
							<label>{t('Category')}</label>
							<select value={type} onChange={(e) => setType(e.target.value)}>
								<option value="">{t('All furniture')}</option>
								{Object.values(ProductType).map((value) => (
									<option key={value} value={value}>
										{t(productTypeLabel[value])}
									</option>
								))}
							</select>
						</div>
						<div className={'field'}>
							<label>{t('City')}</label>
							<select value={location} onChange={(e) => setLocation(e.target.value)}>
								<option value="">{t('Anywhere')}</option>
								{Object.values(ProductLocation).map((value) => (
									<option key={value} value={value}>
										{t(capitalize(value))}
									</option>
								))}
							</select>
						</div>
						<div className={'field grow'}>
							<label>{t('Keyword')}</label>
							<input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Velvet sofa, oak bed…')} />
						</div>
						<button type="submit" className={'fx-btn primary search-btn'} aria-label={t('Search')}>
							<SearchRoundedIcon />
							<span>{t('Search')}</span>
						</button>
					</form>

					<ul className={'hero-perks'}>
						<li>
							<LocalShippingOutlinedIcon />
							{t('Free delivery over $500')}
						</li>
						<li>
							<VerifiedOutlinedIcon />
							{t('Verified sellers')}
						</li>
						<li>
							<StarRoundedIcon />
							{t('4.9 average rating')}
						</li>
					</ul>

					{canSeeAddProduct(user) && (
						<div className={'hero-sell'}>
							<span>{t('Have furniture to sell?')}</span>
							<AddProductButton variant={'outline'} />
						</div>
					)}
				</div>

				<div className={'hero-art'}>
					<img src={PAGE_IMAGES.main} alt={t('Living room with a beige corner sofa')} />
					<div className={'float-card top'}>
						<span className={'fx-badge clay'}>{t('Best seller')}</span>
						<strong>{t('Oslo 3-seat sofa')}</strong>
						<small>{t('Sage linen · oak legs')}</small>
					</div>
					<div className={'float-card bottom'}>
						<div className={'avatars'}>
							<img src="/img/profile/defaultUser.svg" alt="" />
							<img src="/img/profile/defaultUser.svg" alt="" />
							<img src="/img/profile/defaultUser.svg" alt="" />
						</div>
						<div>
							<strong>12k+</strong>
							<small>{t('happy homes')}</small>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HomeHero;
