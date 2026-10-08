import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Product } from '../../types/product/product';
import { productTypeLabel } from '../../enums/product.enum';
import { capitalize, formatPrice, imageUrl, productSearchLink } from '../../utils';

const MIN_CHARS = 2;
const SUGGESTION_LIMIT = 5;

/** text the shop page is currently filtered by, so reopening the search shows it */
const currentSearchText = (raw: unknown): string => {
	if (!raw || typeof raw !== 'string') return '';
	try {
		return JSON.parse(raw)?.search?.text ?? '';
	} catch {
		return '';
	}
};

interface HeaderSearchProps {
	onClose: () => void;
}

/** search field that opens inside the navbar, in place of the links; the page below stays visible */
const HeaderSearch = ({ onClose }: HeaderSearchProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [text, setText] = useState<string>(() =>
		router.pathname === '/product' ? currentSearchText(router.query.input) : '',
	);
	const [debounced, setDebounced] = useState<string>('');

	const trimmed = text.trim();
	const ready = debounced.length >= MIN_CHARS;

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-first',
		context: { silent: true }, // typing must never pop an alert
		variables: {
			input: { page: 1, limit: SUGGESTION_LIMIT, sort: 'createdAt', direction: 'DESC', search: { text: debounced } },
		},
		skip: !ready,
	});
	const suggestions: Product[] = ready ? data?.getProducts?.list ?? [] : [];

	/** LIFECYCLES **/
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		const id = setTimeout(() => setDebounced(trimmed), 300);
		return () => clearTimeout(id);
	}, [trimmed]);

	useEffect(() => {
		// a click anywhere outside the field closes it; the header toggle button handles itself
		const onPointer = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (rootRef.current?.contains(target) || target.closest('.search-btn')) return;
			onClose();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('mousedown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [onClose]);

	/** HANDLERS **/
	const submitHandler = async (e?: FormEvent) => {
		e?.preventDefault();
		if (!trimmed) return;
		onClose();
		await router.push(productSearchLink({ text: trimmed }));
	};

	return (
		<div className={'fx-header-search'} ref={rootRef} role={'search'}>
			<form className={'search-field'} onSubmit={submitHandler}>
				<SearchRoundedIcon className={'lead'} />
				<input
					ref={inputRef}
					type={'search'}
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder={t('Search furniture...')}
					aria-label={t('Search')}
					autoComplete={'off'}
					enterKeyHint={'search'}
				/>
				{text && (
					<button
						type={'button'}
						className={'clear'}
						onClick={() => {
							setText('');
							inputRef.current?.focus();
						}}
						aria-label={t('Clear')}
					>
						<CloseRoundedIcon />
					</button>
				)}
			</form>

			{ready && (
				<div className={'search-results'}>
					{loading && suggestions.length === 0 ? (
						<div className={'search-state'}>{t('Searching...')}</div>
					) : suggestions.length === 0 ? (
						<div className={'search-state'}>{t('No products found')}</div>
					) : (
						<>
							{suggestions.map((product) => (
								<Link
									key={product._id}
									href={{ pathname: '/product/detail', query: { id: product._id } }}
									className={'search-item'}
								>
									<img src={imageUrl(product.productImages?.[0])} alt={product.productTitle} />
									<div className={'txt'}>
										<strong>{product.productTitle}</strong>
										<span>
											{t(productTypeLabel[product.productType] ?? capitalize(product.productType))} ·{' '}
											{t(capitalize(product.productLocation))}
										</span>
									</div>
									<span className={'price'}>{formatPrice(product.productPrice)}</span>
								</Link>
							))}
							<button type={'button'} className={'search-all'} onClick={() => submitHandler()}>
								{t('See all results')}
								<ArrowForwardRoundedIcon />
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default HeaderSearch;
