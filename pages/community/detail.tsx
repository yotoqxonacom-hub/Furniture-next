import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CircularProgress, Pagination } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ReportModal from '../../libs/components/common/ReportModal';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Comment } from '../../libs/types/comment/comment';
import { CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { ReportGroup } from '../../libs/enums/report.enum';
import { Message } from '../../libs/enums/common.enum';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import FollowButton, { isFollowed } from '../../libs/components/common/FollowButton';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { capitalize, imageUrl, memberImageUrl, timeAgo } from '../../libs/utils';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), {
	ssr: false,
}) as React.ComponentType<{ markdown?: string; className?: string }>;

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const COMMENT_LIMIT = 5;

const CommunityDetail: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const articleId = router.query?.id as string;
	const [boardArticle, setBoardArticle] = useState<BoardArticle | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [comment, setComment] = useState<string>('');
	const [editingId, setEditingId] = useState<string>('');
	const [editingText, setEditingText] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [reportOpen, setReportOpen] = useState<boolean>(false);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		page: 1,
		limit: COMMENT_LIMIT,
		sort: 'createdAt',
		direction: 'DESC' as any,
		search: { commentRefId: '' },
	});

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const { loading: articleLoading, refetch: boardArticleRefetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { input: articleId },
		skip: !articleId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setBoardArticle(data?.getBoardArticle ?? null),
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		skip: !searchFilter.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) setSearchFilter((prev) => ({ ...prev, page: 1, search: { commentRefId: articleId } }));
	}, [articleId]);

	/** HANDLERS **/
	const likeHandler = async () => {
		try {
			if (likeLoading || !articleId) return;
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			setLikeLoading(true);
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await boardArticleRefetch({ input: articleId });
			await sweetTopSmallSuccessAlert(t('Saved'), 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};

	const createCommentHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!comment.trim()) return;
		try {
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			await createComment({
				variables: {
					input: { commentGroup: CommentGroup.ARTICLE, commentRefId: articleId, commentContent: comment.trim() },
				},
			});
			setComment('');
			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ input: articleId });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const saveEditHandler = async (commentId: string) => {
		try {
			if (!editingText.trim()) return;
			await updateComment({ variables: { input: { _id: commentId, commentContent: editingText.trim() } } });
			setEditingId('');
			setEditingText('');
			await getCommentsRefetch({ input: searchFilter });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const deleteCommentHandler = async (commentId: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Delete this comment?')))) return;
			await updateComment({ variables: { input: { _id: commentId, commentStatus: CommentStatus.DELETE } } });
			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ input: articleId });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const goMemberPage = async (id?: string) => {
		if (!id) return;
		if (id === user?._id) await router.push('/mypage');
		else await router.push(`/member?memberId=${id}`);
	};

	if (articleLoading && !boardArticle) {
		return (
			<div className={'fx-container'} style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
				<CircularProgress />
			</div>
		);
	}

	if (!boardArticle) return null;

	const liked = Boolean(boardArticle?.meLiked && boardArticle.meLiked[0]?.myFavorite);
	const isAuthor = user?._id && user._id === boardArticle?.memberData?._id;

	return (
		<div className={'article-page fx-section'}>
			<div className={'fx-container narrow'}>
				<Link href={`/community?articleCategory=${boardArticle.articleCategory}`} className={'back-link'}>
					<ArrowBackRoundedIcon fontSize="small" />
					{t('Back to')} {t(capitalize(boardArticle.articleCategory))}
				</Link>

				<header className={'article-head'}>
					<span className={'fx-badge clay'}>{t(capitalize(boardArticle.articleCategory))}</span>
					<h1>{boardArticle.articleTitle}</h1>
					<div className={'byline'}>
						<img
							src={memberImageUrl(boardArticle.memberData?.memberImage)}
							alt=""
							onClick={() => goMemberPage(boardArticle.memberData?._id)}
						/>
						<div>
							<strong onClick={() => goMemberPage(boardArticle.memberData?._id)}>
								{boardArticle.memberData?.memberNick}
							</strong>
							<span>{timeAgo(boardArticle.createdAt)}</span>
						</div>
						<FollowButton
							memberId={boardArticle.memberData?._id ?? ''}
							followed={isFollowed(boardArticle.memberData)}
							className={'byline-follow'}
						/>
						<div className={'counts'}>
							<span>
								<RemoveRedEyeOutlinedIcon />
								{boardArticle.articleViews}
							</span>
							<span>
								<ChatBubbleOutlineRoundedIcon />
								{boardArticle.articleComments}
							</span>
						</div>
					</div>
				</header>

				{boardArticle.articleImage && (
					<div className={'article-cover'}>
						<img src={imageUrl(boardArticle.articleImage)} alt="" />
					</div>
				)}

				<ToastViewerComponent markdown={boardArticle.articleContent} />

				<div className={'article-actions'}>
					<button className={`fx-btn outline ${liked ? 'liked' : ''}`} onClick={likeHandler}>
						{liked ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderRoundedIcon fontSize="small" />}
						{boardArticle.articleLikes} {t('likes')}
					</button>
					{!isAuthor && (
						<button className={'report-link'} onClick={() => setReportOpen(true)}>
							<FlagOutlinedIcon />
							{t('Report article')}
						</button>
					)}
				</div>

				<section className={'article-comments'}>
					<h2>
						{t('Comments')} ({total})
					</h2>
					{user?._id ? (
						<form className={'comment-form'} onSubmit={createCommentHandler}>
							<img src={memberImageUrl(user.memberImage)} alt="" />
							<div className={'field'}>
								<textarea
									value={comment}
									maxLength={100}
									onChange={(e) => setComment(e.target.value)}
									placeholder={t('Add a comment…')}
								/>
								<div className={'row'}>
									<span>{comment.length}/100</span>
									<button className={'fx-btn dark sm'} type="submit" disabled={!comment.trim()}>
										{t('Comment')}
									</button>
								</div>
							</div>
						</form>
					) : (
						<p className={'muted'} style={{ marginBottom: 16 }}>
							<Link href={'/account/join'} style={{ color: '#b8653e', fontWeight: 700 }}>
								{t('Login')}
							</Link>{' '}
							{t('to join the discussion.')}
						</p>
					)}

					{comments.map((item) => {
						const mine = item.memberId === user?._id;
						const editing = editingId === item._id;
						return (
							<div key={item._id} className={'review'}>
								<img src={memberImageUrl(item.memberData?.memberImage)} alt="" />
								<div style={{ flex: 1, minWidth: 0 }}>
									<strong>{item.memberData?.memberNick}</strong>
									<small>{timeAgo(item.createdAt)}</small>
									{editing ? (
										<div className={'edit-box'}>
											<textarea
												value={editingText}
												maxLength={100}
												onChange={(e) => setEditingText(e.target.value)}
											/>
											<div className={'row'}>
												<button className={'fx-btn ghost sm'} onClick={() => setEditingId('')}>
													{t('Cancel')}
												</button>
												<button className={'fx-btn dark sm'} onClick={() => saveEditHandler(item._id)}>
													{t('Save')}
												</button>
											</div>
										</div>
									) : (
										<p>{item.commentContent}</p>
									)}
									{mine && !editing && (
										<div className={'comment-tools'}>
											<button
												onClick={() => {
													setEditingId(item._id);
													setEditingText(item.commentContent);
												}}
											>
												{t('Edit')}
											</button>
											<button onClick={() => deleteCommentHandler(item._id)}>{t('Delete')}</button>
										</div>
									)}
								</div>
							</div>
						);
					})}

					{total > COMMENT_LIMIT && (
						<div className={'fx-pagination'}>
							<Pagination
								page={searchFilter.page}
								count={Math.ceil(total / COMMENT_LIMIT)}
								onChange={(_: ChangeEvent<unknown>, page: number) => setSearchFilter((prev) => ({ ...prev, page }))}
								shape="circular"
								size="small"
							/>
						</div>
					)}
				</section>
			</div>

			<ReportModal
				open={reportOpen}
				onClose={() => setReportOpen(false)}
				reportGroup={ReportGroup.ARTICLE}
				reportRefId={boardArticle._id}
				targetName={boardArticle.articleTitle}
			/>
		</div>
	);
};

export default withLayoutBasic(CommunityDetail);
