import { GRAPHQL_URL } from './env';
import axios from 'axios';
import { getJwtToken } from './auth';
import { translate } from './i18n';

const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const post = async (formData: FormData) => {
	const response = await axios.post(GRAPHQL_URL, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
			'apollo-require-preflight': true,
			Authorization: `Bearer ${getJwtToken()}`,
		},
	});
	if (response?.data?.errors?.length) throw new Error(response.data.errors[0].message);
	return response.data.data;
};

/** Uploads one image (member avatar, article cover). Returns the stored path. */
export const uploadImage = async (file: File, target: string): Promise<string> => {
	if (!validTypes.includes(file.type)) throw new Error(translate('Only jpg, jpeg and png images are allowed!'));
	const formData = new FormData();
	formData.append(
		'operations',
		JSON.stringify({
			query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
			variables: { file: null, target },
		}),
	);
	formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
	formData.append('0', file);
	const data = await post(formData);
	return data.imageUploader;
};

/** Uploads up to 5 product images. Returns the stored paths. */
export const uploadImages = async (files: File[], target: string): Promise<string[]> => {
	if (!files.length) return [];
	if (files.length > 5) throw new Error(translate('You can upload up to 5 images at once!'));
	files.forEach((file) => {
		if (!validTypes.includes(file.type)) throw new Error(translate('Only jpg, jpeg and png images are allowed!'));
	});
	const formData = new FormData();
	const map: Record<string, string[]> = {};
	files.forEach((_, index) => (map[String(index)] = [`variables.files.${index}`]));
	formData.append(
		'operations',
		JSON.stringify({
			query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }`,
			variables: { files: files.map(() => null), target },
		}),
	);
	formData.append('map', JSON.stringify(map));
	files.forEach((file, index) => formData.append(String(index), file));
	const data = await post(formData);
	return data.imagesUploader;
};
