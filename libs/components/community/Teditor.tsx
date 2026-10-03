import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Editor } from '@toast-ui/react-editor';
// @ts-expect-error Toast UI Editor's CSS is handled by the application's bundler.
import '@toast-ui/editor/dist/toastui-editor.css';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { communityTabs } from '../../config';
import { uploadImage } from '../../upload';
import { imageUrl } from '../../utils';

const MAX_CONTENT = 250;

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null);
	const coverRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const { t } = useTranslation('common');
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState<string>('');
	const [articleImage, setArticleImage] = useState<string>('');
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	/** HANDLERS **/
	const coverHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			setArticleImage(await uploadImage(file, 'article'));
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			if (coverRef.current) coverRef.current.value = '';
		}
	};

	const registerHandler = async () => {
		try {
			const articleContent = (editorRef.current?.getInstance().getHTML() as string) ?? '';
			const plain = articleContent.replace(/<[^>]*>/g, '').trim();
			if (articleTitle.trim().length < 3 || plain.length < 3) throw new Error(Message.INSERT_ALL_INPUTS);
			if (articleContent.length > MAX_CONTENT)
				throw new Error(t('The article is too long. Please keep it under 250 characters including formatting.'));
			setSaving(true);
			await createBoardArticle({
				variables: {
					input: {
						articleCategory,
						articleTitle: articleTitle.trim(),
						articleContent,
						...(articleImage ? { articleImage } : {}),
					},
				},
			});
			await sweetTopSuccessAlert(t('Article published'), 900);
			await router.push({ pathname: '/mypage', query: { category: 'myArticles' } });
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className={'article-editor'}>
			<div className={'fx-card'}>
				<div className={'fx-grid-2'}>
					<div className={'fx-field'}>
						<label>{t('Board')}</label>
						<select
							value={articleCategory}
							onChange={(e) => setArticleCategory(e.target.value as BoardArticleCategory)}
						>
							{communityTabs.map((tab) => (
								<option key={tab.value} value={tab.value}>
									{t(tab.label)}
								</option>
							))}
						</select>
					</div>
					<div className={'fx-field'}>
						<label>{t('Title')}</label>
						<input
							value={articleTitle}
							maxLength={50}
							onChange={(e) => setArticleTitle(e.target.value)}
							placeholder={t('Give your post a title')}
						/>
					</div>
				</div>

				<div className={'cover-row'}>
					{articleImage ? (
						<div className={'cover-preview'}>
							<img src={imageUrl(articleImage)} alt="" />
							<button type="button" className={'fx-btn outline sm'} onClick={() => setArticleImage('')}>
								{t('Remove cover')}
							</button>
						</div>
					) : (
						<button type="button" className={'fx-btn outline sm'} onClick={() => coverRef.current?.click()}>
							<AddPhotoAlternateOutlinedIcon fontSize="small" />
							{t('Add cover image')}
						</button>
					)}
					<input ref={coverRef} type="file" hidden accept="image/jpg, image/jpeg, image/png" onChange={coverHandler} />
				</div>
			</div>

			<div className={'editor-wrap'}>
				<Editor
					initialValue={''}
					placeholder={t('Share your idea, room tour or recommendation…')}
					previewStyle={'vertical'}
					height={'420px'}
					// @ts-ignore
					initialEditType={'wysiwyg'}
					hideModeSwitch={true}
					toolbarItems={[
						['heading', 'bold', 'italic', 'strike'],
						['image', 'link'],
						['ul', 'ol'],
					]}
					ref={editorRef}
					hooks={{
						addImageBlobHook: async (image: any, callback: any) => {
							try {
								const path = await uploadImage(image, 'article');
								callback(imageUrl(path));
							} catch (err: any) {
								await sweetMixinErrorAlert(err.message);
							}
							return false;
						},
					}}
				/>
			</div>

			<div className={'form-actions'}>
				<button className={'fx-btn primary'} onClick={registerHandler} disabled={saving}>
					{saving ? t('Publishing…') : t('Publish')}
				</button>
			</div>
		</div>
	);
};

export default TuiEditor;
