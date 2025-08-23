import { modalController } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import styled from "styled-components";
import GuildItem, { GuildSidebarListItem } from "./GuildItem";
import SidebarAction from "./SidebarAction";
import { useMobile } from "@/contexts/MobileContext";

const Container = styled.div`
	display: flex;
	flex: 0 0 72px;
	margin: 4px 0 0 0;
	position: relative;

	@media (max-width: 767px) {
		flex: 0 0 60px;
		margin: 2px 0 0 0;
		background: var(--background-primary);
		border-right: 1px solid var(--background-tertiary);
	}

	.ReactVirtualized__List {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */

		&::-webkit-scrollbar {
			width: 0;
			height: 0;
		}
	}
`;

const MobileTouchIndicator = styled.div`
	position: absolute;
	top: 50%;
	right: -2px;
	transform: translateY(-50%);
	width: 4px;
	height: 40px;
	background: var(--brand-560);
	border-radius: 2px;
	opacity: 0.7;
	z-index: 15;
	pointer-events: none;
	display: none;

	@media (max-width: 767px) {
		display: block;
	}
`;

const Divider = styled.div`
	height: 2px;
	width: 32px;
	border-radius: 1px;
	background-color: var(--text-disabled);
`;

function GuildSidebar() {
	const app = useAppStore();
	const { isMobile } = useMobile();

	const navigate = useNavigate();
	const { all } = app.guilds;
	const itemCount = all.length + 3; // add the home button, divider, and add server button

	const rowRenderer = ({ index, key, style }: ListRowProps) => {
		let element: React.ReactNode;
		if (index === 0) {
			// home button
			element = (
				<SidebarAction
					key="home"
					tooltip="Home"
					icon={{
						icon: "mdiHome",
						size: "24px",
					}}
					action={() => navigate("/channels/@me")}
					margin={false}
					active={app.activeGuildId === "@me"}
				/>
			);
		} else if (index === 1) {
			// divider
			element = (
				<GuildSidebarListItem>
					<Divider key="divider" />
				</GuildSidebarListItem>
			);
		} else if (index === itemCount - 1) {
			// add server button/any other end items
			element = (
				<SidebarAction
					key="add-server"
					tooltip="Add Server"
					icon={{
						icon: "mdiPlus",
						size: "24px",
						color: "var(--success)",
					}}
					action={() => {
						modalController.push({
							type: "add_server",
						});
					}}
					margin={false}
					disablePill
					useGreenColorScheme
				/>
			);
		} else {
			// regular guild item
			const guild = all[index - 2];
			element = <GuildItem key={key} guild={guild} />;
		}

		return <div key={key} style={style}>{element}</div>;
	};

	return (
		<Container>
			<AutoSizer>
				{({ width, height }) => (
					<List
						height={height}
						overscanRowCount={2}
						rowCount={itemCount}
						rowHeight={({ index }) => {
							if (index === 1) return 8; // divider
							return 56; // item is 48 + 8 top margin
						}}
						rowRenderer={rowRenderer}
						width={width}
					/>
				)}
			</AutoSizer>
		</Container>
	);
}

export default observer(GuildSidebar);
