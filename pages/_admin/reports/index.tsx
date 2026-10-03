import React, { useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import {
	Avatar,
	Box,
	Button,
	Divider,
	List,
	ListItem,
	Menu,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_REPORTS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_REPORT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AllReportsInquiry, Report } from '../../../libs/types/report/report';
import { ReportGroup, ReportReason, reportReasonLabel, ReportStatus } from '../../../libs/enums/report.enum';
import { T } from '../../../libs/types/common';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { memberImageUrl } from '../../../libs/utils';

const statusClass: Record<string, string> = {
	PENDING: 'badge warning',
	RESOLVED: 'badge success',
	REJECTED: 'badge error',
};

const targetLink = (report: Report) => {
	switch (report.reportGroup) {
		case ReportGroup.PRODUCT:
			return `/product/detail?id=${report.reportRefId}`;
		case ReportGroup.MEMBER:
			return `/member?memberId=${report.reportRefId}`;
		default:
			return `/community/detail?id=${report.reportRefId}`;
	}
};

const AdminReports: NextPage = () => {
	const [inquiry, setInquiry] = useState<AllReportsInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: { reportStatus: ReportStatus.PENDING },
	});
	const [reports, setReports] = useState<Report[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [statusTab, setStatusTab] = useState<string>(ReportStatus.PENDING);
	const [anchor, setAnchor] = useState<{ el: HTMLElement; report: Report } | null>(null);

	/** APOLLO REQUESTS **/
	const [updateReportByAdmin] = useMutation(UPDATE_REPORT_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_REPORTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setReports(data?.getAllReportsByAdmin?.list ?? []);
			setTotal(data?.getAllReportsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const updateSearch = (key: string, value?: string) => {
		setInquiry((prev) => {
			const search: any = { ...prev.search };
			if (value && value !== 'ALL') search[key] = value;
			else delete search[key];
			return { ...prev, page: 1, search };
		});
	};

	const statusTabHandler = (value: string) => {
		setStatusTab(value);
		updateSearch('reportStatus', value);
	};

	const changeStatusHandler = async (report: Report, status: ReportStatus) => {
		setAnchor(null);
		try {
			const message =
				status === ReportStatus.RESOLVED
					? 'Confirm this report? The responsible member will get a warning.'
					: status === ReportStatus.REJECTED
					? 'Reject this report?'
					: 'Move this report back to pending?';
			if (!(await sweetConfirmAlert(message))) return;
			await updateReportByAdmin({ variables: { input: { _id: report._id, reportStatus: status } } });
			await refetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const tabs = ['ALL', ReportStatus.PENDING, ReportStatus.RESOLVED, ReportStatus.REJECTED];

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex-space'}>
				<Typography variant={'h2'}>Reports</Typography>
				<Typography sx={{ color: '#757575' }}>Resolving a report adds a warning to the seller or author.</Typography>
			</Box>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<List className={'tab-menu'}>
						{tabs.map((tab) => (
							<ListItem key={tab} onClick={() => statusTabHandler(tab)} className={statusTab === tab ? 'li on' : 'li'}>
								{tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
								{statusTab === tab ? ` (${total})` : ''}
							</ListItem>
						))}
					</List>
					<Divider />
					<Stack className={'search-area'} direction={'row'} sx={{ m: '24px', gap: '16px' }}>
						<Select
							sx={{ width: '180px' }}
							value={inquiry.search.reportGroup ?? 'ALL'}
							onChange={(e) => updateSearch('reportGroup', e.target.value as string)}
						>
							<MenuItem value={'ALL'}>All targets</MenuItem>
							{Object.values(ReportGroup).map((group) => (
								<MenuItem key={group} value={group}>
									{group}
								</MenuItem>
							))}
						</Select>
						<Select
							sx={{ width: '220px' }}
							value={inquiry.search.reportReason ?? 'ALL'}
							onChange={(e) => updateSearch('reportReason', e.target.value as string)}
						>
							<MenuItem value={'ALL'}>All reasons</MenuItem>
							{Object.values(ReportReason).map((reason) => (
								<MenuItem key={reason} value={reason}>
									{reportReasonLabel[reason]}
								</MenuItem>
							))}
						</Select>
					</Stack>
					<Divider />

					<TableContainer>
						<Table sx={{ minWidth: 900 }} size={'medium'}>
							<TableHead>
								<TableRow>
									<TableCell align="left">REPORTER</TableCell>
									<TableCell align="center">TARGET</TableCell>
									<TableCell align="left">REASON</TableCell>
									<TableCell align="left">DETAILS</TableCell>
									<TableCell align="left">DATE</TableCell>
									<TableCell align="center">STATUS</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{reports.length === 0 && (
									<TableRow>
										<TableCell align="center" colSpan={6}>
											<span className={'no-data'}>data not found!</span>
										</TableCell>
									</TableRow>
								)}
								{reports.map((report) => (
									<TableRow hover key={report._id}>
										<TableCell align="left">
											<Stack direction={'row'} alignItems={'center'} sx={{ gap: '8px' }}>
												<Avatar src={memberImageUrl(report.memberData?.memberImage)} sx={{ width: 32, height: 32 }} />
												<div>
													<div>{report.memberData?.memberNick ?? '-'}</div>
													<div style={{ fontSize: 12, color: '#9e9e9e' }}>{report.memberData?.memberType}</div>
												</div>
											</Stack>
										</TableCell>
										<TableCell align="center">
											<Link href={targetLink(report)} target="_blank">
												<Button size="small" endIcon={<OpenInNewRoundedIcon fontSize="small" />}>
													{report.reportGroup}
												</Button>
											</Link>
										</TableCell>
										<TableCell align="left">{reportReasonLabel[report.reportReason] ?? report.reportReason}</TableCell>
										<TableCell align="left" sx={{ maxWidth: 300 }}>
											<Typography sx={{ fontSize: 13, color: '#424242', whiteSpace: 'pre-line' }}>
												{report.reportDesc || '—'}
											</Typography>
										</TableCell>
										<TableCell align="left">{new Date(report.createdAt).toLocaleString()}</TableCell>
										<TableCell align="center">
											<Button
												className={statusClass[report.reportStatus]}
												onClick={(e) => setAnchor({ el: e.currentTarget, report })}
											>
												{report.reportStatus}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					<Menu anchorEl={anchor?.el} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
						{Object.values(ReportStatus)
							.filter((status) => status !== anchor?.report.reportStatus)
							.map((status) => (
								<MenuItem key={status} onClick={() => anchor && changeStatusHandler(anchor.report, status)}>
									{status === ReportStatus.RESOLVED
										? 'Resolve (warn member)'
										: status === ReportStatus.REJECTED
										? 'Reject'
										: 'Back to pending'}
								</MenuItem>
							))}
					</Menu>

					<TablePagination
						rowsPerPageOptions={[10, 20, 40, 60]}
						component="div"
						count={total}
						rowsPerPage={inquiry.limit}
						page={inquiry.page - 1}
						onPageChange={(_, page) => setInquiry((prev) => ({ ...prev, page: page + 1 }))}
						onRowsPerPageChange={(e) =>
							setInquiry((prev) => ({ ...prev, page: 1, limit: parseInt(e.target.value, 10) }))
						}
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminReports);
