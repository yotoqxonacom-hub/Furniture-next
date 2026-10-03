import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { GET_FAQS } from '../../apollo/user/query';
import { NoticeCategory } from '../enums/notice.enum';
import { DEFAULT_FAQS, FaqItem } from '../data/defaultFaqs';

/** FAQ lists are short, so all of them are loaded once and searched on the page */
const FAQ_FETCH_LIMIT = 100;

interface UseFaqsResult {
	faqs: FaqItem[];
	loading: boolean;
	/** false while the built-in list is shown (backend has no FAQ yet) */
	fromBackend: boolean;
}

/**
 * FAQ for the Help page and the home page.
 * - backend FAQ (Admin › CS › FAQ, status ACTIVE) when there is any
 * - otherwise the built-in list from libs/data/defaultFaqs.ts, translated
 * `search` matches question or answer; `limit` cuts the result (home shows a few).
 */
const useFaqs = (search: string = '', limit: number = FAQ_FETCH_LIMIT): UseFaqsResult => {
	const { t } = useTranslation('common');

	// read `data` directly: onCompleted does not fire for cache hits with cache-and-network
	const { data, loading, error } = useQuery(GET_FAQS, {
		fetchPolicy: 'cache-and-network',
		context: { silent: true }, // the built-in list covers failures, no error alert
		variables: {
			input: {
				page: 1,
				limit: FAQ_FETCH_LIMIT,
				sort: 'createdAt',
				direction: 'ASC',
				search: { noticeCategory: NoticeCategory.FAQ },
			},
		},
	});

	// no answer yet: show the spinner instead of flashing the built-in list
	if (!data && !error) return { faqs: [], loading: true, fromBackend: false };

	const backendFaqs: FaqItem[] = data?.getNotices?.list ?? [];
	const fromBackend = backendFaqs.length > 0;
	const source: FaqItem[] = fromBackend
		? backendFaqs
		: DEFAULT_FAQS.map((faq) => ({ ...faq, noticeTitle: t(faq.noticeTitle), noticeContent: t(faq.noticeContent) }));

	const needle = search.trim().toLowerCase();
	const faqs = source
		.filter((faq) => !needle || `${faq.noticeTitle} ${faq.noticeContent}`.toLowerCase().includes(needle))
		.slice(0, limit);

	return { faqs, loading, fromBackend };
};

export default useFaqs;
