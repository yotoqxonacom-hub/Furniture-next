import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Portal } from '@mui/material';
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

const isTypingTarget = (target: EventTarget | null): boolean => {
	const el = target as HTMLElement | null;
	if (!el) return false;
	return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
};

const HeaderSearch = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState<boolean>(false);
	const [text, setText] = useState<string>('');
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
		skip: !open || !ready,
	});
	const suggestions: Product[] = ready ? data?.getProducts?.list ?? [] : [];

	/** LIFECYCLES **/
	useEffect(() => {
		const id = setTimeout(() => setDebounced(trimmed), 300);
		return () => clearTimeout(id);
	}, [trimmed]);

	useEffect(() => {
		setOpen(false);
	}, [router.asPath]);

	useEffect(() => {
		// "/" or Ctrl/Cmd + K opens the search from anywhere; Esc closes it
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setOpen(true);
			} else if (e.key === '/' && !isTypingTarget(e.target)) {
				e.preventDefault();
				setOpen(true);
			} else if (e.key === 'Escape') {
				setOpen(false);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	useEffect(() => {
		if (!open) return;
		if (router.pathname === '/product') setText(currentSearchText(router.query.input));
		const id = setTimeout(() => inputRef.current?.focus(), 50);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			clearTimeout(id);
			document.body.style.overflow = overflow;
		};
	}, [open]);

	/** HANDLERS **/
	const submitHandler = async (e?: FormEvent) => {
		e?.preventDefault();
		if (!trimmed) return;
		setOpen(false);
		await router.push(productSearchLink({ text: trimmed }));
	};

	return (
		<>
			<button className={'fx-icon-btn search-btn'} onClick={() => setOpen(true)} aria-label={t('Search')}>
				<SearchRoundedIcon />
			</button>

			{open && (
				<Portal>
					<div className={'fx-search-backdrop'} onClick={() => setOpen(false)} />
					<div
						className={'fx-search-overlay'}
						role={'dialog'}
						aria-label={t('Search')}
						// a click anywhere outside the field and the results closes the search
						onMouseDown={(e) => {
							if (!(e.target as HTMLElement).closest('.search-field, .search-results')) setOpen(false);
						}}
					>
						<div className={'fx-container'}>
							<form className={'search-field'} onSubmit={submitHandler}>
								<SearchRoundedIcon className={'lead'} />
								<input
									ref={inputRef}
									type={'search'}
									value={text}
									onChange={(e) => setText(e.target.value)}
									placeholder={t('Search furniture...')}
									autoComplete={'off'}
									enterKeyHint={'search'}
								/>
								{text && (
									<button type={'button'} className={'clear'} onClick={() => setText('')} aria-label={t('Clear')}>
										<CloseRoundedIcon />
									</button>
								)}
								<button type={'submit'} className={'fx-btn primary sm go'} disabled={!trimmed}>
									{t('Search')}
								</button>
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
					</div>
				</Portal>
			)}
		</>
	);
};

export default HeaderSearch;
