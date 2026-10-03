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
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_NOTIFICATIONS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_NOTIFICATION_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AllNotificationsInquiry, Notification } from '../../../libs/types/notification/notification';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../../libs/enums/notification.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin } from '../../../libs/sweetAlert';
import { pageAfterRemove } from '../../../libs/admin/inquiry';
import { memberImageUrl } from '../../../libs/utils';

const TYPE_TONE: Record<NotificationType, string> = {
	[NotificationType.LIKE]: 'up',
	[NotificationType.COMMENT]: 'block',
	[NotificationType.ORDER]: 'success',
};

const targetLink = (notification: Notification) => {
	if (notification.orderId) return `/order/detail?orderId=${notification.orderId}`;
	if (notification.productId) return `/product/detail?id=${notification.productId}`;
	if (notification.articleId) return `/community/detail?id=${notification.articleId}`;
	return `/member?memberId=${notification.receiverId}`;
};

const AdminNotifications: NextPage = () => {
	const [inquiry, setInquiry] = useState<AllNotificationsInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	});
	const [statusTab, setStatusTab] = useState<string>('ALL');

	/** APOLLO REQUESTS **/
	const [removeNotificationByAdmin] = useMutation(REMOVE_NOTIFICATION_BY_ADMIN);

	const { data, refetch } = useQuery(GET_ALL_NOTIFICATIONS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onError: (err) => sweetErrorHandlingForAdmin(err).then(),
	});
	const notifications: Notification[] = data?.getAllNotificationsByAdmin?.list ?? [];
	const total: number = data?.getAllNotificationsByAdmin?.metaCounter?.[0]?.total ?? 0;
	// counted by the backend with the same type / group filters as the list
	const unreadCount: number = data?.getAllNotificationsByAdmin?.unreadCount ?? 0;

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
		updateSearch('notificationStatus', value);
	};

	const removeHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove this notification?'))) return;
			await removeNotificationByAdmin({ variables: { input: id } });
			// removed the last row of the last page -> go one page back
			const next = pageAfterRemove(inquiry, notifications.length - 1);
			if (next !== inquiry) setInquiry(next);
			else await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const tabs = [
		{ value: 'ALL', label: 'All' },
		{ value: NotificationStatus.WAIT, label: `Unread (${unreadCount})` },
		{ value: NotificationStatus.READ, label: 'Read' },
	];

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex-space'}>
				<Typography variant={'h2'}>Notifications</Typography>
				<Typography sx={{ color: '#757575' }}>{total} total</Typography>
			</Box>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<List className={'tab-menu'}>
						{tabs.map((tab) => (
							<ListItem
								key={tab.value}
								onClick={() => statusTabHandler(tab.value)}
								className={statusTab === tab.value ? 'li on' : 'li'}
							>
								{tab.label}
							</ListItem>
						))}
					</List>
					<Divider />
					<Stack className={'search-area'} direction={'row'} sx={{ m: '24px', gap: '16px' }}>
						<Select
							sx={{ width: '180px' }}
							value={inquiry.search.notificationType ?? 'ALL'}
							onChange={(e) => updateSearch('notificationType', e.target.value as string)}
						>
							<MenuItem value={'ALL'}>All types</MenuItem>
							{Object.values(NotificationType).map((type) => (
								<MenuItem key={type} value={type}>
									{type}
								</MenuItem>
							))}
						</Select>
						<Select
							sx={{ width: '180px' }}
							value={inquiry.search.notificationGroup ?? 'ALL'}
							onChange={(e) => updateSearch('notificationGroup', e.target.value as string)}
						>
							<MenuItem value={'ALL'}>All targets</MenuItem>
							{Object.values(NotificationGroup).map((group) => (
								<MenuItem key={group} value={group}>
									{group}
								</MenuItem>
							))}
						</Select>
					</Stack>
					<Divider />

					<TableContainer>
						<Table sx={{ minWidth: 850 }} size={'medium'}>
							<TableHead>
								<TableRow>
									<TableCell align="left">FROM</TableCell>
									<TableCell align="left">TO</TableCell>
									<TableCell align="left">NOTIFICATION</TableCell>
									<TableCell align="center">TYPE</TableCell>
									<TableCell align="center">TARGET</TableCell>
									<TableCell align="center">STATUS</TableCell>
									<TableCell align="left">DATE</TableCell>
									<TableCell align="right" />
								</TableRow>
							</TableHead>
							<TableBody>
								{notifications.length === 0 && (
									<TableRow>
										<TableCell align="center" colSpan={8}>
											<span className={'no-data'}>data not found!</span>
										</TableCell>
									</TableRow>
								)}
								{notifications.map((notification) => (
									<TableRow hover key={notification._id}>
										<TableCell align="left">
											<Stack direction={'row'} alignItems={'center'} sx={{ gap: '8px' }}>
												<Avatar src={memberImageUrl(notification.authorData?.memberImage)} sx={{ width: 30, height: 30 }} />
												{notification.authorData?.memberNick ?? '-'}
											</Stack>
										</TableCell>
										<TableCell align="left">
											<Stack direction={'row'} alignItems={'center'} sx={{ gap: '8px' }}>
												<Avatar
													src={memberImageUrl(notification.receiverData?.memberImage)}
													sx={{ width: 30, height: 30 }}
												/>
												{notification.receiverData?.memberNick ?? '-'}
											</Stack>
										</TableCell>
										<TableCell align="left" sx={{ maxWidth: 320 }}>
											<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{notification.notificationTitle}</Typography>
											{notification.notificationDesc && (
												<Typography sx={{ fontSize: 13, color: '#757575' }}>{notification.notificationDesc}</Typography>
											)}
										</TableCell>
										<TableCell align="center">
											<span className={`badge ${TYPE_TONE[notification.notificationType]}`}>
												{notification.notificationType}
											</span>
										</TableCell>
										<TableCell align="center">
											<Link href={targetLink(notification)} target="_blank" style={{ textDecoration: 'underline' }}>
												{notification.notificationGroup}
											</Link>
										</TableCell>
										<TableCell align="center">
											<span
												className={`badge ${notification.notificationStatus === NotificationStatus.WAIT ? 'warning' : 'success'}`}
											>
												{notification.notificationStatus === NotificationStatus.WAIT ? 'UNREAD' : 'READ'}
											</span>
										</TableCell>
										<TableCell align="left">{new Date(notification.createdAt).toLocaleString()}</TableCell>
										<TableCell align="right">
											<Button
												size="small"
												color="error"
												onClick={() => removeHandler(notification._id)}
												sx={{ minWidth: 0, p: '6px' }}
											>
												<DeleteOutlineRoundedIcon fontSize="small" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

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

export default withAdminLayout(AdminNotifications);
