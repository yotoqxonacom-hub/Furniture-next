import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Notices {
	list: Notice[];
	metaCounter: TotalCounter[];
}

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
}

export interface NoticeUpdate {
	_id: string;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTitle?: string;
	noticeContent?: string;
}

export interface NoticesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		noticeCategory: NoticeCategory;
		text?: string;
	};
}

export interface AllNoticesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		noticeCategory?: NoticeCategory;
		noticeCategoryList?: NoticeCategory[];
		noticeStatus?: NoticeStatus;
		text?: string;
	};
}
