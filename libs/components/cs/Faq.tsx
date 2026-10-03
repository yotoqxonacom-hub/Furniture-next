import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { CircularProgress } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useFaqs from '../../hooks/useFaqs';
import FaqList from './FaqList';

/** Help › FAQ tab: searchable list (backend FAQ, or the built-in one while the backend has none) */
const Faq = () => {
	const { t } = useTranslation('common');
	const [text, setText] = useState<string>('');
	const { faqs, loading, fromBackend } = useFaqs(text);

	return (
		<div className={'cs-faq'}>
			<form className={'cs-search'} onSubmit={(e) => e.preventDefault()} role="search">
				<SearchRoundedIcon />
				<input
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder={t('Search questions — delivery, returns, payment…')}
					aria-label={t('Search questions — delivery, returns, payment…')}
				/>
				{text && (
					<button type="button" className={'fx-icon-btn'} onClick={() => setText('')} aria-label={t('Clear filters')}>
						<CloseRoundedIcon />
					</button>
				)}
			</form>

			{loading ? (
				<div className={'cs-loading'}>
					<CircularProgress size={28} />
				</div>
			) : faqs.length === 0 ? (
				<div className={'fx-empty'}>
					<strong>{text ? t('No answers match your search') : t('No questions yet')}</strong>
					<span>{t('Ask us in the live chat — we usually reply within minutes.')}</span>
				</div>
			) : (
				// key: re-open the first answer when the search or the source changes
				<FaqList key={`${fromBackend}-${text}`} faqs={faqs} openFirst />
			)}
		</div>
	);
};

export default Faq;
