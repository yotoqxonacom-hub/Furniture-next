import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { OrderPanelList } from '../../../libs/components/admin/orders/OrderList';
import { AllOrdersInquiry } from '../../../libs/types/order/order.input';
import { Order } from '../../../libs/types/order/order';
import { OrderStatus } from '../../../libs/enums/order.enum';
import { GET_ALL_ORDERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_ORDER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin } from '../../../libs/sweetAlert';
import { ALL, withLimit, withPage, withSearch } from '../../../libs/admin/inquiry';
import { formatPrice } from '../../../libs/utils';

const INITIAL_INQUIRY: AllOrdersInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC' as any, search: {} };

const TABS: string[] = [ALL, ...Object.values(OrderStatus)];

const AdminOrders: NextPage = () => {
	const [anchorEl, setAnchorEl] = useState<(HTMLElement | undefined)[]>([]);
	const [inquiry, setInquiry] = useState<AllOrdersInquiry>(INITIAL_INQUIRY);
	const statusTab: string = inquiry.search?.orderStatus ?? ALL;

	/** APOLLO REQUESTS **/
	const [updateOrderByAdmin] = useMutation(UPDATE_ORDER_BY_ADMIN);
	const { data, refetch } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onError: (err) => sweetErrorHandlingForAdmin(err).then(),
	});
	const orders: Order[] = data?.getAllOrdersByAdmin?.list ?? [];
	const total: number = data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pageRevenue = orders
		.filter((order) => order.orderStatus !== OrderStatus.CANCELLED && order.orderStatus !== OrderStatus.PENDING)
		.reduce((sum, order) => sum + order.orderTotal, 0);

	/** HANDLERS **/
	const menuIconClickHandler = (e: React.MouseEvent<HTMLElement>, index: number) => {
		const next = anchorEl.slice();
		next[index] = e.currentTarget;
		setAnchorEl(next);
	};
	const menuIconCloseHandler = () => setAnchorEl([]);

	const updateOrderHandler = async (orderId: string, orderStatus: OrderStatus) => {
		try {
			menuIconCloseHandler();
			if (orderStatus === OrderStatus.CANCELLED && !(await sweetConfirmAlert('Cancel this order and refund the buyer?')))
				return;
			await updateOrderByAdmin({ variables: { input: { orderId, orderStatus } } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Order List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={statusTab}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{TABS.map((tab) => (
									<ListItem
										key={tab}
										onClick={() => setInquiry((prev) => withSearch(prev, 'orderStatus', tab))}
										className={statusTab === tab ? 'li on' : 'li'}
									>
										{tab === ALL ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} direction={'row'} sx={{ m: '24px', gap: '24px' }}>
								<Typography variant={'subtitle1'}>
									Orders: <b>{total}</b>
								</Typography>
								<Typography variant={'subtitle1'}>
									Paid on this page: <b>{formatPrice(pageRevenue)}</b>
								</Typography>
							</Stack>
							<Divider />
						</Box>

						<OrderPanelList
							orders={orders}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateOrderHandler={updateOrderHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={total}
							rowsPerPage={inquiry.limit}
							page={inquiry.page - 1}
							onPageChange={(_: unknown, page: number) => setInquiry((prev) => withPage(prev, page))}
							onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setInquiry((prev) => withLimit(prev, parseInt(e.target.value, 10)))
							}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminOrders);
