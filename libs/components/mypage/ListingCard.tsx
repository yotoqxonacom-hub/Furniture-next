import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Menu, MenuItem } from '@mui/material';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Product } from '../../types/product/product';
import { ProductStatus, productTypeLabel } from '../../enums/product.enum';
import { capitalize, formatPrice, imageUrl } from '../../utils';

interface ListingCardProps {
	product: Product;
	/** owner view shows status controls; member page view is read-only */
	editable?: boolean;
	updateProductHandler?: (status: ProductStatus, id: string) => void;
	deleteProductHandler?: (id: string) => void;
}

/** Row-style card used in "My products" and on member pages */
const ListingCard = ({ product, editable = false, updateProductHandler, deleteProductHandler }: ListingCardProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	/** HANDLERS **/
	const openDetail = async () => {
		await router.push({ pathname: '/product/detail', query: { id: product._id } });
	};

	const openEdit = async () => {
		await router.push({ pathname: '/mypage', query: { category: 'addProduct', productId: product._id } });
	};

	const statusClass =
		product.productStatus === ProductStatus.ACTIVE ? 'sage' : product.productStatus === ProductStatus.SOLD ? 'dark' : 'danger';

	return (
		<div className={'listing-card'}>
			<div className={'thumb'} onClick={openDetail}>
				<img src={imageUrl(product.productImages?.[0])} alt={product.productTitle} />
			</div>
			<div className={'main'} onClick={openDetail}>
				<span className={'type'}>{t(productTypeLabel[product.productType])}</span>
				<strong>{product.productTitle}</strong>
				<span className={'address'}>
					{t(capitalize(product.productLocation))}, {product.productAddress}
				</span>
			</div>
			<div className={'price'}>{formatPrice(product.productPrice)}</div>
			<div className={'meta'}>
				<span>
					<RemoveRedEyeOutlinedIcon />
					{product.productViews}
				</span>
				<span>
					<FavoriteBorderRoundedIcon />
					{product.productLikes}
				</span>
				<small>{new Date(product.createdAt).toLocaleDateString()}</small>
			</div>
			{editable ? (
				<div className={'controls'}>
					<button
						className={`fx-badge ${statusClass} status-btn`}
						onClick={(e) => product.productStatus !== ProductStatus.DELETE && setAnchorEl(e.currentTarget)}
					>
						{t(capitalize(product.productStatus))}
					</button>
					{product.productStatus === ProductStatus.ACTIVE && (
						<button className={'fx-icon-btn'} onClick={openEdit} aria-label={'Edit'}>
							<EditOutlinedIcon />
						</button>
					)}
					<button className={'fx-icon-btn'} onClick={(e) => setAnchorEl(e.currentTarget)} aria-label={'More'}>
						<MoreHorizRoundedIcon />
					</button>
					<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
						{product.productStatus !== ProductStatus.ACTIVE && (
							<MenuItem
								onClick={() => {
									setAnchorEl(null);
									updateProductHandler && updateProductHandler(ProductStatus.ACTIVE, product._id);
								}}
							>
								{t('Mark as active')}
							</MenuItem>
						)}
						{product.productStatus === ProductStatus.ACTIVE && (
							<MenuItem
								onClick={() => {
									setAnchorEl(null);
									updateProductHandler && updateProductHandler(ProductStatus.SOLD, product._id);
								}}
							>
								{t('Mark as sold')}
							</MenuItem>
						)}
						{product.productStatus !== ProductStatus.DELETE && (
							<MenuItem
								sx={{ color: '#c0392b' }}
								onClick={() => {
									setAnchorEl(null);
									deleteProductHandler && deleteProductHandler(product._id);
								}}
							>
								{t('Delete')}
							</MenuItem>
						)}
					</Menu>
				</div>
			) : (
				<div className={'controls'}>
					<span className={`fx-badge ${statusClass}`}>{t(capitalize(product.productStatus))}</span>
				</div>
			)}
		</div>
	);
};

export default ListingCard;
