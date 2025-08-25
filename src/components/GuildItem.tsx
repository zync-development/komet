import Container from "@components/Container";
import { Floating, FloatingTrigger } from "@components/floating";
import { ContextMenuContext } from "@contexts/ContextMenuContext";
import { useAppStore } from "@hooks/useAppStore";
import useLogger from "@hooks/useLogger";
import { CDNRoutes, ChannelType, ImageFormat } from "@spacebarchat/spacebar-api-types/v9";
import { Guild } from "@structures";
import { Permissions, REST } from "@utils";
import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SidebarPill, { PillType } from "./SidebarPill";

export const GuildSidebarListItem = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	cursor: pointer;
`;

const Wrapper = styled(Container)<{ active?: boolean; hasImage?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 52px;
	height: 52px;
	border-radius: ${(props) => (props.active ? "16px" : "14px")};
	background-color: ${(props) =>
		props.hasImage ? "transparent" : props.active ? "var(--primary)" : "var(--background-tertiary)"};
	border: 1px solid ${(props) => (props.active ? "rgba(88, 101, 242, 0.3)" : "rgba(255, 255, 255, 0.06)")};
	overflow: hidden;

	img {
		width: 52px;
		height: 52px;
		border-radius: 14px;
	}
`;

interface Props {
	guild: Guild;
	active?: boolean;
}

/**
 * List item for use in the guild sidebar
 */
function GuildItem({ guild, active }: Props) {
	const logger = useLogger("GuildItem");
	const app = useAppStore();
	const navigate = useNavigate();
	const contextMenu = useContext(ContextMenuContext);

	const [pillType, setPillType] = React.useState<PillType>("none");
	const [isHovered, setHovered] = React.useState(false);

	React.useEffect(() => {
		if (app.activeChannelId && app.activeGuildId === guild.id) return setPillType("active");
		else if (isHovered) return setPillType("hover");
		// TODO: unread
		else return setPillType("none");
	}, [app.activeChannelId, isHovered]);

	const doNavigate = () => {
		const channel = guild.channels.find((x) => {
			const permission = Permissions.getPermission(app.account!.id, guild, x);
			return permission.has("ViewChannel") && x.type !== ChannelType.GuildCategory;
		});
		navigate(`/channels/${guild.id}${channel ? `/${channel.id}` : ""}`);
	};

	return (
		<GuildSidebarListItem
			ref={contextMenu.setReferenceElement}
			onContextMenu={(e) => contextMenu.onContextMenu(e, { type: "guild", guild })}
		>
			<SidebarPill type={pillType} />
			<Floating
				placement="right"
				type="tooltip"
				offset={20}
				props={{
					content: <span>{guild.name}</span>,
				}}
			>
				<FloatingTrigger>
					<Wrapper
						onClick={doNavigate}
						active={active}
						hasImage={!!guild?.icon}
						onMouseEnter={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}
					>
						{guild.icon ? (
							<img
								src={REST.makeCDNUrl(CDNRoutes.guildIcon(guild.id, guild?.icon, ImageFormat.PNG))}
								width={48}
								height={48}
								loading="lazy"
							/>
						) : (
							<span
								style={{
									fontSize: "18px",
									fontWeight: "bold",
									cursor: "pointer",
								}}
							>
								{guild?.acronym}
							</span>
						)}
					</Wrapper>
				</FloatingTrigger>
			</Floating>
		</GuildSidebarListItem>
	);
}

export default observer(GuildItem);
