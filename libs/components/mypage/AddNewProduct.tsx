import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_PRODUCT } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { ProductLocation, ProductType, productTypeLabel } from '../../enums/product.enum';
import { Message } from '../../enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { uploadImages } from '../../upload';
import { capitalize, imageUrl } from '../../utils';
import { T } from '../../types/common';

interface ProductForm {
	productTitle: string;
	productType: ProductType | '';
	productLocation: ProductLocation | '';
	productAddress: string;
	productPrice: string;
	productSquare: string;
	productBeds: string;
	productRooms: string;
	productStock: string;
	productBarter: boolean;
	productDesc: string;
	productImages: string[];
	madeYear: string;
}

const emptyForm: ProductForm = {
	productTitle: '',
	productType: '',
	productLocation: '',
	productAddress: '',
	productPrice: '',
	productSquare: '',
	productBeds: '1',
	productRooms: '1',
	productStock: '1',
	productBarter: false,
	productDesc: '',
	productImages: [],
	madeYear: '',
};

const MAX_IMAGES = 5;

const AddProduct = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const fileRef = useRef<HTMLInputElement>(null);
	const productId = router.query.productId as string | undefined;
	const [form, setForm] = useState<ProductForm>(emptyForm);
	const [uploading, setUploading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !productId,
		onCompleted: (data: T) => {
			const p = data?.getProduct;
			if (!p) return;
			setForm({
				productTitle: p.productTitle ?? '',
				productType: p.productType ?? '',
				productLocation: p.productLocation ?? '',
				productAddress: p.productAddress ?? '',
				productPrice: String(p.productPrice ?? ''),
				productSquare: String(p.productSquare ?? ''),
				productBeds: String(p.productBeds ?? 1),
				productRooms: String(p.productRooms ?? 1),
				productStock: String(p.productStock ?? 1),
				productBarter: Boolean(p.productBarter),
				productDesc: p.productDesc ?? '',
				productImages: p.productImages ?? [],
				madeYear: p.constructedAt ? String(new Date(p.constructedAt).getFullYear()) : '',
			});
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (user?._id && user.memberType !== 'AGENT') router.replace('/mypage?category=myProfile').then();
	}, [user?._id, user?.memberType]);

	useEffect(() => {
		if (!productId) setForm(emptyForm);
	}, [productId]);

	/** HANDLERS **/
	const change = (key: keyof ProductForm, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

	const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		if (!files.length) return;
		try {
			const room = MAX_IMAGES - form.productImages.length;
			if (room <= 0) throw new Error(t('You can add up to 5 images'));
			setUploading(true);
			const paths = await uploadImages(files.slice(0, room), 'product');
			setForm((prev) => ({ ...prev, productImages: [...prev.productImages, ...paths].slice(0, MAX_IMAGES) }));
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = '';
		}
	};

	const removeImage = (path: string) =>
		setForm((prev) => ({ ...prev, productImages: prev.productImages.filter((image) => image !== path) }));

	const makeCover = (path: string) =>
		setForm((prev) => ({ ...prev, productImages: [path, ...prev.productImages.filter((image) => image !== path)] }));

	const isInvalid =
		form.productTitle.trim().length < 3 ||
		!form.productType ||
		!form.productLocation ||
		form.productAddress.trim().length < 3 ||
		!(Number(form.productPrice) > 0) ||
		!(Number(form.productSquare) > 0) ||
		!(Number(form.productBeds) >= 1) ||
		!(Number(form.productRooms) >= 1) ||
		!(Number.isInteger(Number(form.productStock)) && Number(form.productStock) >= 1 && Number(form.productStock) <= 999) ||
		form.productImages.length === 0 ||
		(form.productDesc.trim().length > 0 && form.productDesc.trim().length < 5);

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			if (isInvalid) throw new Error(Message.INSERT_ALL_INPUTS);
			setSaving(true);
			const input: any = {
				productTitle: form.productTitle.trim(),
				productType: form.productType,
				productLocation: form.productLocation,
				productAddress: form.productAddress.trim(),
				productPrice: Number(form.productPrice),
				productSquare: Number(form.productSquare),
				productBeds: Math.round(Number(form.productBeds)),
				productRooms: Math.round(Number(form.productRooms)),
				productStock: Number(form.productStock),
				productBarter: form.productBarter,
				productImages: form.productImages,
			};
			if (form.productDesc.trim()) input.productDesc = form.productDesc.trim();
			if (form.madeYear) input.constructedAt = new Date(`${form.madeYear}-01-01`);

			if (productId) {
				await updateProduct({ variables: { input: { ...input, _id: productId } } });
				await sweetMixinSuccessAlert(t('Product updated'));
			} else {
				await createProduct({ variables: { input } });
				await sweetMixinSuccessAlert(t('Product published'));
			}
			await router.push({ pathname: '/mypage', query: { category: 'myProducts' } });
		} catch (err: any) {
			// backend has a unique index on (type, city, title, price) -> generic "Create failed!"
			const duplicate = String(err?.message ?? '').includes('Create failed');
			sweetErrorHandling(
				duplicate ? new Error(t('A product with the same title, price, category and city already exists')) : err,
			);
		} finally {
			setSaving(false);
		}
	};

	const thisYear = new Date().getFullYear();

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{productId ? t('Edit product') : t('Add product')}</h2>
					<p>{t('Good photos and honest details sell furniture faster.')}</p>
				</div>
			</div>

			<form className={'product-form'} onSubmit={submitHandler}>
				<div className={'fx-card'}>
					<h3>{t('Photos')}</h3>
					<div className={'image-grid'}>
						{form.productImages.map((path, index) => (
							<div key={path} className={'image-item'}>
								<img src={imageUrl(path)} alt="" onClick={() => makeCover(path)} />
								{index === 0 && <span className={'fx-badge dark cover'}>{t('Cover')}</span>}
								<button type="button" onClick={() => removeImage(path)} aria-label={'Remove image'}>
									<CloseRoundedIcon />
								</button>
							</div>
						))}
						{form.productImages.length < MAX_IMAGES && (
							<button type="button" className={'upload-tile'} onClick={() => fileRef.current?.click()} disabled={uploading}>
								<CloudUploadOutlinedIcon />
								<span>{uploading ? t('Uploading…') : t('Add photos')}</span>
								<small>
									{form.productImages.length}/{MAX_IMAGES}
								</small>
							</button>
						)}
					</div>
					<p className={'hint'}>{t('Tap a photo to make it the cover. JPG or PNG, up to 5 photos.')}</p>
					<input
						ref={fileRef}
						type="file"
						hidden
						multiple
						accept="image/jpg, image/jpeg, image/png"
						onChange={uploadHandler}
					/>
				</div>

				<div className={'fx-card'}>
					<h3>{t('Details')}</h3>
					<div className={'fx-field'}>
						<label>{t('Title')}</label>
						<input
							value={form.productTitle}
							maxLength={100}
							onChange={(e) => change('productTitle', e.target.value)}
							placeholder={t('e.g. Oslo 3-seat linen sofa')}
						/>
					</div>
					<div className={'fx-grid-2'} style={{ marginTop: 18 }}>
						<div className={'fx-field'}>
							<label>{t('Category')}</label>
							<select value={form.productType} onChange={(e) => change('productType', e.target.value)}>
								<option value="">{t('Select')}</option>
								{Object.values(ProductType).map((type) => (
									<option key={type} value={type}>
										{t(productTypeLabel[type])}
									</option>
								))}
							</select>
						</div>
						<div className={'fx-field'}>
							<label>{t('Price ($)')}</label>
							<input
								type="number"
								min={0}
								value={form.productPrice}
								onChange={(e) => change('productPrice', e.target.value)}
							/>
						</div>
						<div className={'fx-field'}>
							<label>{t('Width (cm)')}</label>
							<input
								type="number"
								min={0}
								value={form.productSquare}
								onChange={(e) => change('productSquare', e.target.value)}
							/>
						</div>
						<div className={'fx-field'}>
							<label>{t('Year made')}</label>
							<select value={form.madeYear} onChange={(e) => change('madeYear', e.target.value)}>
								<option value="">{t('Not specified')}</option>
								{Array.from({ length: 40 }, (_, i) => thisYear - i).map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>
						<div className={'fx-field'}>
							<label>{t('Seats')}</label>
							<input
								type="number"
								min={1}
								value={form.productBeds}
								onChange={(e) => change('productBeds', e.target.value)}
							/>
						</div>
						<div className={'fx-field'}>
							<label>{t('Pieces in set')}</label>
							<input
								type="number"
								min={1}
								value={form.productRooms}
								onChange={(e) => change('productRooms', e.target.value)}
							/>
						</div>
						<div className={'fx-field'}>
							<label>{t('In stock (pcs)')}</label>
							<input
								type="number"
								min={1}
								max={999}
								value={form.productStock}
								onChange={(e) => change('productStock', e.target.value)}
							/>
						</div>
					</div>
					<div className={'fx-field'} style={{ marginTop: 18 }}>
						<label>{t('Open to barter?')}</label>
						<div className={'toggle-row'}>
							<button
								type="button"
								className={`fx-chip ${form.productBarter ? 'active' : ''}`}
								onClick={() => change('productBarter', true)}
							>
								{t('Yes')}
							</button>
							<button
								type="button"
								className={`fx-chip ${!form.productBarter ? 'active' : ''}`}
								onClick={() => change('productBarter', false)}
							>
								{t('No')}
							</button>
						</div>
					</div>
					<div className={'fx-field'} style={{ marginTop: 18 }}>
						<label>{t('Description')}</label>
						<textarea
							value={form.productDesc}
							maxLength={500}
							onChange={(e) => change('productDesc', e.target.value)}
							placeholder={t('Material, condition, dimensions, delivery options…')}
						/>
					</div>
				</div>

				<div className={'fx-card'}>
					<h3>{t('Location')}</h3>
					<div className={'fx-grid-2'}>
						<div className={'fx-field'}>
							<label>{t('City')}</label>
							<select value={form.productLocation} onChange={(e) => change('productLocation', e.target.value)}>
								<option value="">{t('Select')}</option>
								{Object.values(ProductLocation).map((location) => (
									<option key={location} value={location}>
										{t(capitalize(location))}
									</option>
								))}
							</select>
						</div>
						<div className={'fx-field'}>
							<label>{t('Address / pickup point')}</label>
							<input
								value={form.productAddress}
								maxLength={100}
								onChange={(e) => change('productAddress', e.target.value)}
							/>
						</div>
					</div>
				</div>

				<div className={'form-actions sticky'}>
					<button
						type="button"
						className={'fx-btn outline'}
						onClick={() => router.push({ pathname: '/mypage', query: { category: 'myProducts' } })}
					>
						{t('Cancel')}
					</button>
					<button type="submit" className={'fx-btn primary'} disabled={isInvalid || saving || uploading}>
						{saving ? t('Saving…') : productId ? t('Save changes') : t('Publish product')}
					</button>
				</div>
			</form>
		</div>
	);
};

export default AddProduct;
