import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeManager from '../../../libs/components/admin/cs/NoticeManager';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

const AdminNotice: NextPage = () => {
	return (
		<NoticeManager
			title={'Notice Management'}
			categories={[NoticeCategory.NOTICE, NoticeCategory.TERMS, NoticeCategory.INQUIRY]}
		/>
	);
};

export default withAdminLayout(AdminNotice);
