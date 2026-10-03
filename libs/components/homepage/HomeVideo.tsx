import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { ProductType } from '../../enums/product.enum';
import { productSearchLink } from '../../utils';

/** YouTube video shown on the home page */
const VIDEO_ID = 'UELVSZC06BE';

/**
 * Muted, looping, autoplaying embed.
 * - mute=1 is required: browsers only autoplay videos without sound
 * - loop=1 works on YouTube embeds only together with playlist=<same id>
 * - youtube-nocookie.com = privacy-enhanced mode (no tracking cookies until the user plays)
 */
const VIDEO_SRC =
	`https://www.youtube-nocookie.com/embed/${VIDEO_ID}` +
	`?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&playsinline=1&rel=0&modestbranding=1`;

const HomeVideo = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'fx-section home-video'}>
			<div className={'fx-container video-layout'}>
				<div className={'copy'}>
					<span className={'eyebrow'}>{t('Watch')}</span>
					<h2>{t('Sofas in a real living room')}</h2>
					<p>{t('See how a modular sofa and sectional change a room — then find similar pieces from our sellers.')}</p>
					<Link href={productSearchLink({ typeList: [ProductType.SOFA, ProductType.CORNER_SOFA] })} className={'fx-btn primary'}>
						{t('Shop sofas')}
						<EastRoundedIcon fontSize="small" />
					</Link>
				</div>
				<div className={'frame'}>
					<iframe
						src={VIDEO_SRC}
						title={t('Sofas in a real living room')}
						loading="lazy"
						allow="autoplay; encrypted-media; picture-in-picture"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
					/>
				</div>
			</div>
		</section>
	);
};

export default HomeVideo;
