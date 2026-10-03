import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import { useTranslation } from 'next-i18next';
import { Product } from '../../types/product/product';
import { userVar } from '../../../apollo/store';
import { productTypeLabel, ProductStatus } from '../../enums/product.enum';
import { capitalize, formatPrice, imageUrl } from '../../utils';
import { topProductRank } from '../../config';
import { isAdmin } from '../../member';
import { useCartActions } from '../../hooks/useCart';

interface ProductCardProps {
	product: Product;
	likeProductHandler?: (user: any, id: string) => void;
	/** hide like button (e.g. owner view) */
	hideLike?: boolean;
	/** hide the quick "add to cart" button */
	hideCart?: boolean;
	children?: React.ReactNode;
}

const ProductCard = ({ product, likeProductHandler, hideLike = false, hideCart = false, children }: ProductCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const { addToCart } = useCartActions();
	const liked = Boolean(product?.meLiked && product?.meLiked[0]?.myFavorite);
	const canBuy =
		!hideCart &&
		product?.productStatus === ProductStatus.ACTIVE &&
		(product?.productStock ?? 1) > 0 &&
		product?.memberId !== user?._id &&
		!isAdmin(user);

	/** HANDLERS **/
	const pushDetailHandler = async () => {
		await router.push({ pathname: '/product/detail', query: { id: product._id } });
	};

	return (
		<article className={'fx-product-card'}>
			<div className={'media'} onClick={pushDetailHandler}>
				<img src={imageUrl(product?.productImages?.[0])} alt={product?.productTitle} loading="lazy" />
				<div className={'tags'}>
					{product?.productRank >= topProductRank && <span className={'fx-badge clay'}>{t('Top pick')}</span>}
					{product?.productBarter && <span className={'fx-badge sage'}>{t('Barter')}</span>}
					{product?.productStatus === ProductStatus.SOLD && <span className={'fx-badge dark'}>{t('Sold')}</span>}
				</div>
				{!hideLike && likeProductHandler && (
					<button
						className={`fx-icon-btn like-btn ${liked ? 'liked' : ''}`}
						aria-label={'Like'}
						onClick={(e) => {
							e.stopPropagation();
							likeProductHandler(user, product._id);
						}}
					>
						{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					</button>
				)}
				{canBuy && (
					<button
						className={'fx-icon-btn cart-quick'}
						aria-label={t('Add to cart')}
						title={t('Add to cart')}
						onClick={(e) => {
							e.stopPropagation();
							addToCart(product._id).then();
						}}
					>
						<AddShoppingCartRoundedIcon />
					</button>
				)}
			</div>
			<div className={'body'}>
				<span className={'type'}>{t(productTypeLabel[product?.productType] ?? capitalize(product?.productType))}</span>
				<strong className={'title'} onClick={pushDetailHandler}>
					{product?.productTitle}
				</strong>
				<span className={'location'}>
					<PlaceOutlinedIcon />
					{t(capitalize(product?.productLocation))}
					{product?.productAddress ? `, ${product.productAddress}` : ''}
				</span>
				<div className={'specs'}>
					<span>
						<EventSeatOutlinedIcon />
						{product?.productBeds} {t('seats')}
					</span>
					<span>
						<WidgetsOutlinedIcon />
						{product?.productRooms} {t('pcs')}
					</span>
					<span>
						<StraightenOutlinedIcon />
						{product?.productSquare} {t('cm')}
					</span>
				</div>
				<div className={'foot'}>
					<span className={'price'}>{formatPrice(product?.productPrice)}</span>
					<div className={'stats'}>
						<span>
							<RemoveRedEyeOutlinedIcon />
							{product?.productViews ?? 0}
						</span>
						<span>
							<FavoriteBorderRoundedIcon />
							{product?.productLikes ?? 0}
						</span>
					</div>
				</div>
				{children}
			</div>
		</article>
	);
};

export default ProductCard;
