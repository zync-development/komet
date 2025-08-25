import BannerRenderer from "@/controllers/banners/BannerRenderer";
import ChannelSidebar from "@components/ChannelSidebar";
import ContainerComponent from "@components/Container";
import ErrorBoundary from "@components/ErrorBoundary";
import GuildSidebar from "@components/GuildSidebar";
import Chat from "@components/messaging/Chat";
import SwipeableLayout from "@components/SwipeableLayout";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useMobile } from "@/contexts/MobileContext";

const Container = styled(ContainerComponent)`
	display: flex;
	flex: 1;
	flex-direction: column;
	
	@media (max-width: 767px) {
		padding-top: 60px;
		padding-bottom: 80px;
	}
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	flex: 1;
	overflow: hidden;
`;

function LeftPanel() {
	return (
		<div
			style={{
				display: "flex",
				flex: 1,
			}}
		>
			<ChannelSidebar />
		</div>
	);
}

function ChannelPage() {
	const app = useAppStore();
	const { isMobile } = useMobile();

	const { guildId, channelId } = useParams<{ guildId: string; channelId: string }>();

	React.useEffect(() => {
		app.setActiveGuildId(guildId);
		app.setActiveChannelId(channelId);
	}, [guildId, channelId]);

	if (isMobile) {
		return (
			<Container>
				<BannerRenderer />
				<SwipeableLayout leftChildren={<LeftPanel />}>
					<ErrorBoundary section="component">
						<Chat />
					</ErrorBoundary>
				</SwipeableLayout>
			</Container>
		);
	}

	return (
		<Container>
			<BannerRenderer />
			<Wrapper>
				<GuildSidebar />
				<ChannelSidebar />
				<ErrorBoundary section="component">
					<Chat />
				</ErrorBoundary>
			</Wrapper>
		</Container>
	);
}

export default observer(ChannelPage);
