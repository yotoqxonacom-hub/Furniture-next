import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle = () => {
	const { t } = useTranslation('common');
	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{t('Write an article')}</h2>
					<p>{t('Share a room tour, a styling tip or a recommendation with the community.')}</p>
				</div>
			</div>
			<TuiEditor />
		</div>
	);
};

export default WriteArticle;
