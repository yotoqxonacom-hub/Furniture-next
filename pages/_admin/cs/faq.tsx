import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeManager from '../../../libs/components/admin/cs/NoticeManager';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

const AdminFaq: NextPage = () => {
	return <NoticeManager title={'FAQ Management'} categories={[NoticeCategory.FAQ]} />;
};

export default withAdminLayout(AdminFaq);
