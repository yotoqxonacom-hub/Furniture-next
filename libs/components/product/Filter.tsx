import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { ProductsInquiry } from '../../types/product/product.input';
import { ProductLocation, ProductType, productTypeLabel } from '../../enums/product.enum';
import { productSquare } from '../../config';
import { capitalize } from '../../utils';
import {
	COUNT_OPTIONS,
	COUNT_PLUS,
	NO_LIMIT,
	buildPriceRange,
	buildSizeRange,
	rangeText,
	sameSearch,
	toggleIn,
	withFilter,
} from '../../productFilter';

interface FilterProps {
	searchFilter: ProductsInquiry;
	applyFilter: (next: ProductsInquiry) => void;
	initialInput: ProductsInquiry;
}

/** cities shown before "Show all cities" */
const VISIBLE_CITIES = 5;

/**
 * Shop sidebar / mobile drawer filter.
 * Checkboxes and chips apply at once; text and price apply on Enter, on the Apply button
 * or when the field loses focus — and only if the value actually changed.
 * All rules (empty = no filter, "5+", open ranges) live in libs/productFilter.ts.
 */
const Filter = ({ searchFilter, applyFilter, initialInput }: FilterProps) => {
	const { t } = useTranslation('common');
	const search: Record<string, any> = searchFilter?.search ?? {};
	const [searchText, setSearchText] = useState<string>(search.text ?? '');
	const [priceStart, setPriceStart] = useState<string>(rangeText(search.pricesRange?.start));
	const [priceEnd, setPriceEnd] = useState<string>(rangeText(search.pricesRange?.end));
	const [showAllCities, setShowAllCities] = useState<boolean>(false);

	/** LIFECYCLES **/
	// keep the inputs in sync when the URL changes (chips removed, reset, back button)
	useEffect(() => {
		setSearchText(search.text ?? '');
		setPriceStart(rangeText(search.pricesRange?.start));
		setPriceEnd(rangeText(search.pricesRange?.end));
	}, [searchFilter]);

	/** HANDLERS **/
	/** navigates only when the search really changed (blur used to re-run the same search) */
	const update = (nextSearch: Record<string, any>) => {
		if (sameSearch(nextSearch, search)) return;
		applyFilter({ ...searchFilter, page: 1, search: nextSearch });
	};

	const applyText = (e?: React.FormEvent) => {
		e?.preventDefault();
		update(withFilter(search, 'text', searchText.trim()));
	};

	const applyPrice = (e?: React.FormEvent) => {
		e?.preventDefault();
		update(withFilter(search, 'pricesRange', buildPriceRange(priceStart, priceEnd)));
	};

	const changeSize = (key: 'start' | 'end', value: number) => {
		const current = { start: search.squaresRange?.start ?? 0, end: search.squaresRange?.end ?? NO_LIMIT };
		const next = { ...current, [key]: value };
		update(withFilter(search, 'squaresRange', buildSizeRange(next.start, next.end)));
	};

	const resetHandler = () => {
		applyFilter({ ...initialInput, sort: searchFilter.sort, direction: searchFilter.direction });
	};

	const allCities = Object.values(ProductLocation);
	// a selected city must never be hidden behind "Show all cities"
	const hasHiddenSelection = allCities.slice(VISIBLE_CITIES).some((c) => (search.locationList ?? []).includes(c));
	const cities = showAllCities || hasHiddenSelection ? allCities : allCities.slice(0, VISIBLE_CITIES);

	const countChips = (key: 'bedsList' | 'roomsList') => (
		<div className={'pill-row'}>
			{COUNT_OPTIONS.map((n) => (
				<button
					key={n}
					type="button"
					aria-pressed={(search[key] ?? []).includes(n)}
					className={`fx-chip ${(search[key] ?? []).includes(n) ? 'active' : ''}`}
					onClick={() => update(toggleIn(search, key, n))}
				>
					{n === COUNT_PLUS ? `${n}+` : n}
				</button>
			))}
		</div>
	);

	return (
		<div className={'shop-filter'}>
			<div className={'filter-head'}>
				<strong>{t('Filters')}</strong>
				<button type="button" className={'reset'} onClick={resetHandler}>
					<RestartAltRoundedIcon fontSize="small" />
					{t('Reset')}
				</button>
			</div>

			<form className={'filter-search'} onSubmit={applyText}>
				<SearchRoundedIcon />
				<input
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onBlur={() => applyText()}
					placeholder={t('Search furniture')}
					aria-label={t('Search furniture')}
				/>
			</form>

			<div className={'filter-block'}>
				<h4>{t('Category')}</h4>
				<div className={'check-list'}>
					{Object.values(ProductType).map((type) => (
						<label key={type}>
							<input
								type="checkbox"
								checked={(search.typeList ?? []).includes(type)}
								onChange={() => update(toggleIn(search, 'typeList', type))}
							/>
							<span>{t(productTypeLabel[type])}</span>
						</label>
					))}
				</div>
			</div>

			<div className={'filter-block'}>
				<h4>{t('City')}</h4>
				<div className={'check-list'}>
					{cities.map((location) => (
						<label key={location}>
							<input
								type="checkbox"
								checked={(search.locationList ?? []).includes(location)}
								onChange={() => update(toggleIn(search, 'locationList', location))}
							/>
							<span>{t(capitalize(location))}</span>
						</label>
					))}
				</div>
				{!hasHiddenSelection && (
					<button type="button" className={'more'} onClick={() => setShowAllCities(!showAllCities)}>
						{showAllCities ? t('Show less') : t('Show all cities')}
					</button>
				)}
			</div>

			<div className={'filter-block'}>
				<h4>{t('Seats')}</h4>
				{countChips('bedsList')}
			</div>

			<div className={'filter-block'}>
				<h4>{t('Pieces in set')}</h4>
				{countChips('roomsList')}
			</div>

			<div className={'filter-block'}>
				<h4>{t('Price ($)')}</h4>
				<form className={'range-row'} onSubmit={applyPrice}>
					<input
						type="number"
						min={0}
						inputMode="numeric"
						value={priceStart}
						onChange={(e) => setPriceStart(e.target.value)}
						onBlur={() => applyPrice()}
						placeholder={t('Min price')}
						aria-label={t('Min price')}
					/>
					<span>—</span>
					<input
						type="number"
						min={0}
						inputMode="numeric"
						value={priceEnd}
						onChange={(e) => setPriceEnd(e.target.value)}
						onBlur={() => applyPrice()}
						placeholder={t('Max price')}
						aria-label={t('Max price')}
					/>
					{/* lets Enter submit; visually hidden, the inputs apply on blur too */}
					<button type="submit" className={'visually-hidden'}>
						{t('Apply')}
					</button>
				</form>
			</div>

			<div className={'filter-block'}>
				<h4>{t('Size (cm)')}</h4>
				<div className={'range-row'}>
					<select
						value={search.squaresRange?.start ?? 0}
						onChange={(e) => changeSize('start', Number(e.target.value))}
						aria-label={t('Min size')}
					>
						{productSquare.map((size: number) => (
							<option key={size} value={size}>
								{size === 0 ? t('Any') : size}
							</option>
						))}
					</select>
					<span>—</span>
					<select
						value={search.squaresRange?.end ?? NO_LIMIT}
						onChange={(e) => changeSize('end', Number(e.target.value))}
						aria-label={t('Max size')}
					>
						{productSquare.slice(1).map((size: number) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
						<option value={NO_LIMIT}>{t('Any')}</option>
					</select>
				</div>
			</div>

			<div className={'filter-block'}>
				<h4>{t('Options')}</h4>
				<div className={'check-list'}>
					<label>
						<input
							type="checkbox"
							checked={(search.options ?? []).includes('productBarter')}
							onChange={() => update(toggleIn(search, 'options', 'productBarter'))}
						/>
						<span>{t('Open to barter')}</span>
					</label>
				</div>
			</div>
		</div>
	);
};

export default Filter;
