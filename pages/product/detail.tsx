import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CircularProgress, Pagination } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import QuantityStepper from '../../libs/components/common/QuantityStepper';
import { useCartActions } from '../../libs/hooks/useCart';
import { isAdmin } from '../../libs/member';
import { ORDER_RULES } from '../../libs/config';
import { openChatWith } from '../../libs/chat';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ProductCard from '../../libs/components/common/ProductCard';
import ReportModal from '../../libs/components/common/ReportModal';
import { Product } from '../../libs/types/product/product';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { ReportGroup } from '../../libs/enums/report.enum';
import { productTypeLabel, ProductStatus } from '../../libs/enums/product.enum';
import { GET_COMMENTS, GET_PRODUCT, GET_PRODUCTS } from '../../apollo/user/query';
import FollowButton, { isFollowed } from '../../libs/components/common/FollowButton';
import { CREATE_COMMENT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import useLikeProduct from '../../libs/hooks/useLikeProduct';
import { capitalize, formatPrice, imageUrl, memberImageUrl, productSearchLink, timeAgo } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const COMMENT_LIMIT = 5;

const ProductDetail: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [productId, setProductId] = useState<string | null>(null);
	const [product, setProduct] = useState<Product | null>(null);
	const [activeImage, setActiveImage] = useState<string>('');
	const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>({
		page: 1,
		limit: COMMENT_LIMIT,
		sort: 'createdAt',
		direction: 'DESC' as any,
		search: { commentRefId: '' },
	});
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [commentText, setCommentText] = useState<string>('');
	const [reportOpen, setReportOpen] = useState<boolean>(false);
	const [quantity, setQuantity] = useState<number>(1);
	const [adding, setAdding] = useState<boolean>(false);
	const { addToCart, setExactQuantity } = useCartActions();

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);

	const { loading: getProductLoading, refetch: getProductRefetch } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProduct) {
				setProduct(data.getProduct);
				setActiveImage((prev) => (data.getProduct.productImages?.includes(prev) ? prev : data.getProduct.productImages?.[0]));
			}
		},
	});

	const similarInput = {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: product?.productType ? { typeList: [product.productType] } : {},
	};

	const { refetch: getSimilarRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: similarInput },
		skip: !product,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const list: Product[] = data?.getProducts?.list ?? [];
			setSimilarProducts(list.filter((item) => item._id !== product?._id).slice(0, 4));
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const likeProductHandler = useLikeProduct(async () => {
		await getProductRefetch({ input: productId });
		await getSimilarRefetch({ input: similarInput });
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			const id = router.query.id as string;
			setProductId(id);
			setCommentInquiry((prev) => ({ ...prev, page: 1, search: { commentRefId: id } }));
			setQuantity(1);
		}
	}, [router.query.id]);

	/** HANDLERS **/
	const createCommentHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			if (!commentText.trim()) return;
			const input: CommentInput = {
				commentGroup: CommentGroup.PRODUCT,
				commentContent: commentText.trim(),
				commentRefId: productId as string,
			};
			await createComment({ variables: { input } });
			setCommentText('');
			await getCommentsRefetch({ input: commentInquiry });
			await getProductRefetch({ input: productId });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const commentPageHandler = (_: ChangeEvent<unknown>, page: number) => {
		setCommentInquiry((prev) => ({ ...prev, page }));
	};

	const addToCartHandler = async (thenCheckout: boolean) => {
		if (!product) return;
		setAdding(true);
		// "Buy now" puts exactly this quantity in the cart and opens checkout with only this product
		const added = thenCheckout ? await setExactQuantity(product._id, quantity) : await addToCart(product._id, quantity);
		setAdding(false);
		if (added && thenCheckout) await router.push({ pathname: '/order/checkout', query: { items: product._id } });
	};

	const shareHandler = async () => {
		try {
			const url = window.location.href;
			if (navigator.share) await navigator.share({ title: product?.productTitle, url });
			else {
				await navigator.clipboard.writeText(url);
				await sweetTopSmallSuccessAlert(t('Link copied'), 1000);
			}
		} catch (err) {
			// user closed the share sheet
		}
	};

	if (getProductLoading && !product) {
		return (
			<div className={'fx-container'} style={{ display: 'flex', justifyContent: 'center', padding: '200px 0' }}>
				<CircularProgress />
			</div>
		);
	}

	if (!product) {
		return (
			<div className={'fx-container'} style={{ paddingTop: 140 }}>
				<div className={'fx-empty'}>
					<img src="/img/furniture/placeholder.svg" alt="" />
					<strong>{t('This product is not available')}</strong>
					<Link href={'/product'} className={'fx-btn outline sm'}>
						{t('Back to shop')}
					</Link>
				</div>
			</div>
		);
	}

	const liked = Boolean(product?.meLiked && product?.meLiked[0]?.myFavorite);
	const seller = product?.memberData;
	const isOwner = user?._id && user._id === product.memberId;
	const images = product?.productImages?.length ? product.productImages : [''];
	const stock = product.productStock ?? 1;
	const canBuy = product.productStatus === ProductStatus.ACTIVE && stock > 0 && !isOwner && !isAdmin(user);
	const maxQuantity = Math.min(stock, ORDER_RULES.MAX_CART_QUANTITY);

	return (
		<div className={'product-detail'}>
			<div className={'fx-container'}>
				<div className={'crumbs'}>
					<Link href={'/'}>{t('Home')}</Link>
					<span>/</span>
					<Link href={'/product'}>{t('Shop')}</Link>
					<span>/</span>
					<Link href={productSearchLink({ typeList: [product.productType] })}>
						{t(productTypeLabel[product.productType])}
					</Link>
				</div>

				<div className={'detail-top'}>
					<div className={'gallery'}>
						<div className={'main-image'}>
							<img src={imageUrl(activeImage)} alt={product.productTitle} />
							<div className={'badges'}>
								{product.productBarter && <span className={'fx-badge sage'}>{t('Barter')}</span>}
								{product.productStatus === ProductStatus.SOLD && <span className={'fx-badge dark'}>{t('Sold')}</span>}
							</div>
						</div>
						{images.length > 1 && (
							<div className={'thumbs'}>
								{images.map((image) => (
									<button
										key={image}
										className={image === activeImage ? 'active' : ''}
										onClick={() => setActiveImage(image)}
										aria-label={'Show image'}
									>
										<img src={imageUrl(image)} alt="" />
									</button>
								))}
							</div>
						)}
					</div>

					<div className={'summary'}>
						<span className={'type'}>{t(productTypeLabel[product.productType])}</span>
						<h1>{product.productTitle}</h1>
						<span className={'location'}>
							<PlaceOutlinedIcon />
							{t(capitalize(product.productLocation))}, {product.productAddress}
						</span>

						<div className={'price-row'}>
							<span className={'price'}>{formatPrice(product.productPrice)}</span>
							<div className={'actions'}>
								<button
									className={`fx-icon-btn ${liked ? 'liked' : ''}`}
									onClick={() => likeProductHandler(user, product._id)}
									aria-label={'Like'}
								>
									{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
								</button>
								<button className={'fx-icon-btn'} onClick={shareHandler} aria-label={'Share'}>
									<ShareOutlinedIcon />
								</button>
							</div>
						</div>

						<div className={'spec-grid'}>
							<div className={'spec'}>
								<EventSeatOutlinedIcon />
								<strong>{product.productBeds}</strong>
								<span>{t('seats')}</span>
							</div>
							<div className={'spec'}>
								<WidgetsOutlinedIcon />
								<strong>{product.productRooms}</strong>
								<span>{t('pieces in set')}</span>
							</div>
							<div className={'spec'}>
								<StraightenOutlinedIcon />
								<strong>{product.productSquare}</strong>
								<span>{t('cm wide')}</span>
							</div>
						</div>

						{seller && (
							<div className={'seller-box'}>
								<img src={memberImageUrl(seller.memberImage)} alt="" />
								<div className={'info'}>
									<Link href={{ pathname: '/agent/detail', query: { agentId: seller._id } }}>
										<strong>{seller.memberFullName || seller.memberNick}</strong>
									</Link>
									<span>
										{t('Seller')} · {seller.memberFollowers ?? 0} {t('followers')}
									</span>
								</div>
								<FollowButton
									memberId={seller._id}
									followed={isFollowed(seller)}
									onChange={() => getProductRefetch({ input: productId })}
								/>
							</div>
						)}

						{canBuy && (
							<div className={'buy-box'}>
								<div className={'stock'}>
									<Inventory2OutlinedIcon />
									{stock <= 3 ? t('Only {{count}} left', { count: stock }) : t('In stock')}
								</div>
								<div className={'buy-row'}>
									<QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} disabled={adding} />
									<button className={'fx-btn primary'} onClick={() => addToCartHandler(false)} disabled={adding}>
										<AddShoppingCartRoundedIcon fontSize="small" />
										{t('Add to cart')}
									</button>
									<button className={'fx-btn dark'} onClick={() => addToCartHandler(true)} disabled={adding}>
										{t('Buy now')}
									</button>
								</div>
							</div>
						)}

						<div className={'cta-row'}>
							{seller && !isOwner && (
								<button className={'fx-btn outline'} onClick={() => openChatWith(seller, () => router.push('/account/join'))}>
									<ChatBubbleOutlineRoundedIcon fontSize="small" />
									{t('Message seller')}
								</button>
							)}
							{seller?.memberPhone && (
								<a href={`tel:${seller.memberPhone}`} className={'fx-btn outline'}>
									<PhoneOutlinedIcon fontSize="small" />
									{t('Call')}
								</a>
							)}
							{seller && (
								<Link
									href={{ pathname: '/agent/detail', query: { agentId: seller._id } }}
									className={'fx-btn ghost'}
								>
									{t('Visit shop')}
								</Link>
							)}
						</div>

						{!isOwner && (
							<button className={'report-link'} onClick={() => setReportOpen(true)}>
								<FlagOutlinedIcon />
								{t('Report this product')}
							</button>
						)}
					</div>
				</div>

				<div className={'detail-body'}>
					<div>
						<h2>{t('About this piece')}</h2>
						<p className={'desc'}>{product.productDesc || t('The seller has not added a description yet.')}</p>
						<div className={'details-list'}>
							<div>
								<span>{t('Category')}</span>
								<strong>{t(productTypeLabel[product.productType])}</strong>
							</div>
							<div>
								<span>{t('City')}</span>
								<strong>{t(capitalize(product.productLocation))}</strong>
							</div>
							<div>
								<span>{t('Width')}</span>
								<strong>{product.productSquare} cm</strong>
							</div>
							<div>
								<span>{t('Seats')}</span>
								<strong>{product.productBeds}</strong>
							</div>
							<div>
								<span>{t('Pieces in set')}</span>
								<strong>{product.productRooms}</strong>
							</div>
							<div>
								<span>{t('Barter')}</span>
								<strong>{product.productBarter ? t('Yes') : t('No')}</strong>
							</div>
							<div>
								<span>{t('Made in')}</span>
								<strong>{product.constructedAt ? new Date(product.constructedAt).getFullYear() : '—'}</strong>
							</div>
							<div>
								<span>{t('Listed')}</span>
								<strong>{timeAgo(product.createdAt)}</strong>
							</div>
						</div>
					</div>

					<div className={'reviews'}>
						<h2>
							{t('Reviews')} ({commentTotal})
						</h2>
						{user?._id ? (
							<form className={'review-form'} onSubmit={createCommentHandler}>
								<textarea
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									placeholder={t('Share your experience with this piece…')}
									maxLength={100}
								/>
								<button className={'fx-btn dark sm'} type="submit" disabled={!commentText.trim()}>
									{t('Post review')}
								</button>
							</form>
						) : (
							<p style={{ marginBottom: 16, color: '#6f675e' }}>
								<Link href={'/account/join'} style={{ color: '#b8653e', fontWeight: 700 }}>
									{t('Login')}
								</Link>{' '}
								{t('to leave a review.')}
							</p>
						)}
						{comments.map((comment) => (
							<div key={comment._id} className={'review'}>
								<img src={memberImageUrl(comment.memberData?.memberImage)} alt="" />
								<div>
									<strong>{comment.memberData?.memberNick}</strong>
									<small>{timeAgo(comment.createdAt)}</small>
									<p>{comment.commentContent}</p>
								</div>
							</div>
						))}
						{commentTotal > COMMENT_LIMIT && (
							<div className={'fx-pagination'} style={{ marginTop: 20 }}>
								<Pagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / COMMENT_LIMIT)}
									onChange={commentPageHandler}
									shape="circular"
									size="small"
								/>
							</div>
						)}
					</div>
				</div>

				{similarProducts.length > 0 && (
					<div className={'similar'}>
						<div className={'fx-section-head'}>
							<div>
								<span className={'eyebrow'}>{t('You may also like')}</span>
								<h2>{t('Similar pieces')}</h2>
							</div>
						</div>
						<div className={'fx-product-grid cols-4 fx-rail'}>
							{similarProducts.map((item) => (
								<ProductCard key={item._id} product={item} likeProductHandler={likeProductHandler} />
							))}
						</div>
					</div>
				)}
			</div>

			<ReportModal
				open={reportOpen}
				onClose={() => setReportOpen(false)}
				reportGroup={ReportGroup.PRODUCT}
				reportRefId={product._id}
				targetName={product.productTitle}
			/>
		</div>
	);
};

export default withLayoutFull(ProductDetail);
