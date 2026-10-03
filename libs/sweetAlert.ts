import Swal from 'sweetalert2';
//@ts-ignore
import 'animate.css';
import { Messages } from './config';
import { translate } from './i18n';
import { errorMessageOf } from './errorMessage';

/**
 * Timer alerts are shown and the function returns right away (fire-and-forget),
 * so `await sweetXxx()` no longer blocks navigation for 2–3 seconds.
 * Swal shows one popup at a time, so the newest message always wins and is never stuck behind an old one.
 * Confirm dialogs (sweetConfirmAlert, sweetLoginConfirmAlert) still wait for the user's answer.
 */
/** string / array / { message } object -> plain text (never "[object Object]") */
const clean = (msg: any): string => {
	const text = errorMessageOf(msg) || (msg == null ? '' : typeof msg === 'object' ? Messages.error1 : String(msg));
	return text.replace('Definer: ', '');
};

const errorText = (err: any): string => clean(err?.graphQLErrors?.[0]?.message ?? err?.message ?? Messages.error1);

const Toast = Swal.mixin({
	toast: true,
	position: 'top-end',
	showConfirmButton: false,
	timerProgressBar: true,
	didOpen: (toast) => {
		toast.addEventListener('mouseenter', Swal.stopTimer);
		toast.addEventListener('mouseleave', Swal.resumeTimer);
	},
});

export const sweetErrorHandling = async (err: any) => {
	Swal.fire({
		icon: 'error',
		text: errorText(err),
		showConfirmButton: false,
		timer: 3000,
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	Swal.fire({
		position: 'center',
		icon: 'success',
		title: clean(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	Swal.fire({
		title: msg,
		showClass: { popup: 'animate__bounceIn' },
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetConfirmAlert = (msg: string): Promise<boolean> => {
	return Swal.fire({
		icon: 'question',
		text: msg,
		showClass: { popup: 'animate__bounceIn' },
		showCancelButton: true,
		showConfirmButton: true,
		confirmButtonText: translate('Yes'),
		cancelButtonText: translate('Cancel'),
		confirmButtonColor: '#B8653E',
		cancelButtonColor: '#D9CFC3',
	}).then((response) => Boolean(response?.isConfirmed));
};

export const sweetLoginConfirmAlert = (msg: string): Promise<boolean> => {
	return Swal.fire({
		text: msg,
		showCancelButton: true,
		showConfirmButton: true,
		color: '#212121',
		confirmButtonColor: '#B8653E',
		cancelButtonColor: '#D9CFC3',
		confirmButtonText: translate('Login'),
		cancelButtonText: translate('Cancel'),
	}).then((response) => Boolean(response?.isConfirmed));
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	Swal.fire({
		icon: 'error',
		title: clean(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	Toast.fire({
		icon: 'error',
		title: clean(msg),
		timer: duration,
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	Toast.fire({
		icon: 'success',
		title: clean(msg),
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	Swal.fire(text);
};

export const sweetErrorHandlingForAdmin = async (err: any) => {
	Swal.fire({
		icon: 'error',
		text: errorText(err),
		showConfirmButton: false,
		timer: 3000,
	});
};

export const sweetTopSmallSuccessAlert = async (msg: string, duration: number = 2000, enable_forward: boolean = false) => {
	Toast.fire({
		icon: 'success',
		title: clean(msg),
		timer: duration,
	}).then(() => {
		if (enable_forward) window.location.reload();
	});
};
