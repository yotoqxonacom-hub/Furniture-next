import React, { useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { FaqItem } from '../../data/defaultFaqs';

interface FaqListProps {
	faqs: FaqItem[];
	/** open the first answer initially */
	openFirst?: boolean;
}

/** Q/A accordion shared by Help › FAQ and the home page FAQ section */
const FaqList = ({ faqs, openFirst = false }: FaqListProps) => {
	const [expanded, setExpanded] = useState<string | null>(openFirst ? faqs[0]?._id ?? null : null);

	return (
		<div className={'faq-list'}>
			{faqs.map((faq) => {
				const open = expanded === faq._id;
				return (
					<div key={faq._id} className={`faq-item ${open ? 'open' : ''}`}>
						<button
							type="button"
							className={'question'}
							onClick={() => setExpanded(open ? null : faq._id)}
							aria-expanded={open}
						>
							<span className={'q'}>Q</span>
							<strong>{faq.noticeTitle}</strong>
							<AddRoundedIcon className={'toggle'} />
						</button>
						{open && (
							<div className={'answer'}>
								<span className={'a'}>A</span>
								<p>{faq.noticeContent}</p>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default FaqList;
