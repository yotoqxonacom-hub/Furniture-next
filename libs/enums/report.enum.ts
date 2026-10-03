export enum ReportGroup {
	MEMBER = 'MEMBER',
	PRODUCT = 'PRODUCT',
	ARTICLE = 'ARTICLE',
}

export enum ReportReason {
	WRONG_DESCRIPTION = 'WRONG_DESCRIPTION',
	POOR_QUALITY = 'POOR_QUALITY',
	FAKE_PRODUCT = 'FAKE_PRODUCT',
	RUDE_AGENT = 'RUDE_AGENT',
	NOT_DELIVERED = 'NOT_DELIVERED',
	OTHER = 'OTHER',
}

export enum ReportStatus {
	PENDING = 'PENDING',
	RESOLVED = 'RESOLVED',
	REJECTED = 'REJECTED',
}

export const reportReasonLabel: Record<string, string> = {
	WRONG_DESCRIPTION: 'Wrong description',
	POOR_QUALITY: 'Poor quality',
	FAKE_PRODUCT: 'Fake product',
	RUDE_AGENT: 'Rude agent',
	NOT_DELIVERED: 'Not delivered',
	OTHER: 'Other',
};

/** reasons that make sense for each target */
export const reportReasonsByGroup: Record<string, ReportReason[]> = {
	PRODUCT: [
		ReportReason.WRONG_DESCRIPTION,
		ReportReason.POOR_QUALITY,
		ReportReason.FAKE_PRODUCT,
		ReportReason.NOT_DELIVERED,
		ReportReason.OTHER,
	],
	MEMBER: [ReportReason.RUDE_AGENT, ReportReason.NOT_DELIVERED, ReportReason.FAKE_PRODUCT, ReportReason.OTHER],
	ARTICLE: [ReportReason.WRONG_DESCRIPTION, ReportReason.OTHER],
};

export const reportGroupLabel: Record<string, string> = {
	MEMBER: 'Agent',
	PRODUCT: 'Product',
	ARTICLE: 'Article',
};
