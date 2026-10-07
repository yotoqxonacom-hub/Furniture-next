import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useApolloClient } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { getJwtToken, logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { reconnectSocket } from '../../libs/socket';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** the form always starts empty: nothing from a previous login / sign-up stays on screen */
const EMPTY_INPUT = { nick: '', password: '', phone: '', type: 'USER' };

const Join: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const apolloClient = useApolloClient();
	const [input, setInput] = useState(EMPTY_INPUT);

	/** HANDLERS **/
	const handleInput = (name: string, value: string) => setInput((prev) => ({ ...prev, [name]: value }));

	const resetForm = (keepType: boolean = false) => {
		setInput((prev) => ({ ...EMPTY_INPUT, type: keepType ? prev.type : EMPTY_INPUT.type }));
		setShowPassword(false);
	};

	/** Login <-> Sign up: the other form opens clean */
	const switchView = (login: boolean) => {
		if (login === loginView) return;
		setLoginView(login);
		resetForm(true);
	};

	/** LIFECYCLES **/
	useEffect(() => {
		// already logged in -> nothing to do here
		if (getJwtToken()) router.replace('/').then();
		resetForm();
		// Back/Forward from the browser cache (bfcache) shows the old DOM: clear it as well
		const onPageShow = (e: PageTransitionEvent) => e.persisted && resetForm();
		window.addEventListener('pageshow', onPageShow);
		return () => window.removeEventListener('pageshow', onPageShow);
	}, []);

	useEffect(() => {
		// links like SELLER_SIGNUP_HREF open the sign-up tab with "Seller" preselected
		if (!router.isReady) return;
		if (router.query.mode === 'signup') setLoginView(false);
		if (router.query.type === 'AGENT') setInput((prev) => ({ ...prev, type: 'AGENT' }));
	}, [router.isReady]);

	/** same rules as the backend (MemberInput / LoginInput) so mistakes are caught before the request */
	const validate = (): string | null => {
		const nick = input.nick.trim();
		if (!nick || !input.password || (!loginView && !input.phone.trim())) return t('Please fill in all fields');
		if (nick.length < 3 || nick.length > 12) return t('Username must be 3–12 characters');
		if (input.password.length < 5 || input.password.length > 12) return t('Password must be 5–12 characters');
		if (!loginView && !/^[0-9+\-\s]{9,15}$/.test(input.phone.trim())) return t('Please enter a valid phone number');
		return null;
	};

	const redirectAfterAuth = async () => {
		const referrer = router.query.referrer as string | undefined;
		// only internal redirects
		const target = referrer && referrer.startsWith('/') && !referrer.startsWith('//') ? referrer : '/';
		// client-side navigation keeps the success toast on screen; the socket re-identifies with the new token
		reconnectSocket();
		// guest results (likes, follows, cart…) must not leak into the member's pages
		await apolloClient.clearStore();
		await router.push(target);
	};

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		if (loading) return;
		const problem = validate();
		if (problem) {
			sweetMixinErrorAlert(problem);
			return;
		}
		try {
			setLoading(true);
			if (loginView) {
				await logIn(input.nick.trim(), input.password);
				sweetTopSmallSuccessAlert(t('Welcome back!'), 1500);
			} else {
				await signUp(input.nick.trim(), input.password, input.phone.trim(), input.type);
				sweetTopSmallSuccessAlert(t('Your account has been created'), 1800);
			}
			resetForm();
			await redirectAfterAuth();
		} catch (err: any) {
			// stay on the page and show exactly what went wrong
			sweetMixinErrorAlert(err.message, 3500);
			setInput((prev) => ({ ...prev, password: '' }));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={'join-page fx-section'}>
			<div className={'fx-container join-layout'}>
				<div className={'join-art'}>
					<img src="/img/furniture/col-relax.svg" alt="" />
					<div className={'quote'}>
						<strong>{t('“Found our dream sofa in two days — delivered and assembled.”')}</strong>
						<span>— Minji, Seoul</span>
					</div>
				</div>

				<form className={'join-card'} onSubmit={submitHandler} autoComplete="off">
					<div className={'switch'}>
						<button type="button" className={loginView ? 'active' : ''} onClick={() => switchView(true)}>
							{t('Login')}
						</button>
						<button type="button" className={!loginView ? 'active' : ''} onClick={() => switchView(false)}>
							{t('Sign up')}
						</button>
					</div>

					<div>
						<h2>{loginView ? t('Welcome back') : t('Create your account')}</h2>
						<p className={'muted'}>
							{loginView ? t('Log in to see your favorites and messages.') : t('It takes less than a minute.')}
						</p>
					</div>

					<div className={'fx-field'}>
						<label htmlFor="nick">{t('Username')}</label>
						<input
							id="nick"
							name="furniture-nick"
							autoComplete="off"
							spellCheck={false}
							maxLength={12}
							value={input.nick}
							onChange={(e) => handleInput('nick', e.target.value)}
							placeholder={t('Enter your username')}
						/>
					</div>

					<div className={'fx-field'}>
						<label htmlFor="password">{t('Password')}</label>
						<div className={'password-wrap'}>
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								name="furniture-password"
								// "new-password" stops the browser from pre-filling a saved password
								autoComplete="new-password"
								maxLength={12}
								value={input.password}
								onChange={(e) => handleInput('password', e.target.value)}
								placeholder={t('Enter your password')}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
							</button>
						</div>
					</div>

					{!loginView && (
						<>
							<div className={'fx-field'}>
								<label htmlFor="phone">{t('Phone')}</label>
								<input
									id="phone"
									type="tel"
									autoComplete="off"
									value={input.phone}
									onChange={(e) => handleInput('phone', e.target.value)}
									placeholder={'010 1234 5678'}
								/>
							</div>
							<div className={'fx-field'}>
								<span className={'label'}>{t('I want to')}</span>
								<div className={'role-pick'}>
									<button
										type="button"
										className={input.type === 'USER' ? 'active' : ''}
										onClick={() => handleInput('type', 'USER')}
									>
										<ShoppingBagOutlinedIcon />
										<strong>{t('Buy furniture')}</strong>
										<small>{t('Save favorites, review, report')}</small>
									</button>
									<button
										type="button"
										className={input.type === 'AGENT' ? 'active' : ''}
										onClick={() => handleInput('type', 'AGENT')}
									>
										<StorefrontOutlinedIcon />
										<strong>{t('Sell furniture')}</strong>
										<small>{t('List products, get leads')}</small>
									</button>
								</div>
							</div>
						</>
					)}

					<button type="submit" className={'fx-btn primary block'} disabled={loading}>
						{loading ? t('Please wait…') : loginView ? t('Login') : t('Create account')}
					</button>

					<p className={'switch-hint'}>
						{loginView ? t('New to CozyLife?') : t('Already have an account?')}{' '}
						<button type="button" onClick={() => switchView(!loginView)}>
							{loginView ? t('Create an account') : t('Log in')}
						</button>
					</p>
				</form>
			</div>
		</div>
	);
};

export default withLayoutBasic(Join);
