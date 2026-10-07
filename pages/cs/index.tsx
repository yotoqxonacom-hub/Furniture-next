import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import { CONTACTS, telHref } from '../../libs/config';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { NoticeCategory } from '../../libs/enums/notice.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const tabs = [
	{ id: 'notice', label: 'Notices', icon: <CampaignOutlinedIcon /> },
	{ id: 'faq', label: 'FAQ', icon: <HelpOutlineRoundedIcon /> },
	{ id: 'terms', label: 'Terms', icon: <GavelRoundedIcon /> },
];

const CS: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const tab = (router.query.tab as string) ?? 'notice';

	/** HANDLERS **/
	const changeTabHandler = async (id: string) => {
		await router.push({ pathname: '/cs', query: { tab: id } }, undefined, { scroll: false });
	};

	return (
		<div className={'cs-page fx-section'}>
			<div className={'fx-container cs-layout'}>
				<aside className={'cs-aside'}>
					<nav className={'cs-tabs'}>
						{tabs.map((item) => (
							<button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => changeTabHandler(item.id)}>
								{item.icon}
								{t(item.label)}
							</button>
						))}
					</nav>
					<div className={'cs-contact'}>
						<strong>{t('Still need help?')}</strong>
						<p>{t('Our care team is available every day from 9:00 to 21:00.')}</p>
						<a href={telHref(CONTACTS.phone)}>
							<PhoneOutlinedIcon fontSize="small" />
							{CONTACTS.phone}
						</a>
						<a href={`mailto:${CONTACTS.email}`}>
							<MailOutlineRoundedIcon fontSize="small" />
							{CONTACTS.email}
						</a>
						<a href={CONTACTS.instagram.url} target="_blank" rel="noreferrer">
							<InstagramIcon fontSize="small" />
							{CONTACTS.instagram.handle}
						</a>
						<a href={CONTACTS.telegram.url} target="_blank" rel="noreferrer">
							<TelegramIcon fontSize="small" />
							{CONTACTS.telegram.handle}
						</a>
					</div>
				</aside>

				<div className={'cs-content'}>
					<div className={'fx-section-head'}>
						<div>
							<h2>{t(tabs.find((item) => item.id === tab)?.label ?? 'Notices')}</h2>
							{tab === 'faq' && <p>{t('Quick answers to the questions we hear most.')}</p>}
							{tab === 'notice' && <p>{t('Service updates, events and announcements.')}</p>}
							{tab === 'terms' && <p>{t('The rules that keep CozyLife fair for buyers and sellers.')}</p>}
						</div>
					</div>
					{tab === 'notice' && <Notice category={NoticeCategory.NOTICE} />}
					{tab === 'faq' && <Faq />}
					{tab === 'terms' && <Notice category={NoticeCategory.TERMS} />}
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(CS);
