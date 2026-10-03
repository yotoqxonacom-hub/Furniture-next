import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { updateStorage, updateUserInfo } from '../../auth';
import { Message } from '../../enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { uploadImage } from '../../upload';
import { memberImageUrl } from '../../utils';

const MyProfile = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const fileRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<MemberUpdate>({
		_id: '',
		memberNick: '',
		memberFullName: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
		memberImage: '',
	});

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			_id: user?._id,
			memberNick: user?.memberNick ?? '',
			memberFullName: user?.memberFullName ?? '',
			memberPhone: user?.memberPhone ?? '',
			memberAddress: user?.memberAddress ?? '',
			memberDesc: user?.memberDesc ?? '',
			memberImage: user?.memberImage ?? '',
		});
	}, [user?._id, user?.memberImage, user?.memberNick]);

	/** HANDLERS **/
	const change = (key: keyof MemberUpdate, value: string) => setUpdateData((prev) => ({ ...prev, [key]: value }));

	const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			setUploading(true);
			const path = await uploadImage(file, 'member');
			setUpdateData((prev) => ({ ...prev, memberImage: path }));
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = '';
		}
	};

	const saveHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!user?._id) throw new Error(Message.LOGIN_FIRST);
			if (!updateData.memberNick?.trim() || !updateData.memberPhone?.trim()) throw new Error(Message.INSERT_ALL_INPUTS);
			setSaving(true);
			const input: any = { _id: user._id };
			(['memberNick', 'memberFullName', 'memberPhone', 'memberAddress', 'memberDesc', 'memberImage'] as const).forEach(
				(key) => {
					const value = (updateData as any)[key];
					if (value !== undefined && value !== '') input[key] = value;
				},
			);
			const result = await updateMember({ variables: { input } });
			const jwtToken = result.data?.updateMember?.accessToken;
			if (jwtToken) {
				updateStorage({ jwtToken });
				updateUserInfo(jwtToken);
			}
			await sweetMixinSuccessAlert(t('Profile updated'));
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className={'my-section'}>
			<div className={'my-head'}>
				<div>
					<h2>{t('Profile settings')}</h2>
					<p>{t('This is how buyers and sellers see you.')}</p>
				</div>
			</div>

			<form className={'fx-card profile-form'} onSubmit={saveHandler}>
				<div className={'avatar-row'}>
					<div className={'avatar'}>
						<img src={memberImageUrl(updateData.memberImage)} alt="" />
						{uploading && <span className={'uploading'}>…</span>}
					</div>
					<div>
						<button type="button" className={'fx-btn outline sm'} onClick={() => fileRef.current?.click()}>
							<PhotoCameraOutlinedIcon fontSize="small" />
							{t('Change photo')}
						</button>
						<p>{t('JPG or PNG, square images look best.')}</p>
					</div>
					<input ref={fileRef} type="file" hidden accept="image/jpg, image/jpeg, image/png" onChange={uploadHandler} />
				</div>

				<div className={'fx-grid-2'}>
					<div className={'fx-field'}>
						<label>{t('Username')}</label>
						<input value={updateData.memberNick} onChange={(e) => change('memberNick', e.target.value)} />
					</div>
					<div className={'fx-field'}>
						<label>{t('Full name')}</label>
						<input value={updateData.memberFullName} onChange={(e) => change('memberFullName', e.target.value)} />
					</div>
					<div className={'fx-field'}>
						<label>{t('Phone')}</label>
						<input value={updateData.memberPhone} onChange={(e) => change('memberPhone', e.target.value)} />
					</div>
					<div className={'fx-field'}>
						<label>{t('Address')}</label>
						<input value={updateData.memberAddress} onChange={(e) => change('memberAddress', e.target.value)} />
					</div>
				</div>
				<div className={'fx-field'} style={{ marginTop: 18 }}>
					<label>{t('About')}</label>
					<textarea
						value={updateData.memberDesc}
						onChange={(e) => change('memberDesc', e.target.value)}
						placeholder={t('Tell people about yourself or your store')}
					/>
				</div>
				<div className={'form-actions'}>
					<button type="submit" className={'fx-btn primary'} disabled={saving || uploading}>
						{saving ? t('Saving…') : t('Save changes')}
					</button>
				</div>
			</form>
		</div>
	);
};

export default MyProfile;
