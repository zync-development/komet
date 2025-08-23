import { useAppStore } from "@hooks/useAppStore";
import { ChannelType } from "@spacebarchat/spacebar-api-types/v9";
import { observer } from "mobx-react-lite";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import styled from "styled-components";
import ChannelListItem from "./ChannelListItem";
import Icon from "../Icon";
import { modalController } from "@/controllers/modals";

const Container = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
`;

const FriendsButton = styled.div`
	display: flex;
	align-items: center;
	padding: 8px 16px;
	margin: 2px 8px;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
	color: white;

	&:hover {
		background: var(--background-secondary-highlight);
	}

	&:active {
		background: var(--background-secondary-alt);
	}
`;

const IconWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	margin-right: 12px;
`;

const ButtonText = styled.span`
	font-size: 14px;
	font-weight: var(--font-weight-medium);
	user-select: none;
`;

function ChannelList() {
	const app = useAppStore();

	const handleFriendsClick = () => {
		modalController.push({
			type: "add_friend",
		});
	};

	// Always render the container, but conditionally render content inside
	return (
		<Container>
			{/* If we're in Direct Messages mode, show just the Friends button */}
			{app.activeGuildId === "@me" ? (
				<FriendsButton onClick={handleFriendsClick}>
					<IconWrapper>
						<Icon icon="mdiAccountGroup" size="20px" color="white" />
					</IconWrapper>
					<ButtonText>Friends</ButtonText>
				</FriendsButton>
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
						console.log('All channels for guild:', app.channels.all.filter(ch => ch.guildId === guildId));
						console.log('Visible channels:', visibleChannels);
						console.log('Channel types:', visibleChannels.map(ch => ({ id: ch.id, name: ch.name, type: ch.type, parentId: ch.parentId })));

						// If no channels, show a message
						if (visibleChannels.length === 0) {
							return (
								<div style={{
									padding: '20px',
									textAlign: 'center',
									color: 'var(--text-muted)',
									fontSize: '14px'
								}}>
									No channels found in this server.
								</div>
							);
						}

						const toggleCategory = (categoryId: string) => {
							app.channels.toggleCategoryCollapse(guildId, categoryId);
						};

						const rowRenderer = ({ index, key, style }: ListRowProps) => {
							const item = visibleChannels[index];
							const active = app.activeChannelId === item.id;
							const isCategory = item.type === ChannelType.GuildCategory;

							return (
								<div key={key} style={style}>
									<ChannelListItem
										key={key}
										isCategory={isCategory}
										active={active}
										channel={item}
										isCollapsed={app.channels.isCategoryCollapsed(guildId, item.id)}
										onToggleCollapse={isCategory ? () => toggleCategory(item.id) : undefined}
									/>
								</div>
							);
						};

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
												return 44;
											}
											return 33;
										}}
										rowRenderer={rowRenderer}
										width={width}
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
