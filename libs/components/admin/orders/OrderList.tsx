import React from 'react';
import Link from 'next/link';
import {
	Avatar,
	Button,
	Fade,
	Menu,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { Order } from '../../../types/order/order';
import { ORDER_STATUS_FLOW, OrderStatus } from '../../../enums/order.enum';
import { formatDate, formatPrice, imageUrl, memberImageUrl, orderNumber } from '../../../utils';

const HEAD_CELLS = ['ORDER', 'ITEMS', 'BUYER', 'SELLER', 'TOTAL', 'CITY', 'DATE', 'STATUS'];

/** admin badge class per status (scss/admin: success / warning / error / block / up) */
const STATUS_CLASS: Record<OrderStatus, string> = {
	[OrderStatus.PENDING]: 'warning',
	[OrderStatus.PAID]: 'up',
	[OrderStatus.PROCESSING]: 'block',
	[OrderStatus.SHIPPED]: 'block',
	[OrderStatus.DELIVERED]: 'success',
	[OrderStatus.CANCELLED]: 'error',
};

interface OrderPanelListProps {
	orders: Order[];
	anchorEl: (HTMLElement | undefined)[];
	menuIconClickHandler: (e: React.MouseEvent<HTMLElement>, index: number) => void;
	menuIconCloseHandler: () => void;
	updateOrderHandler: (orderId: string, orderStatus: OrderStatus) => void;
}

const PartyCell = ({ nick, image }: { nick?: string; image?: string }) => (
	<Stack direction={'row'} alignItems={'center'} gap={1}>
		<Avatar src={memberImageUrl(image)} sx={{ width: 28, height: 28 }} />
		{nick ?? '-'}
	</Stack>
);

export const OrderPanelList = (props: OrderPanelListProps) => {
	const { orders, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateOrderHandler } = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 900 }} size={'medium'}>
					<TableHead>
						<TableRow>
							{HEAD_CELLS.map((label) => (
								<TableCell key={label} align={label === 'ORDER' || label === 'ITEMS' ? 'left' : 'center'}>
									{label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={HEAD_CELLS.length}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{orders.map((order, index) => {
							const items = order.orderItems ?? [];
							const nextStatuses = ORDER_STATUS_FLOW[order.orderStatus];
							return (
								<TableRow hover key={order._id}>
									<TableCell align="left">
										<Link href={`/order/detail?orderId=${order._id}`} target="_blank" style={{ fontWeight: 700 }}>
											{orderNumber(order._id)}
										</Link>
									</TableCell>
									<TableCell align="left" className={'name'}>
										<Stack direction={'row'} alignItems={'center'} gap={1}>
											<Avatar variant="rounded" src={imageUrl(items[0]?.productImage)} sx={{ width: 36, height: 36 }} />
											<div>
												{items[0]?.productTitle}
												{items.length > 1 && <span style={{ color: '#757575' }}> +{items.length - 1}</span>}
											</div>
										</Stack>
									</TableCell>
									<TableCell align="center">
										<PartyCell nick={order.memberData?.memberNick} image={order.memberData?.memberImage} />
									</TableCell>
									<TableCell align="center">
										<PartyCell nick={order.agentData?.memberNick} image={order.agentData?.memberImage} />
									</TableCell>
									<TableCell align="center">{formatPrice(order.orderTotal)}</TableCell>
									<TableCell align="center">{order.shippingAddress?.city}</TableCell>
									<TableCell align="center">{formatDate(order.createdAt, true)}</TableCell>
									<TableCell align="center">
										{nextStatuses.length === 0 ? (
											<span className={`badge ${STATUS_CLASS[order.orderStatus]}`}>{order.orderStatus}</span>
										) : (
											<>
												<Button
													onClick={(e: any) => menuIconClickHandler(e, index)}
													className={`badge ${STATUS_CLASS[order.orderStatus]}`}
												>
													{order.orderStatus}
												</Button>
												<Menu
													className={'menu-modal'}
													anchorEl={anchorEl[index]}
													open={Boolean(anchorEl[index])}
													onClose={menuIconCloseHandler}
													TransitionComponent={Fade}
													sx={{ p: 1 }}
												>
													{nextStatuses.map((status) => (
														<MenuItem key={status} onClick={() => updateOrderHandler(order._id, status)}>
															<Typography variant={'subtitle1'} component={'span'}>
																{status}
															</Typography>
														</MenuItem>
													))}
												</Menu>
											</>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
