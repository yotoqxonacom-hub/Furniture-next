import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { ProductLocation, ProductType, productTypeLabel } from '../../enums/product.enum';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { capitalize, formatPrice, imageUrl, productSearchLink } from '../../utils';
import { PAGE_IMAGES } from '../../pageImages';
import { canSeeAddProduct } from '../../member';
import AddProductButton from '../common/AddProductButton';

/**
 * Home hero drawn like a furniture spec sheet: a drafting grid behind the copy and,
 * on the room photo, a dimension line over the sofa plus a hotspot that points to a real
 * corner sofa from the shop (most liked one: title, width, price).
 *
 * Coordinates are in the photo's own pixels (mainpage.jpg is 695 × 434),
 * so the SVG overlay stays glued to the sofa at every screen size.
 */
const PHOTO = { w: 695, h: 434 };
const SOFA_BACK = { x1: 132, x2: 577, y: 160 }; // top of the sofa back, left arm to right arm
const HOTSPOT = { x: 243, y: 226 }; // sofa seat
const LEADER_END = { x: 190, y: 350 }; // where the line meets the spec tag

const FEATURED_INPUT: ProductsInquiry = {
	page: 1,
	limit: 1,
	sort: 'productLikes',
	direction: 'DESC' as any,
	search: { typeList: [ProductType.CORNER_SOFA] },
};

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

const HomeHero = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [type, setType] = useState<string>('');
	const [location, setLocation] = useState<string>('');
	const [text, setText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const { data } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: FEATURED_INPUT },
		context: { silent: true }, // decorative: the hero works without it
	});
	const featured: Product | undefined = data?.getProducts?.list?.[0];
	const cornerSofaCount: number = data?.getProducts?.metaCounter?.[0]?.total ?? 0;
	const categoryHref = productSearchLink({ typeList: [ProductType.CORNER_SOFA] });

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
					<h1>{t('Measure twice. Love it for years.')}</h1>
					<p>
						{t(
							'Discover sofas, beds and armchairs from independent makers and trusted stores across Korea — delivered and assembled.',
						)}
					</p>

					<form className={'hero-search'} onSubmit={searchHandler}>
						<label className={'field'}>
							<span>{t('Category')}</span>
							<select value={type} onChange={(e) => setType(e.target.value)}>
								<option value="">{t('All furniture')}</option>
								{Object.values(ProductType).map((value) => (
									<option key={value} value={value}>
										{t(productTypeLabel[value])}
									</option>
								))}
							</select>
						</label>
						<label className={'field'}>
							<span>{t('City')}</span>
							<select value={location} onChange={(e) => setLocation(e.target.value)}>
								<option value="">{t('Anywhere')}</option>
								{Object.values(ProductLocation).map((value) => (
									<option key={value} value={value}>
										{t(capitalize(value))}
									</option>
								))}
							</select>
						</label>
						<label className={'field grow'}>
							<span>{t('Keyword')}</span>
							<input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Velvet sofa, oak bed…')} />
						</label>
						<button type="submit" className={'search-btn'} aria-label={t('Search')}>
							<SearchRoundedIcon />
							<span>{t('Search')}</span>
						</button>
					</form>

					{canSeeAddProduct(user) && (
						<div className={'hero-sell'}>
							<span>{t('Have furniture to sell?')}</span>
							<AddProductButton variant={'outline'} />
						</div>
					)}
				</div>

				<figure className={'hero-stage'}>
					<div className={'photo'}>
						<img src={PAGE_IMAGES.main} alt={t('Living room with a beige corner sofa')} />

						<svg className={'spec-lines'} viewBox={`0 0 ${PHOTO.w} ${PHOTO.h}`} aria-hidden="true">
							<g className={'dimension'}>
								<line className={'draw'} x1={SOFA_BACK.x1} y1={SOFA_BACK.y} x2={SOFA_BACK.x2} y2={SOFA_BACK.y} />
								<line className={'tick'} x1={SOFA_BACK.x1} y1={SOFA_BACK.y - 9} x2={SOFA_BACK.x1} y2={SOFA_BACK.y + 9} />
								<line className={'tick'} x1={SOFA_BACK.x2} y1={SOFA_BACK.y - 9} x2={SOFA_BACK.x2} y2={SOFA_BACK.y + 9} />
							</g>
							<line className={'leader'} x1={HOTSPOT.x} y1={HOTSPOT.y} x2={LEADER_END.x} y2={LEADER_END.y} />
						</svg>

						{featured?.productSquare ? (
							<span
								className={'dimension-label'}
								style={{ left: pct((SOFA_BACK.x1 + SOFA_BACK.x2) / 2, PHOTO.w), top: pct(SOFA_BACK.y, PHOTO.h) }}
							>
								{featured.productSquare} {t('cm')}
							</span>
						) : null}

						<Link
							href={categoryHref}
							className={'hotspot'}
							style={{ left: pct(HOTSPOT.x, PHOTO.w), top: pct(HOTSPOT.y, PHOTO.h) }}
							aria-label={t('Shop corner sofas')}
						/>
					</div>

					<figcaption className={'spec-tag'}>
						{featured ? (
							<Link href={{ pathname: '/product/detail', query: { id: featured._id } }} className={'tag-product'}>
								<img src={imageUrl(featured.productImages?.[0])} alt="" />
								<span className={'tag-text'}>
									<small>{t('Similar in the shop')}</small>
									<strong>{featured.productTitle}</strong>
									<span className={'tag-meta'}>
										{formatPrice(featured.productPrice)}, {featured.productSquare} {t('cm wide')}
									</span>
								</span>
							</Link>
						) : (
							<span className={'tag-text'}>
								<small>{t('In this room')}</small>
								<strong>{t('Corner sofa')}</strong>
							</span>
						)}
						<Link href={categoryHref} className={'tag-link'}>
							{cornerSofaCount > 0
								? t('See all {{count}} corner sofas', { count: cornerSofaCount })
								: t('Shop corner sofas')}
						</Link>
					</figcaption>
				</figure>
			</div>
		</section>
	);
};

export default HomeHero;
