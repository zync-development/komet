import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import Avatar from "./Avatar";
import { PresenceUpdateStatus } from "@spacebarchat/spacebar-api-types/v9";

const Container = styled.div`
	width: 52px;
	height: 52px;
	border-radius: 14px;
	background-color: var(--background-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s ease;
	border: 1px solid rgba(255, 255, 255, 0.06);
	cursor: pointer;
	position: relative;

	&:hover {
		border-radius: 16px;
		background-color: var(--background-secondary);
		transform: translateY(-1px);
		border-color: rgba(255, 255, 255, 0.1);
	}
`;

function UserPanel() {
	const app = useAppStore();
	const presence = app.presences.get(app.account?.id || '');
	const status = presence?.status || PresenceUpdateStatus.Offline;

	const handleClick = () => {
		app.ui.toggleProfileCard();
	};

	if (!app.account) return null;

	return (
		<Container onClick={handleClick}>
			<Avatar
				user={app.account}
				size={32}
				showPresence={true}
				presence={presence}
				statusDotStyle={{
					size: 12,
					borderThickness: 2
				}}
			/>
		</Container>
	);
}

export default observer(UserPanel);