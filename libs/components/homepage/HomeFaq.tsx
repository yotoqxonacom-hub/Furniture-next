import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import useFaqs from '../../hooks/useFaqs';
import FaqList from '../cs/FaqList';

/** how many questions the home page shows; the rest are in Help › FAQ */
const HOME_FAQ_COUNT = 5;

/** Home page "Frequently asked questions" block */
const HomeFaq = () => {
	const { t } = useTranslation('common');
	const { faqs, fromBackend } = useFaqs('', HOME_FAQ_COUNT);

	if (!faqs.length) return null;

	return (
		<section className={'fx-section home-faq'}>
			<div className={'fx-container faq-layout'}>
				<div className={'copy'}>
					<span className={'eyebrow'}>{t('Help center')}</span>
					<h2>{t('Frequently asked questions')}</h2>
					<p>{t('Quick answers to the questions we hear most.')}</p>
					<Link href={{ pathname: '/cs', query: { tab: 'faq' } }} className={'fx-btn outline sm'}>
						{t('All questions')}
						<EastRoundedIcon fontSize="small" />
					</Link>
				</div>
				<FaqList key={String(fromBackend)} faqs={faqs} openFirst />
			</div>
		</section>
	);
};

export default HomeFaq;
