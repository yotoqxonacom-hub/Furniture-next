import React, { useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Modal } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { CREATE_REPORT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { ReportGroup, ReportReason, reportReasonLabel, reportReasonsByGroup } from '../../enums/report.enum';
import { sweetErrorHandling, sweetLoginConfirmAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface ReportModalProps {
	open: boolean;
	onClose: () => void;
	reportGroup: ReportGroup;
	reportRefId: string;
	/** shown in the title, e.g. product title or seller nick */
	targetName?: string;
}

const ReportModal = ({ open, onClose, reportGroup, reportRefId, targetName }: ReportModalProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const reasons = reportReasonsByGroup[reportGroup] ?? [ReportReason.OTHER];
	const [reason, setReason] = useState<ReportReason>(reasons[0]);
	const [desc, setDesc] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createReport] = useMutation(CREATE_REPORT);

	/** LIFECYCLES **/
	useEffect(() => {
		if (open) {
			setReason(reasons[0]);
			setDesc('');
		}
	}, [open, reportGroup]);

	/** HANDLERS **/
	const submitHandler = async () => {
		try {
			if (!user?._id) {
				onClose();
				const confirmed = await sweetLoginConfirmAlert(t('Please login to send a report'));
				if (confirmed) await router.push('/account/join');
				return;
			}
			if (reason === ReportReason.OTHER && desc.trim().length < 5) {
				throw new Error(t('Please describe the problem (at least 5 characters)'));
			}
			setSubmitting(true);
			await createReport({
				variables: {
					input: {
						reportGroup,
						reportReason: reason,
						reportRefId,
						...(desc.trim() ? { reportDesc: desc.trim().slice(0, 500) } : {}),
					},
				},
			});
			onClose();
			await sweetTopSmallSuccessAlert(t('Report sent. Our team will review it.'), 1600);
		} catch (err: any) {
			const message: string = err?.message ?? '';
			// backend allows one report per member per target
			if (message.includes('Create failed')) {
				onClose();
				await sweetErrorHandling(new Error(t('You have already reported this')));
			} else if (message.includes('Not Allowed')) {
				onClose();
				await sweetErrorHandling(new Error(t('You cannot report your own listing')));
			} else await sweetErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} aria-labelledby="report-title">
			<div className={'fx-modal'}>
				<div className={'modal-head'}>
					<div>
						<h3 id="report-title">
							{reportGroup === ReportGroup.MEMBER
								? t('Report seller')
								: reportGroup === ReportGroup.ARTICLE
								? t('Report article')
								: t('Report product')}
						</h3>
						<p>
							{targetName ? `“${targetName}” · ` : ''}
							{t('Tell us what went wrong. Reports are confidential.')}
						</p>
					</div>
					<button className={'fx-icon-btn'} onClick={onClose} aria-label={'Close'}>
						<CloseRoundedIcon />
					</button>
				</div>

				<div className={'reason-list'}>
					{reasons.map((value) => (
						<label key={value} className={reason === value ? 'checked' : ''}>
							<input type="radio" name="reason" checked={reason === value} onChange={() => setReason(value)} />
							{t(reportReasonLabel[value])}
						</label>
					))}
				</div>

				<div className={'fx-field'} style={{ marginTop: 16 }}>
					<label htmlFor="report-desc">
						{t('Details')} {reason !== ReportReason.OTHER && <span style={{ fontWeight: 500 }}>({t('optional')})</span>}
					</label>
					<textarea
						id="report-desc"
						maxLength={500}
						value={desc}
						onChange={(e) => setDesc(e.target.value)}
						placeholder={t('What happened? Order date, what you expected, what you received…')}
					/>
					<span style={{ fontSize: 12, color: '#a69c90', alignSelf: 'flex-end' }}>{desc.length}/500</span>
				</div>

				<div className={'modal-foot'}>
					<button className={'fx-btn outline'} onClick={onClose}>
						{t('Cancel')}
					</button>
					<button className={'fx-btn primary'} onClick={submitHandler} disabled={submitting}>
						{submitting ? t('Sending…') : t('Send report')}
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default ReportModal;
