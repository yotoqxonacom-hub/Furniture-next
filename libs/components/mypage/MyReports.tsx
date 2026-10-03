import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { CircularProgress, Pagination } from '@mui/material';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { GET_MY_REPORTS } from '../../../apollo/user/query';
import { Report, ReportsInquiry } from '../../types/report/report';
import { ReportGroup, reportGroupLabel, reportReasonLabel, ReportStatus } from '../../enums/report.enum';
import { T } from '../../types/common';
import { timeAgo } from '../../utils';

const LIMIT = 8;

const statusTabs: { value: ReportStatus | ''; label: string }[] = [
	{ value: '', label: 'All' },
	{ value: ReportStatus.PENDING, label: 'In review' },
	{ value: ReportStatus.RESOLVED, label: 'Resolved' },
	{ value: ReportStatus.REJECTED, label: 'Rejected' },
];

const statusInfo: Record<string, { label: string; className: string; note: string }> = {
	PENDING: { label: 'In review', className: 'pending', note: 'Our team is checking this report.' },
	RESOLVED: {
		label: 'Resolved',
		className: 'sage',
		note: 'Confirmed — the seller received a warning. Thank you!',
	},
	REJECTED: { label: 'Rejected', className: 'danger', note: 'We could not confirm a violation.' },
};

const groupIcon: Record<string, React.ReactNode> = {
	PRODUCT: <ChairOutlinedIcon />,
	MEMBER: <StorefrontOutlinedIcon />,
	ARTICLE: <ArticleOutlinedIcon />,
};

const targetHref = (report: Report) => {
	switch (report.reportGroup) {
		case ReportGroup.PRODUCT:
			return { pathname: '/product/detail', query: { id: report.reportRefId } };
		case ReportGroup.MEMBER:
			return { pathname: '/agent/detail', query: { agentId: report.reportRefId } };
		default:
			return { pathname: '/community/detail', query: { id: report.reportRefId } };
	}
};

/** My Page → reports the member has sent about products, sellers and articles */
const MyReports = () => {
	const { t } = useTranslation('common');
	const [inquiry, setInquiry] = useState<ReportsInquiry>({
		page: 1,
		limit: LIMIT,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	});
	const [reports, setReports] = useState<Report[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { loading } = useQuery(GET_MY_REPORTS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setReports(data?.getMyReports?.list ?? []);
			setTotal(data?.getMyReports?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const changeStatusHandler = (status: ReportStatus | '') => {
		setInquiry((prev) => ({ ...prev, page: 1, search: status ? { reportStatus: status } : {} }));
	};

	const current = inquiry.search.reportStatus ?? '';

	return (
		<div className={'my-section my-reports'}>
			<div className={'my-head'}>
				<div>
					<h2>{t('My reports')}</h2>
					<p>{t('Reports you sent about products, sellers and articles, and what happened to them.')}</p>
				</div>
			</div>

			<div className={'fx-chip-row'} style={{ marginBottom: 18 }}>
				{statusTabs.map((tab) => (
					<button
						key={tab.label}
						className={`fx-chip ${current === tab.value ? 'active' : ''}`}
						onClick={() => changeStatusHandler(tab.value)}
					>
						{t(tab.label)}
					</button>
				))}
			</div>

			{loading && !reports.length ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
					<CircularProgress size={28} />
				</div>
			) : reports.length === 0 ? (
				<div className={'fx-empty'}>
					<strong>{current ? t('No reports with this status') : t('You have not reported anything')}</strong>
					<span>{t('If a product or seller misbehaves, use “Report” on their page.')}</span>
				</div>
			) : (
				<div className={'report-list'}>
					{reports.map((report) => {
						const info = statusInfo[report.reportStatus] ?? statusInfo.PENDING;
						return (
							<div key={report._id} className={'report-item'}>
								<span className={'group-icon'}>{groupIcon[report.reportGroup]}</span>
								<div className={'content'}>
									<div className={'line'}>
										<span className={'fx-badge'}>{t(reportGroupLabel[report.reportGroup])}</span>
										<strong>{t(reportReasonLabel[report.reportReason])}</strong>
									</div>
									{report.reportDesc && <p>{report.reportDesc}</p>}
									<small>
										{t('Sent')} {timeAgo(report.createdAt)} · {t(info.note)}
									</small>
								</div>
								<div className={'side'}>
									<span className={`fx-badge ${info.className}`}>{t(info.label)}</span>
									<Link href={targetHref(report)} className={'open-link'}>
										{t('Open')}
										<OpenInNewRoundedIcon />
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{total > LIMIT && (
				<div className={'fx-pagination'}>
					<Pagination
						page={inquiry.page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_: ChangeEvent<unknown>, page: number) => setInquiry((prev) => ({ ...prev, page }))}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default MyReports;
