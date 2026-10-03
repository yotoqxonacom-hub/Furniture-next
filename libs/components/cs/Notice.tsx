import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { CircularProgress, Pagination } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Notice as NoticeType } from '../../types/notice/notice';
import { NoticeCategory } from '../../enums/notice.enum';

interface NoticeProps {
	category?: NoticeCategory;
}

const LIMIT = 10;

/** Announcement list (NOTICE) — also used for TERMS with a document-like look */
const Notice = ({ category = NoticeCategory.NOTICE }: NoticeProps) => {
	const { t } = useTranslation('common');
	const [page, setPage] = useState<number>(1);
	const [openId, setOpenId] = useState<string>('');
	const isTerms = category === NoticeCategory.TERMS;

	/** APOLLO REQUESTS **/
	// read `data` directly: onCompleted does not fire for cache hits with cache-and-network
	const { data, loading } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: isTerms ? 1 : page,
				limit: isTerms ? 100 : LIMIT,
				sort: 'createdAt',
				direction: isTerms ? 'ASC' : 'DESC',
				search: { noticeCategory: category },
			},
		},
		notifyOnNetworkStatusChange: true,
	});
	const notices: NoticeType[] = data?.getNotices?.list ?? [];
	const total: number = data?.getNotices?.metaCounter?.[0]?.total ?? 0;

	if (loading && !notices.length) {
		return (
			<div className={'cs-loading'}>
				<CircularProgress size={28} />
			</div>
		);
	}

	if (!notices.length) {
		return (
			<div className={'fx-empty'}>
				<strong>{isTerms ? t('Terms will be published soon') : t('No announcements right now')}</strong>
			</div>
		);
	}

	if (isTerms) {
		return (
			<div className={'cs-terms fx-card'}>
				{notices.map((notice, index) => (
					<section key={notice._id}>
						<h3>
							{index + 1}. {notice.noticeTitle}
						</h3>
						<p>{notice.noticeContent}</p>
					</section>
				))}
			</div>
		);
	}

	return (
		<div className={'cs-notice'}>
			<div className={'notice-list'}>
				{notices.map((notice, index) => {
					const open = openId === notice._id;
					const isNew = Date.now() - new Date(notice.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7;
					return (
						<div key={notice._id} className={`notice-item ${open ? 'open' : ''}`}>
							<button className={'notice-row'} onClick={() => setOpenId(open ? '' : notice._id)} aria-expanded={open}>
								<span className={'num'}>{total - ((page - 1) * LIMIT + index)}</span>
								<span className={'title'}>
									{isNew && <span className={'fx-badge clay'}>{t('New')}</span>}
									{notice.noticeTitle}
								</span>
								<span className={'date'}>{new Date(notice.createdAt).toLocaleDateString()}</span>
								<KeyboardArrowDownRoundedIcon className={'toggle'} />
							</button>
							{open && <div className={'notice-body'}>{notice.noticeContent}</div>}
						</div>
					);
				})}
			</div>
			{total > LIMIT && (
				<div className={'fx-pagination'}>
					<Pagination page={page} count={Math.ceil(total / LIMIT)} onChange={(_, p) => setPage(p)} shape="circular" />
				</div>
			)}
		</div>
	);
};

export default Notice;
