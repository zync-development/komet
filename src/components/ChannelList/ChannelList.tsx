import { useAppStore } from "@hooks/useAppStore";
import { ChannelType } from "@spacebarchat/spacebar-api-types/v9";
import { observer } from "mobx-react-lite";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import styled from "styled-components";
import ChannelListItem from "./ChannelListItem";
import Icon from "../Icon";
import { modalController } from "@/controllers/modals";
import { ContextMenuContext } from "@/contexts/ContextMenuContext";
import ChannelListContextMenu from "./ChannelListContextMenu";
import React, { useContext } from "react";

const Container = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	background: var(--background-secondary);
	border-right: 1px solid rgba(255, 255, 255, 0.06);
	padding: 8px 0;

	/* Modern scrollbar styling */
	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		transition: background 0.15s ease;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	/* Firefox scrollbar */
	scrollbar-width: thin;
	scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
`;

const ActionButton = styled.div`
	display: flex;
	align-items: center;
	padding: 10px 16px;
	margin: 8px 12px;
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.15s ease;
	color: white;
	background: var(--primary);

	&:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
	}
`;

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const IconWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	margin-right: 10px;
`;

const ButtonText = styled.span`
	font-size: 13px;
	font-weight: 600;
	user-select: none;
`;

const NoChannelsMessage = styled.div`
	padding: 24px 16px;
	text-align: center;
	color: var(--text-muted);
	font-size: 13px;
	background: var(--background-tertiary);
	margin: 12px;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
`;

function ChannelList() {
	const app = useAppStore();
	const contextMenu = useContext(ContextMenuContext);

	const handleFriendsClick = () => {
		modalController.push({
			type: "add_friend",
		});
	};

	const handleNewMessageClick = () => {
		modalController.push({
			type: "new_message",
		});
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		if (app.activeGuildId !== "@me" && app.activeGuild) {
			e.preventDefault();
			contextMenu.onContextMenu(e, { type: "channel_list", guildId: app.activeGuild.id });
		}
	};

	// Memoize the rowRenderer to prevent unnecessary re-renders
	const rowRenderer = React.useCallback(({ index, key, style }: ListRowProps) => {
		if (!app.activeGuild) return null;
		
		const guildId = app.activeGuild.id;
		const visibleChannels = app.channels.getVisibleChannelsForGuild(guildId);
		const item = visibleChannels[index];
		
		if (!item) return null;
		
		const active = app.activeChannelId === item.id;
		const isCategory = item.type === ChannelType.GuildCategory;

		return (
			<div key={key} style={style}>
				<ChannelListItem
					key={item.id} // Use item.id instead of key for better React reconciliation
					isCategory={isCategory}
					active={active}
					channel={item}
					isCollapsed={app.channels.isCategoryCollapsed(guildId, item.id)}
					onToggleCollapse={isCategory ? () => app.channels.toggleCategoryCollapse(guildId, item.id) : undefined}
				/>
			</div>
		);
	}, [app.activeGuild, app.activeChannelId, app.channels]);

	// Always render the container, but conditionally render content inside
	return (
		<Container onContextMenu={handleContextMenu}>
			{/* If we're in Direct Messages mode, show the Friends and New Message buttons */}
			{app.activeGuildId === "@me" ? (
				<ButtonContainer>
					<ActionButton onClick={handleFriendsClick}>
						<IconWrapper>
							<Icon icon="mdiAccountGroup" size="20px" color="white" />
						</IconWrapper>
						<ButtonText>Friends</ButtonText>
					</ActionButton>
					<ActionButton onClick={handleNewMessageClick}>
						<IconWrapper>
							<Icon icon="mdiMessageText" size="20px" color="white" />
						</IconWrapper>
						<ButtonText>New Message</ButtonText>
					</ActionButton>
				</ButtonContainer>
			) : (
				/* Show regular channel list if we have a guild */
				app.activeGuild ? (
					(() => {
						const guildId = app.activeGuild.id;
						const visibleChannels = app.channels.getVisibleChannelsForGuild(guildId);

						// Debug logging
						console.log('ChannelList Debug:');
						console.log('Guild ID:', guildId);
						console.log('Active Guild:', app.activeGuild);
						console.log('Active Channel ID:', app.activeChannelId);
						console.log('All channels for guild:', app.channels.all.filter(ch => ch.guildId === guildId));
						console.log('Visible channels:', visibleChannels);
						console.log('Channel types:', visibleChannels.map(ch => ({ id: ch.id, name: ch.name, type: ch.type, parentId: ch.parentId })));

						// If no channels, show a message
						if (visibleChannels.length === 0) {
							return (
								<NoChannelsMessage>
									No channels found in this server.
								</NoChannelsMessage>
							);
						}

						return (
							<AutoSizer>
								{({ width, height }) => (
									<List
										height={height}
										overscanRowCount={2}
										rowCount={visibleChannels.length}
										rowHeight={({ index }) => {
											const item = visibleChannels[index];
											if (item.type === ChannelType.GuildCategory) {
												return 40; // category: 32px height + 8px padding
											}
											return 36; // channel: 28px height + 8px padding
										}}
										rowRenderer={rowRenderer}
										width={width}
										key={`${guildId}-${app.activeChannelId}`} // Force re-render when active channel changes
									/>
								)}
							</AutoSizer>
						);
					})()
				) : null
			)}
		</Container>
	);
}

export default observer(ChannelList);
