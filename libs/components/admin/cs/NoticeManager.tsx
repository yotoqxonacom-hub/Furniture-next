import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	InputAdornment,
	List,
	ListItem,
	Menu,
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../../apollo/admin/query';
import { CREATE_NOTICE, REMOVE_NOTICE, UPDATE_NOTICE } from '../../../../apollo/admin/mutation';
import { AllNoticesInquiry, Notice } from '../../../types/notice/notice';
import { NoticeCategory, NoticeStatus } from '../../../enums/notice.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { pageAfterRemove } from '../../../admin/inquiry';

interface NoticeManagerProps {
	title: string;
	/** categories this page manages; the first one is the default for new items */
	categories: NoticeCategory[];
}

interface EditState {
	_id?: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
}

const statusClass: Record<string, string> = {
	ACTIVE: 'badge success',
	HOLD: 'badge warning',
	DELETE: 'badge delete',
};

/** Admin CRUD for notices (FAQ, NOTICE, TERMS, INQUIRY) backed by the notice module */
const NoticeManager = ({ title, categories }: NoticeManagerProps) => {
	// one category -> fixed filter; several -> "All" still means only these (e.g. never FAQ on the Notice page)
	const baseSearch = categories.length === 1 ? { noticeCategory: categories[0] } : { noticeCategoryList: categories };
	const [inquiry, setInquiry] = useState<AllNoticesInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: { ...baseSearch },
	});
	const [statusTab, setStatusTab] = useState<string>('ALL');
	const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
	const [searchText, setSearchText] = useState<string>('');
	const [statusAnchor, setStatusAnchor] = useState<{ el: HTMLElement; notice: Notice } | null>(null);
	const [editing, setEditing] = useState<EditState | null>(null);

	/** APOLLO REQUESTS **/
	const [createNotice] = useMutation(CREATE_NOTICE);
	const [updateNotice] = useMutation(UPDATE_NOTICE);
	const [removeNotice] = useMutation(REMOVE_NOTICE);

	const { data, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onError: (err) => sweetErrorHandlingForAdmin(err).then(),
	});
	const notices: Notice[] = data?.getAllNoticesByAdmin?.list ?? [];
	const total: number = data?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const updateSearch = (patch: Record<string, any>) => {
		setInquiry((prev) => {
			const search: any = { ...prev.search, ...patch };
			Object.keys(search).forEach((key) => (search[key] === undefined || search[key] === '') && delete search[key]);
			return { ...prev, page: 1, search };
		});
	};

	const statusTabHandler = (value: string) => {
		setStatusTab(value);
		updateSearch({ noticeStatus: value === 'ALL' ? undefined : value });
	};

	const categoryHandler = (value: string) => {
		setCategoryFilter(value);
		updateSearch({ noticeCategory: value === 'ALL' ? undefined : value });
	};

	const searchHandler = () => updateSearch({ text: searchText.trim() || undefined });

	const openCreate = () =>
		setEditing({
			noticeCategory: categories[0],
			noticeStatus: NoticeStatus.ACTIVE,
			noticeTitle: '',
			noticeContent: '',
		});

	const openEdit = (notice: Notice) =>
		setEditing({
			_id: notice._id,
			noticeCategory: notice.noticeCategory,
			noticeStatus: notice.noticeStatus,
			noticeTitle: notice.noticeTitle,
			noticeContent: notice.noticeContent,
		});

	const saveHandler = async () => {
		if (!editing) return;
		try {
			if (editing.noticeTitle.trim().length < 3 || editing.noticeContent.trim().length < 3)
				throw new Error('Title and content must be at least 3 characters');
			const payload = {
				noticeCategory: editing.noticeCategory,
				noticeStatus: editing.noticeStatus,
				noticeTitle: editing.noticeTitle.trim(),
				noticeContent: editing.noticeContent.trim(),
			};
			if (editing._id) await updateNotice({ variables: { input: { _id: editing._id, ...payload } } });
			else await createNotice({ variables: { input: payload } });
			setEditing(null);
			await refetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Saved', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const changeStatusHandler = async (notice: Notice, status: NoticeStatus) => {
		setStatusAnchor(null);
		try {
			await updateNotice({ variables: { input: { _id: notice._id, noticeStatus: status } } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const removeHandler = async (notice: Notice) => {
		try {
			if (!(await sweetConfirmAlert('Remove permanently?'))) return;
			await removeNotice({ variables: { input: notice._id } });
			// removed the last row of the last page -> go one page back
			const next = pageAfterRemove(inquiry, notices.length - 1);
			if (next !== inquiry) setInquiry(next);
			else await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const tabs = ['ALL', NoticeStatus.ACTIVE, NoticeStatus.HOLD, NoticeStatus.DELETE];

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex-space'}>
				<Typography variant={'h2'}>{title}</Typography>
				<Button className="btn_add" variant={'contained'} size={'medium'} onClick={openCreate}>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					ADD
				</Button>
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
						{categories.length > 1 && (
							<Select
								sx={{ width: '180px' }}
								value={categoryFilter}
								onChange={(e) => categoryHandler(e.target.value as string)}
							>
								<MenuItem value={'ALL'}>All categories</MenuItem>
								{categories.map((category) => (
									<MenuItem key={category} value={category}>
										{category}
									</MenuItem>
								))}
							</Select>
						)}
						<OutlinedInput
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							sx={{ width: '100%' }}
							className={'search'}
							placeholder="Search title or content"
							onKeyDown={(event) => {
								if (event.key === 'Enter') searchHandler();
							}}
							endAdornment={
								<>
									{searchText && (
										<CancelRoundedIcon
											style={{ cursor: 'pointer' }}
											onClick={() => {
												setSearchText('');
												updateSearch({ text: undefined });
											}}
										/>
									)}
									<InputAdornment position="end" onClick={searchHandler} style={{ cursor: 'pointer' }}>
										<SearchRoundedIcon />
									</InputAdornment>
								</>
							}
						/>
					</Stack>
					<Divider />

					<TableContainer>
						<Table sx={{ minWidth: 750 }} size={'medium'}>
							<TableHead>
								<TableRow>
									<TableCell align="left">TITLE</TableCell>
									<TableCell align="left">CATEGORY</TableCell>
									<TableCell align="left">WRITER</TableCell>
									<TableCell align="left">DATE</TableCell>
									<TableCell align="center">STATUS</TableCell>
									<TableCell align="right">ACTIONS</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{notices.length === 0 && (
									<TableRow>
										<TableCell align="center" colSpan={6}>
											<span className={'no-data'}>data not found!</span>
										</TableCell>
									</TableRow>
								)}
								{notices.map((notice) => (
									<TableRow hover key={notice._id}>
										<TableCell align="left" sx={{ maxWidth: 380 }}>
											<Typography sx={{ fontWeight: 600, fontSize: 14 }}>{notice.noticeTitle}</Typography>
											<Typography
												sx={{
													fontSize: 13,
													color: '#757575',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{notice.noticeContent}
											</Typography>
										</TableCell>
										<TableCell align="left">{notice.noticeCategory}</TableCell>
										<TableCell align="left">{notice.memberData?.memberNick ?? '-'}</TableCell>
										<TableCell align="left">{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '-'}</TableCell>
										<TableCell align="center">
											<Button
												className={statusClass[notice.noticeStatus]}
												onClick={(e) => setStatusAnchor({ el: e.currentTarget, notice })}
											>
												{notice.noticeStatus}
											</Button>
										</TableCell>
										<TableCell align="right">
											<Button size="small" onClick={() => openEdit(notice)} sx={{ minWidth: 0, p: '6px' }}>
												<EditOutlinedIcon fontSize="small" />
											</Button>
											{notice.noticeStatus === NoticeStatus.DELETE && (
												<Button
													size="small"
													color="error"
													onClick={() => removeHandler(notice)}
													sx={{ minWidth: 0, p: '6px' }}
												>
													<DeleteOutlineRoundedIcon fontSize="small" />
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					<Menu anchorEl={statusAnchor?.el} open={Boolean(statusAnchor)} onClose={() => setStatusAnchor(null)}>
						{Object.values(NoticeStatus)
							.filter((status) => status !== statusAnchor?.notice.noticeStatus)
							.map((status) => (
								<MenuItem
									key={status}
									onClick={() => statusAnchor && changeStatusHandler(statusAnchor.notice, status)}
								>
									{status}
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

			<Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
				<DialogTitle>{editing?._id ? 'Edit' : 'Create'}</DialogTitle>
				<DialogContent>
					{editing && (
						<Stack sx={{ gap: '16px', pt: '8px' }}>
							<Stack direction={'row'} sx={{ gap: '16px' }}>
								<Select
									fullWidth
									value={editing.noticeCategory}
									onChange={(e) => setEditing({ ...editing, noticeCategory: e.target.value as NoticeCategory })}
									disabled={categories.length === 1}
								>
									{categories.map((category) => (
										<MenuItem key={category} value={category}>
											{category}
										</MenuItem>
									))}
								</Select>
								<Select
									fullWidth
									value={editing.noticeStatus}
									onChange={(e) => setEditing({ ...editing, noticeStatus: e.target.value as NoticeStatus })}
								>
									{Object.values(NoticeStatus).map((status) => (
										<MenuItem key={status} value={status}>
											{status}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<TextField
								label={categories[0] === NoticeCategory.FAQ ? 'Question' : 'Title'}
								value={editing.noticeTitle}
								inputProps={{ maxLength: 150 }}
								onChange={(e) => setEditing({ ...editing, noticeTitle: e.target.value })}
							/>
							<TextField
								label={categories[0] === NoticeCategory.FAQ ? 'Answer' : 'Content'}
								value={editing.noticeContent}
								multiline
								minRows={6}
								inputProps={{ maxLength: 3000 }}
								onChange={(e) => setEditing({ ...editing, noticeContent: e.target.value })}
							/>
						</Stack>
					)}
				</DialogContent>
				<DialogActions sx={{ p: '16px 24px' }}>
					<Button onClick={() => setEditing(null)}>Cancel</Button>
					<Button variant="contained" onClick={saveHandler}>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default NoticeManager;
