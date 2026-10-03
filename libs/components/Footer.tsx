import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { ProductType, productTypeLabel } from '../enums/product.enum';
import { sweetTopSmallSuccessAlert } from '../sweetAlert';
import { productSearchLink } from '../utils';
import { CONTACTS, telHref } from '../config';

const Footer = () => {
	const { t } = useTranslation('common');
	const [email, setEmail] = useState<string>('');

	const subscribeHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.includes('@')) return;
		setEmail('');
		await sweetTopSmallSuccessAlert(t('Thanks for subscribing!'), 1200);
	};

	return (
		<footer className={'fx-footer'}>
			<div className={'fx-container'}>
				<div className={'top'}>
					<div className={'brand'}>
						<img src="/img/furniture/logoWhite.svg" alt="Furniture" />
						<p>
							{t(
								'A marketplace for honest, well-made furniture. Find the piece that makes your home feel like yours.',
							)}
						</p>
						<div className={'contacts'}>
							<span>{t('Customer care')}</span>
							<a href={telHref(CONTACTS.phone)}>
								<strong>{CONTACTS.phone}</strong>
							</a>
							<a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
						</div>
					</div>

					<div>
						<h4>{t('Shop')}</h4>
						<ul>
							{Object.values(ProductType)
								.slice(0, 6)
								.map((type) => (
									<li key={type}>
										<Link
											href={productSearchLink({ typeList: [type] })}
										>
											{t(productTypeLabel[type])}
										</Link>
									</li>
								))}
						</ul>
					</div>

					<div>
						<h4>{t('Company')}</h4>
						<ul>
							<li>
								<Link href={'/about'}>{t('About us')}</Link>
							</li>
							<li>
								<Link href={'/agent'}>{t('Sellers')}</Link>
							</li>
							<li>
								<Link href={'/community?articleCategory=FREE'}>{t('Community')}</Link>
							</li>
							<li>
								<Link href={'/cs?tab=faq'}>{t('FAQ')}</Link>
							</li>
							<li>
								<Link href={'/cs?tab=terms'}>{t('Terms of use')}</Link>
							</li>
						</ul>
					</div>

					<div className={'subscribe'}>
						<h4>{t('Stay inspired')}</h4>
						<p>{t('New arrivals and interior ideas, once a month.')}</p>
						<form onSubmit={subscribeHandler}>
							<input
								type="email"
								placeholder={t('Your email')}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<button type="submit" className={'fx-btn primary sm'}>
								{t('Subscribe')}
							</button>
						</form>
						<div className={'socials'}>
							<a href={CONTACTS.facebook.url} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook">
								<FacebookOutlinedIcon />
							</a>
							<a href={CONTACTS.instagram.url} target="_blank" rel="noreferrer" aria-label={`Instagram ${CONTACTS.instagram.handle}`} title={CONTACTS.instagram.handle}>
								<InstagramIcon />
							</a>
							<a href={CONTACTS.telegram.url} target="_blank" rel="noreferrer" aria-label={`Telegram ${CONTACTS.telegram.handle}`} title={CONTACTS.telegram.handle}>
								<TelegramIcon />
							</a>
							<a href={`mailto:${CONTACTS.email}`} aria-label={`Email ${CONTACTS.email}`} title={CONTACTS.email}>
								<MailOutlineRoundedIcon />
							</a>
						</div>
					</div>
				</div>

				<div className={'bottom'}>
					<span>© {new Date().getFullYear()} Furniture. {t('All rights reserved.')}</span>
					<span>{t('Seoul · Busan · Incheon · Daegu')}</span>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
