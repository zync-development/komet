import MemberList from "@components/MemberList/MemberList";
import Button from "@components/Button";
import { modalController } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import useLogger from "@hooks/useLogger";
import { Channel, Guild } from "@structures";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import styled from "styled-components";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";

/**
 * Wrapps chat and member list into a row
 */
const WrapperOne = styled.div`
	display: flex;
	flex-direction: row;
	flex: 1 1 auto;
	overflow: hidden;
`;

/**
 * Wraps the message list, header, and input into a column
 */
const WrapperTwo = styled.div`
	display: flex;
	flex-direction: column;
	background-color: var(--background-primary-alt);
	flex: 1 1 auto;
	overflow: hidden;

	@media (max-width: 767px) {
		background-color: var(--background-primary);
	}
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	position: relative;
	overflow: hidden;
`;

interface Props {
	channel?: Channel;
	guild?: Guild;
	channelId?: string;
	guildId?: string;
}

interface Props2 {
	channel: Channel;
	guild: Guild;
}

function ChatContent({ channel, guild }: Props2) {
	const app = useAppStore();
	const readstate = app.readStateStore.get(channel.id);

	useEffect(() => {
		channel.markAsRead();
	}, [channel, guild]);

	return (
		<Container>
			<MessageList guild={guild} channel={channel} before={readstate?.lastMessageId} />
			<MessageInput channel={channel} guild={guild} />
			<TypingIndicator channel={channel} />
		</Container>
	);
}

const Content = observer((props: Props2) => {
	const { memberListVisible } = useAppStore();

	return (
		<WrapperOne>
			<ChatContent {...props} />
			{memberListVisible && <MemberList />}
		</WrapperOne>
	);
});

/**
 * Main component for rendering channel messages
 */
function Chat() {
	const app = useAppStore();
	const logger = useLogger("Messages");
	const { activeChannel, activeGuild, activeChannelId, activeGuildId } = app;

	React.useEffect(() => {
		if (!activeChannel || !activeGuild || activeChannelId === "@me") return;

		runInAction(() => {
			app.gateway.onChannelOpen(activeGuildId!, activeChannelId!);
		});
	}, [activeChannel, activeGuild]);

	if (activeGuildId && activeGuildId === "@me") {
		return (
			<WrapperTwo>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
						padding: "2rem",
						textAlign: "center",
						userSelect: "none",
					}}
				>
					<div
						style={{
							fontSize: "3rem",
							marginBottom: "1rem",
							animation: "wave 2s ease-in-out infinite",
						}}
					>
						👋
					</div>
					<h1
						style={{
							fontSize: "2.5rem",
							fontWeight: "bold",
							color: "var(--text)",
							margin: "0 0 0.5rem 0",
						}}
					>
						Welcome back, {app.account?.username || "User"}!
					</h1>
					<p
						style={{
							fontSize: "1.1rem",
							color: "var(--text-muted)",
							margin: "0 0 2rem 0",
							opacity: 0.8,
						}}
					>
						Ready to chat with your friends?
						<br />
						Please note that this app is in a very early stage of development. So many features are not yet implemented.
						<br />
						We are working hard on fixing many bugs and adding new features.
						
						<br />
						The files for this project will be on github soon also docs on how you can host your own server and version of this app.
					</p>
					<style>
						{`
							@keyframes wave {
								0%, 100% { transform: rotate(0deg); }
								25% { transform: rotate(20deg); }
								75% { transform: rotate(-10deg); }
							}
						`}
					</style>
				</div>
			</WrapperTwo>
		);
	}

	if (!activeGuild || !activeChannel) {
		return (
			<WrapperTwo>
				<span
					style={{
						color: "var(--text-secondary)",
						fontSize: "1.5rem",
						margin: "auto",
					}}
				>
					Unknown Guild or Channel
				</span>
			</WrapperTwo>
		);
	}

			if (!activeChannel.hasPermission("ViewChannel")) {
		return (
			<WrapperTwo>
				<span
					style={{
						color: "var(--text-secondary)",
						fontSize: "1.5rem",
						margin: "auto",
					}}
				>
					You do not have permission to view this channel
				</span>
			</WrapperTwo>
		);
	}

	return (
		<WrapperTwo>
			<ChatHeader channel={activeChannel} />
			<Content channel={activeChannel} guild={activeGuild} />
		</WrapperTwo>
	);
}

export default observer(Chat);
