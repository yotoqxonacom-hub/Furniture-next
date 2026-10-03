import React from 'react';
import { useTranslation } from 'next-i18next';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

const perks = [
	{ icon: <LocalShippingOutlinedIcon />, title: 'Nationwide delivery', desc: 'Seoul to Jeju, tracked door to door.' },
	{ icon: <HandymanOutlinedIcon />, title: 'Free assembly', desc: 'Our team sets everything up for you.' },
	{ icon: <ShieldOutlinedIcon />, title: 'Protected payments', desc: 'Pay safely, release when it arrives.' },
	{ icon: <AutorenewRoundedIcon />, title: '30-day returns', desc: 'Changed your mind? Send it back.' },
];

const Perks = () => {
	const { t } = useTranslation('common');
	return (
		<section className={'home-perks'}>
			<div className={'fx-container perks-grid'}>
				{perks.map((perk) => (
					<div key={perk.title} className={'perk'}>
						<span className={'icon'}>{perk.icon}</span>
						<div>
							<strong>{t(perk.title)}</strong>
							<p>{t(perk.desc)}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default Perks;
