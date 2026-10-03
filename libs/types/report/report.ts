import { ReportGroup, ReportReason, ReportStatus } from '../../enums/report.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Report {
	_id: string;
	reportStatus: ReportStatus;
	reportGroup: ReportGroup;
	reportReason: ReportReason;
	reportDesc?: string;
	reportRefId: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Reports {
	list: Report[];
	metaCounter: TotalCounter[];
}

export interface ReportInput {
	reportGroup: ReportGroup;
	reportReason: ReportReason;
	reportDesc?: string;
	reportRefId: string;
}

export interface ReportsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		reportStatus?: ReportStatus;
	};
}

export interface AllReportsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		reportStatus?: ReportStatus;
		reportGroup?: ReportGroup;
		reportReason?: ReportReason;
	};
}
