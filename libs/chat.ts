import { chatOpenVar, chatTabVar, chatTargetVar, userVar } from '../apollo/store';
import { sweetLoginConfirmAlert } from './sweetAlert';
import { translate } from './i18n';

interface ChatPartner {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberType?: string;
}

/** Opens the chat widget on a private conversation with the given member */
export const openChatWith = async (member: ChatPartner | null | undefined, onLogin?: () => void) => {
	if (!member?._id) return;
	const user = userVar();
	if (!user?._id) {
		const confirmed = await sweetLoginConfirmAlert(translate('Please login to send a message'));
		if (confirmed && onLogin) onLogin();
		return;
	}
	if (user._id === member._id) return;
	chatTargetVar({
		_id: member._id,
		memberNick: member.memberNick,
		memberImage: member.memberImage,
		memberType: member.memberType,
	});
	chatTabVar('inbox');
	chatOpenVar(true);
};
