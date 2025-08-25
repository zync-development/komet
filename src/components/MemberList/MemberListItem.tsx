import Avatar from "@components/Avatar";
import { ContextMenuContext } from "@contexts/ContextMenuContext";
import { useAppStore } from "@hooks/useAppStore";
import { PresenceUpdateStatus } from "@spacebarchat/spacebar-api-types/v9";
import { GuildMember } from "@structures";
import { observer } from "mobx-react-lite";
import { useContext } from "react";
import styled from "styled-components";
import { modalController } from "@/controllers/modals";

const ListItem = styled.div<{ isCategory?: boolean }>`
	padding: ${(props) => (props.isCategory ? "16px 8px 0 0" : "1px 8px 0 0")};
	cursor: pointer;
	user-select: none;
`;

const Container = styled.div`
	max-width: 224px;
	background-color: transparent;
	box-sizing: border-box;
	padding: 1px 0;
	border-radius: 4px;

	&:hover {
		background-color: var(--background-primary-alt);
	}
`;

const Wrapper = styled.div<{ offline?: boolean }>`
	display: flex;
	align-items: center;
	border-radius: 4px;
	height: 42px;
	padding: 0 8px;
	opacity: ${(props) => (props.offline ? 0.5 : 1)};
`;

const Text = styled.span<{ color?: string }>`
	font-size: 16px;
	font-weight: var(--font-weight-regular);
	white-space: nowrap;
	color: ${(props) => props.color ?? "var(--text-secondary)"};
`;

const TextWrapper = styled.div`
	min-width: 0;
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const AvatarWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
	position: relative;
`;

const CrownIndicator = styled.div`
	position: absolute;
	top: -2px;
	right: -2px;
	width: 16px;
	height: 16px;
	background: linear-gradient(135deg, #ffd700, #ffed4e);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid var(--background-secondary);
	box-shadow: 0 2px 6px rgba(255, 215, 0, 0.4);
	z-index: 10;
	
	&::before {
		content: "👑";
		font-size: 10px;
		line-height: 1;
	}
`;

interface Props {
	item: GuildMember;
}

function MemberListItem({ item }: Props) {
	const app = useAppStore();
	const presence = app.presences.get(item.user!.id);
	const contextMenu = useContext(ContextMenuContext);

	// Check if this user is the server owner
	const isOwner = item.guild.ownerId === item.user?.id;

	const handleClick = () => {
		modalController.push({
			type: "user_profile",
			user: item.user!,
			member: item,
		});
	};

	return (
		<ListItem
			key={item.user?.id}
			ref={contextMenu.setReferenceElement}
			onClick={handleClick}
			onContextMenu={(e) => contextMenu.onContextMenu(e, { type: "user", user: item.user!, member: item })}
		>
			<Container>
				<Wrapper offline={presence?.status === PresenceUpdateStatus.Offline}>
					<AvatarWrapper>
						<Avatar user={item.user!} size={32} presence={presence} showPresence onClick={null} />
						{isOwner && <CrownIndicator />}
					</AvatarWrapper>
					<TextWrapper>
						<Text color={item.roleColor}>{item.nick ?? item.user?.username}</Text>
					</TextWrapper>
				</Wrapper>
			</Container>
		</ListItem>
	);
}

export default observer(MemberListItem);
