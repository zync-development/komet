import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { PresenceUpdateStatus } from "@spacebarchat/spacebar-api-types/v9";
import { useEffect, useRef } from "react";

const Container = styled.div`
	position: absolute;
	bottom: 10px;
	left: 10px;
	width: 280px;
	background: var(--background-primary);
	border-radius: 8px;
	padding: 12px;
	display: flex;
	align-items: center;
	z-index: 100;
	animation: fade-in 0.2s ease-out;

	@media (max-width: 767px) {
		left: 8px;
		width: 260px;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
`;

const AvatarWrapper = styled.div`
	margin-right: 10px;
	position: relative;
`;

const UserInfo = styled.div`
	flex: 1;
	margin-right: 12px;
`;

const Username = styled.div`
	font-size: 14px;
	font-weight: var(--font-weight-bold);
	color: var(--text);
	margin-bottom: 1px;
`;

const Status = styled.div`
	font-size: 12px;
	color: var(--text-muted);
`;

const Actions = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
`;

const ActionButton = styled.button`
	background: transparent;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	padding: 6px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-tertiary);
		color: var(--text);
	}

	&.muted {
		color: var(--error);
	}
`;

function ProfileCard() {
	const app = useAppStore();
	const presence = app.presences.get(app.account?.id || '');
	const status = presence?.status || PresenceUpdateStatus.Offline;
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				app.ui.toggleProfileCard();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [app.ui]);

	if (!app.account) return null;

	return (
		<Container ref={ref}>
			<AvatarWrapper>
				<Avatar 
					user={app.account}
					size={32}
					showPresence={true}
					presence={presence}
					statusDotStyle={{
						size: 10,
						borderThickness: 2
					}}
				/>
			</AvatarWrapper>
			<UserInfo>
				<Username>{app.account.username}</Username>
				<Status>{status}</Status>
			</UserInfo>
			<Actions>
				<ActionButton className="muted" title="Mute">
					<Icon icon="mdiMicrophoneOff" size="18px" />
				</ActionButton>
				<ActionButton title="Deafen">
					<Icon icon="mdiHeadphones" size="18px" />
				</ActionButton>
				<ActionButton title="Settings">
					<Icon icon="mdiCog" size="18px" />
				</ActionButton>
				<ActionButton title="Pin">
					<Icon icon="mdiPin" size="18px" />
				</ActionButton>
			</Actions>
		</Container>
	);
}

export default observer(ProfileCard);