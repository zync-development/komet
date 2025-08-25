import { modalController } from "@/controllers/modals";
import { Floating, FloatingTrigger } from "@components/floating";
import Icon from "@components/Icon";
import SidebarPill from "@components/SidebarPill";
import { ContextMenuContext } from "@contexts/ContextMenuContext";
import { useAppStore } from "@hooks/useAppStore";
import { Channel } from "@structures";
import { Permissions } from "@utils";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const ListItem = styled.div<{ isCategory?: boolean }>`
	padding: ${(props) => (props.isCategory ? "4px 8px" : "2px 8px")};
	cursor: pointer;
`;

const Wrapper = styled.div<{ isCategory?: boolean; active?: boolean }>`
	margin-left: ${(props) => (props.isCategory ? "0" : "16px")};
	height: ${(props) => (props.isCategory ? "32px" : "28px")};
	border-radius: 8px;
	align-items: center;
	display: flex;
	padding: ${(props) => (props.isCategory ? "0 12px" : "0 12px")};
	background-color: ${(props) => (props.active ? "rgba(88, 101, 242, 0.15)" : "transparent")};
	justify-content: space-between;
	transition: all 0.15s ease;
	border: 1px solid ${(props) => (props.active ? "rgba(88, 101, 242, 0.2)" : "transparent")};

	&:hover {
		background-color: ${(props) => (props.isCategory ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.06)")};
	}
`;

const Text = styled.span<{ isCategory?: boolean; hovered?: boolean }>`
	font-size: ${(props) => (props.isCategory ? "13px" : "14px")};
	font-weight: ${(props) => (props.isCategory ? "600" : "500")};
	white-space: nowrap;
	color: ${(props) => (props.isCategory && props.hovered ? "var(--text)" : "var(--text-secondary)")};
	user-select: none;
	transition: color 0.15s ease;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const ChannelContent = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8px;
	flex: 1;
	min-width: 0;
`;

const ChannelIcon = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;
	color: var(--text-secondary);
	transition: color 0.15s ease;
	flex-shrink: 0;
`;

const CategoryIcon = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 14px;
	height: 14px;
	color: var(--text-secondary);
	transition: all 0.15s ease;
	flex-shrink: 0;
	
	&:hover {
		color: var(--text);
	}
`;

const CreateChannelButton = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.1);
	cursor: pointer;
	transition: all 0.15s ease;
	margin-left: 8px;
	flex-shrink: 0;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
	}

	&:active {
		transform: scale(0.95);
	}
`;

interface Props {
	channel: Channel;
	isCategory: boolean;
	active: boolean;
	isCollapsed?: boolean;
	onToggleCollapse?: (channelId: string) => void;
}

function ChannelListItem({ channel, isCategory, active, isCollapsed, onToggleCollapse }: Props) {
	const app = useAppStore();
	const navigate = useNavigate();
	const contextMenu = useContext(ContextMenuContext);

	const [wrapperHovered, setWrapperHovered] = React.useState(false);
	const [createChannelHovered, setCreateChannelHovered] = React.useState(false);
	const [createChannelDown, setChannelCreateDown] = React.useState(false);
	const [hasCreateChannelPermission, setHasCreateChannelPermission] = React.useState(false);

	// Debug logging for active state
	React.useEffect(() => {
		if (active) {
			console.log(`ChannelListItem: ${channel.name} is now ACTIVE`);
		}
	}, [active, channel.name]);

	useEffect(() => {
		if (!isCategory) return;

		const permission = Permissions.getPermission(app.account!.id, channel.guild, channel);
		const hasPermission = permission.has("ManageChannel");
		setHasCreateChannelPermission(hasPermission);
	}, [channel, app.account]);

	const handleClick = () => {
		if (isCategory && onToggleCollapse) {
			onToggleCollapse(channel.id);
			return;
		}

		// prevent navigating to non-text channels
		if (!channel.isTextChannel) return;

		console.log(`Navigating to channel: ${channel.name} (${channel.id})`);
		navigate(`/channels/${channel.guildId}/${channel.id}`);
	};

	return (
		<ListItem
			key={channel.id}
			isCategory={isCategory}
			onClick={handleClick}
			ref={contextMenu.setReferenceElement}
			onContextMenu={(e) => contextMenu.onContextMenu(e, { type: "channel", channel })}
		>
			<Wrapper
				isCategory={isCategory}
				active={active}
				onMouseOver={() => setWrapperHovered(true)}
				onMouseOut={() => setWrapperHovered(false)}
			>
				<ChannelContent>
					<SidebarPill type={active ? "active" : channel.hasUnread ? "unread" : "none"} />
					{channel.channelIcon && !isCategory && (
						<ChannelIcon>
							<Icon
								icon={channel.channelIcon}
								size="16px"
								color="var(--text-secondary)"
							/>
						</ChannelIcon>
					)}
					{isCategory && (
						<CategoryIcon>
							<Icon
								icon={isCollapsed ? "mdiChevronRight" : "mdiChevronDown"}
								size="12px"
								color={wrapperHovered ? "var(--text)" : "var(--text-secondary)"}
							/>
						</CategoryIcon>
					)}
					<Text isCategory={isCategory} hovered={wrapperHovered}>
						{channel.name}
					</Text>
				</ChannelContent>
				{isCategory && hasCreateChannelPermission && (
					<Floating
						placement="top"
						type="tooltip"
						offset={10}
						props={{
							content: <span>Create Channel</span>,
						}}
					>
						<FloatingTrigger>
							<CreateChannelButton
								onMouseOver={() => setCreateChannelHovered(true)}
								onMouseOut={() => setCreateChannelHovered(false)}
								onMouseDown={() => setChannelCreateDown(true)}
								onMouseUp={() => setChannelCreateDown(false)}
								onClick={() => {
									if (!channel.guild) {
										console.warn("No guild found for channel", channel);
										return;
									}

									modalController.push({
										type: "create_channel",
										guild: channel.guild,
										category: channel,
									});
								}}
							>
								<Icon
									icon="mdiPlus"
									size="18px"
									color={
										createChannelDown
											? "var(--text-header)"
											: createChannelHovered
												? "var(--text)"
												: "var(--text-secondary)"
									}
								/>
							</CreateChannelButton>
						</FloatingTrigger>
					</Floating>
				)}
			</Wrapper>
		</ListItem>
	);
}

export default observer(ChannelListItem);
