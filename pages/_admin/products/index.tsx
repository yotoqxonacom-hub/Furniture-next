import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { ProductPanelList } from '../../../libs/components/admin/products/ProductList';
import { AllProductsInquiry } from '../../../libs/types/product/product.input';
import { Product } from '../../../libs/types/product/product';
import { ProductLocation, ProductStatus } from '../../../libs/enums/product.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin } from '../../../libs/sweetAlert';
import { ALL, pageAfterRemove, withLimit, withPage, withSearch } from '../../../libs/admin/inquiry';
import { ProductUpdate } from '../../../libs/types/product/product.update';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';

/** default list query; never mutated (helpers in libs/admin/inquiry.ts return new objects) */
const INITIAL_INQUIRY: AllProductsInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC' as any, search: {} };

const AdminProducts: NextPage = () => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [productsInquiry, setProductsInquiry] = useState<AllProductsInquiry>(INITIAL_INQUIRY);

	// tabs / selects show what is actually in the inquiry, so UI and request never disagree
	const statusTab: string = productsInquiry.search?.productStatus ?? ALL;
	const locationFilter: string = productsInquiry.search?.productLocationList?.[0] ?? ALL;

	/** APOLLO REQUESTS **/
	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	// variables change -> Apollo refetches by itself; data is read directly (no onCompleted / extra refetch)
	const { data, refetch: getAllProductsByAdminRefetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: productsInquiry },
		notifyOnNetworkStatusChange: true,
		onError: (err) => sweetErrorHandlingForAdmin(err).then(),
	});
	const products: Product[] = data?.getAllProductsByAdmin?.list ?? [];
	const productsTotal: number = data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const changePageHandler = (event: unknown, newPage: number) => setProductsInquiry((prev) => withPage(prev, newPage));

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
		setProductsInquiry((prev) => withLimit(prev, parseInt(event.target.value, 10)));

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => setAnchorEl([]);

	/** status tab: keeps the location filter, back to page 1 */
	const tabChangeHandler = (event: any, newValue: string) =>
		setProductsInquiry((prev) => withSearch(prev, 'productStatus', newValue as ProductStatus | typeof ALL));

	const searchTypeHandler = (newValue: string) =>
		setProductsInquiry((prev) =>
			withSearch(prev, 'productLocationList', newValue === ALL ? undefined : [newValue as ProductLocation]),
		);

	const removeProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeProductByAdmin({ variables: { input: id } });
				// removed the last row of the last page -> go one page back
				const next = pageAfterRemove(productsInquiry, products.length - 1);
				if (next !== productsInquiry) setProductsInquiry(next);
				else await getAllProductsByAdminRefetch({ input: productsInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const updateProductHandler = async (updateData: ProductUpdate) => {
		try {
			await updateProductByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllProductsByAdminRefetch({ input: productsInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Product List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={statusTab}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ALL')}
									value="ALL"
									className={statusTab === 'ALL' ? 'li on' : 'li'}
								>
									All
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
									value="ACTIVE"
									className={statusTab === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'SOLD')}
									value="SOLD"
									className={statusTab === 'SOLD' ? 'li on' : 'li'}
								>
									Sold
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
									value="DELETE"
									className={statusTab === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={locationFilter}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(ProductLocation).map((location: string) => (
										<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
											{location}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<ProductPanelList
							products={products}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateProductHandler={updateProductHandler}
							removeProductHandler={removeProductHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={productsTotal}
							rowsPerPage={productsInquiry?.limit}
							page={productsInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminProducts);
