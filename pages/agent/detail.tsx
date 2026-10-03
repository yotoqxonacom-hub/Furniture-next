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
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { openChatWith } from '../../libs/chat';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddProductButton from '../../libs/components/common/AddProductButton';
import FollowButton, { isFollowed } from '../../libs/components/common/FollowButton';
import { isSameMember, MY_PRODUCTS_HREF, MY_PROFILE_HREF } from '../../libs/member';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductCard from '../../libs/components/common/ProductCard';
import ReportModal from '../../libs/components/common/ReportModal';
import { Member } from '../../libs/types/member/member';
import { Product } from '../../libs/types/product/product';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { ReportGroup } from '../../libs/enums/report.enum';
import { Message } from '../../libs/enums/common.enum';
import { GET_COMMENTS, GET_MEMBER, GET_PRODUCTS } from '../../apollo/user/query';
import { CREATE_COMMENT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { sweetErrorHandling } from '../../libs/sweetAlert';
import useLikeProduct from '../../libs/hooks/useLikeProduct';
import useLikeMember from '../../libs/hooks/useLikeMember';
import { memberImageUrl, timeAgo } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PRODUCT_LIMIT = 6;
const COMMENT_LIMIT = 5;

const AgentDetail: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [productInquiry, setProductInquiry] = useState<ProductsInquiry>({
		page: 1,
		limit: PRODUCT_LIMIT,
		sort: 'createdAt',
		direction: 'DESC' as any,
		search: { memberId: '' },
	});
	const [products, setProducts] = useState<Product[]>([]);
	const [productTotal, setProductTotal] = useState<number>(0);
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

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);

	const { loading: getMemberLoading, refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMember) setAgent(data.getMember);
		},
	});

	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: productInquiry },
		skip: !productInquiry.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setProductTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const likeProductHandler = useLikeProduct(() => getProductsRefetch({ input: productInquiry }));
	const likeMemberHandler = useLikeMember(() => getMemberRefetch({ input: agentId }));

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) {
			const id = router.query.agentId as string;
			setAgentId(id);
			setProductInquiry((prev) => ({ ...prev, page: 1, search: { memberId: id } }));
			setCommentInquiry((prev) => ({ ...prev, page: 1, search: { commentRefId: id } }));
		}
	}, [router.query.agentId]);

	/** HANDLERS **/
	const createCommentHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			if (user._id === agentId) throw new Error(t('You can not review yourself'));
			if (!commentText.trim()) return;
			await createComment({
				variables: {
					input: { commentGroup: CommentGroup.MEMBER, commentContent: commentText.trim(), commentRefId: agentId },
				},
			});
			setCommentText('');
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const productPageHandler = (_: ChangeEvent<unknown>, page: number) => {
		setProductInquiry((prev) => ({ ...prev, page }));
	};

	const commentPageHandler = (_: ChangeEvent<unknown>, page: number) => {
		setCommentInquiry((prev) => ({ ...prev, page }));
	};

	if (getMemberLoading && !agent) {
		return (
			<div className={'fx-container'} style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
				<CircularProgress />
			</div>
		);
	}

	if (!agent) return null;

	const liked = Boolean(agent?.meLiked && agent.meLiked[0]?.myFavorite);
	const isMe = isSameMember(user, agent);

	return (
		<div className={'agent-detail fx-section'}>
			<div className={'fx-container'}>
				<div className={'profile-card'}>
					<img className={'avatar'} src={memberImageUrl(agent.memberImage)} alt={agent.memberNick} />
					<div className={'info'}>
						<span className={'fx-badge sage'}>{t('Verified seller')}</span>
						<h2>{agent.memberFullName || agent.memberNick}</h2>
						<div className={'meta'}>
							{agent.memberAddress && (
								<span>
									<PlaceOutlinedIcon />
									{agent.memberAddress}
								</span>
							)}
							{agent.memberPhone && (
								<span>
									<PhoneOutlinedIcon />
									{agent.memberPhone}
								</span>
							)}
						</div>
						{agent.memberDesc && <p className={'desc'}>{agent.memberDesc}</p>}
					</div>
					<div className={'stats'}>
						<div>
							<strong>{agent.memberProducts ?? 0}</strong>
							<span>{t('products')}</span>
						</div>
						<div>
							<strong>{agent.memberLikes ?? 0}</strong>
							<span>{t('likes')}</span>
						</div>
						<div>
							<strong>{agent.memberViews ?? 0}</strong>
							<span>{t('views')}</span>
						</div>
						<div>
							<strong>{agent.memberFollowers ?? 0}</strong>
							<span>{t('followers')}</span>
						</div>
					</div>
					{isMe ? (
						/* owner view: manage your own shop */
						<div className={'actions'}>
							<AddProductButton variant={'primary'} size={'md'} />
							<Link href={MY_PRODUCTS_HREF} className={'fx-btn outline'}>
								{t('My products')}
							</Link>
							<Link href={MY_PROFILE_HREF} className={'fx-btn ghost'}>
								<EditOutlinedIcon fontSize="small" />
								{t('Edit profile')}
							</Link>
						</div>
					) : (
						/* visitor view: contact, save or report the seller */
						<div className={'actions'}>
							<button className={'fx-btn primary'} onClick={() => openChatWith(agent, () => router.push('/account/join'))}>
								<ChatBubbleOutlineRoundedIcon fontSize="small" />
								{t('Message')}
							</button>
							{/* refetch so the followers count updates */}
							<FollowButton
								memberId={agent._id}
								followed={isFollowed(agent)}
								size={'md'}
								onChange={() => getMemberRefetch({ input: agentId })}
							/>
							{agent.memberPhone && (
								<a href={`tel:${agent.memberPhone}`} className={'fx-btn outline'}>
									<PhoneOutlinedIcon fontSize="small" />
									{t('Call')}
								</a>
							)}
							<button className={`fx-btn outline ${liked ? 'liked' : ''}`} onClick={() => likeMemberHandler(user, agent._id)}>
								{liked ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderRoundedIcon fontSize="small" />}
								{liked ? t('Saved') : t('Save')}
							</button>
							<button className={'report-link'} onClick={() => setReportOpen(true)}>
								<FlagOutlinedIcon />
								{t('Report seller')}
							</button>
						</div>
					)}
				</div>

				<div className={'fx-section-head'} style={{ marginTop: 48 }}>
					<div>
						<span className={'eyebrow'}>{t('Collection')}</span>
						<h2>
							{t('Products')} ({productTotal})
						</h2>
					</div>
				</div>
				{products.length === 0 ? (
					<div className={'fx-empty'}>
						<strong>{t('No products listed yet')}</strong>
						{isMe && <span>{t('Add your first product so buyers can find it in the shop.')}</span>}
						{isMe && <AddProductButton />}
					</div>
				) : (
					<div className={'fx-product-grid'}>
						{products.map((product) => (
							<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
						))}
					</div>
				)}
				{productTotal > PRODUCT_LIMIT && (
					<div className={'fx-pagination'}>
						<Pagination
							page={productInquiry.page}
							count={Math.ceil(productTotal / PRODUCT_LIMIT)}
							onChange={productPageHandler}
							shape="circular"
						/>
					</div>
				)}

				<div className={'agent-reviews'}>
					<div className={'fx-section-head'}>
						<div>
							<span className={'eyebrow'}>{t('Reviews')}</span>
							<h2>
								{t('What customers say')} ({commentTotal})
							</h2>
						</div>
					</div>
					<div className={'reviews-layout'}>
						<div className={'review-list'}>
							{comments.length === 0 && <p className={'muted'}>{t('No reviews yet. Be the first!')}</p>}
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
								<div className={'fx-pagination'} style={{ marginTop: 18 }}>
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
						{!isMe && (
							<div className={'fx-card review-box'}>
								<h3>{t('Leave a review')}</h3>
								{user?._id ? (
									<form onSubmit={createCommentHandler}>
										<textarea
											value={commentText}
											onChange={(e) => setCommentText(e.target.value)}
											maxLength={100}
											placeholder={t('How was your experience with this seller?')}
										/>
										<button className={'fx-btn dark block'} type="submit" disabled={!commentText.trim()}>
											{t('Post review')}
										</button>
									</form>
								) : (
									<Link href={'/account/join'} className={'fx-btn outline block'}>
										{t('Login to review')}
									</Link>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<ReportModal
				open={reportOpen}
				onClose={() => setReportOpen(false)}
				reportGroup={ReportGroup.MEMBER}
				reportRefId={agent._id}
				targetName={agent.memberNick}
			/>
		</div>
	);
};

export default withLayoutBasic(AgentDetail);
