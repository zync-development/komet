import {
	APIGuildMember,
	APIMessage,
	ChannelType,
	GatewayActivity,
	GatewayChannelCreateDispatchData,
	GatewayChannelDeleteDispatchData,
	GatewayChannelUpdateDispatchData,
	GatewayCloseCodes,
	GatewayDispatchEvents,
	GatewayDispatchPayload,
	GatewayGuild,
	GatewayGuildCreateDispatchData,
	GatewayGuildDeleteDispatchData,
	GatewayGuildMemberAddDispatchData,
	GatewayGuildMemberListUpdateDispatchData,
	GatewayGuildMemberRemoveDispatchData,
	GatewayGuildMemberUpdateDispatchData,
	GatewayGuildModifyDispatchData,
	GatewayHeartbeat,
	GatewayHelloData,
	GatewayIdentify,
	GatewayLazyRequest,
	GatewayLazyRequestData,
	GatewayMessageCreateDispatchData,
	GatewayMessageDeleteBulkDispatchData,
	GatewayMessageDeleteDispatchData,
	GatewayMessageUpdateDispatchData,
	GatewayOpcodes,
	GatewayPresenceUpdateDispatchData,
	GatewayReadyDispatchData,
	GatewayReceivePayload,
	GatewaySendPayload,
	GatewayTypingStartDispatchData,
	GatewayUserUpdateDispatchData,
	PresenceUpdateStatus,
	Snowflake,
} from "@spacebarchat/spacebar-api-types/v9";
import { debounce, Logger } from "@utils";
import { action, makeAutoObservable, observable, runInAction } from "mobx";
import AppStore from "./AppStore";

const GATEWAY_VERSION = "9";
const GATEWAY_ENCODING = "json";
const RECONNECT_TIMEOUT = 10000; // start at 10 seconds, doubles each time

interface GatewaySession {
	active: boolean;
	activities: GatewayActivity[];
	client_info: {
		client?: string;
		os?: string;
		version?: number;
	};
	session_id: string;
	status: PresenceUpdateStatus;
}

export default class GatewayConnectionStore {
	private readonly logger: Logger = new Logger("GatewayConnectionStore");
	@observable private socket: WebSocket | null = null;
	@observable public sessionId: string | null = null;
	@observable public session: GatewaySession | undefined;
	@observable public readyState: number = WebSocket.CLOSED;

	private app: AppStore;
	private url?: string;
	private heartbeatInterval: number | null = null;
	private heartbeater: NodeJS.Timeout | null = null;
	private initialHeartbeatTimeout: NodeJS.Timeout | null = null;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	private dispatchHandlers: Map<GatewayDispatchEvents, Function> = new Map();
	private connectionStartTime?: number;
	private identifyStartTime?: number;
	private sequence = 0;
	private heartbeatAck = true;
	private lazyRequestChannels = new Map<string, Snowflake[]>(); // guild, channels
	private reconnectTimeout = 0;

	constructor(app: AppStore) {
		this.app = app;

		makeAutoObservable(this);
	}

	/**
	 * Starts connection to gateway
	 */
	@action
	async connect(url: string) {
		if (!this.url) {
			const newUrl = new URL(url);
			newUrl.searchParams.append("v", GATEWAY_VERSION);
			newUrl.searchParams.append("encoding", GATEWAY_ENCODING);
			this.url = newUrl.href;
		}
		this.logger.debug(`[Connect] ${this.url}`);
		this.connectionStartTime = Date.now();
		this.socket = new WebSocket(this.url);
		this.readyState = WebSocket.CONNECTING;

		this.setupListeners();
		this.setupDispatchHandler();
	}

	@action
	async disconnect(code?: number, reason?: string) {
		if (!this.socket) {
			return;
		}

		this.readyState = WebSocket.CLOSING;
		this.logger.debug(`[Disconnect] ${this.url}`);
		this.socket?.close(code, reason);
	}
	reconnecting = false;
	startReconnect() {
		if (this.reconnecting) return;
		this.reconnecting = true;
		setTimeout(() => {
			this.reconnecting = false;
			this.logger.debug("Starting reconnect...");
			this.connect(this.url!);
		}, this.reconnectTimeout);
	}

	private setupListeners() {
		this.socket!.onopen = this.onopen;
		this.socket!.onmessage = this.onmessage;
		this.socket!.onerror = this.onerror;
		this.socket!.onclose = this.onclose;
	}

	private setupDispatchHandler() {
		this.dispatchHandlers.set(GatewayDispatchEvents.Ready, this.onReady);
		this.dispatchHandlers.set(GatewayDispatchEvents.Resumed, this.onResumed);
		this.dispatchHandlers.set(GatewayDispatchEvents.GuildCreate, this.onGuildCreate);
		this.dispatchHandlers.set(GatewayDispatchEvents.GuildUpdate, this.onGuildUpdate);
		this.dispatchHandlers.set(GatewayDispatchEvents.GuildDelete, this.onGuildDelete);
		this.dispatchHandlers.set(GatewayDispatchEvents.GuildMemberAdd, this.onGuildMemberAdd);
		this.dispatchHandlers.set(GatewayDispatchEvents.GuildMemberRemove, this.onGuildMemberRemove);
		this.dispatchHandlers.set(GatewayDispatchEvents.GuildMemberUpdate, this.onGuildMemberUpdate);
		this.dispatchHandlers.set(GatewayDispatchEvents.GuildMemberListUpdate, this.onGuildMemberListUpdate);

		this.dispatchHandlers.set(GatewayDispatchEvents.ChannelCreate, this.onChannelCreate);
		this.dispatchHandlers.set(GatewayDispatchEvents.ChannelUpdate, this.onChannelUpdate);
		this.dispatchHandlers.set(GatewayDispatchEvents.ChannelDelete, this.onChannelDelete);
		// @ts-expect-error missing event in typings
		this.dispatchHandlers.set("MESSAGE_ACK", this.onMessageAck);

		this.dispatchHandlers.set(GatewayDispatchEvents.MessageCreate, this.onMessageCreate);
		this.dispatchHandlers.set(GatewayDispatchEvents.MessageUpdate, this.onMessageUpdate);
		this.dispatchHandlers.set(GatewayDispatchEvents.MessageDelete, this.onMessageDelete);
		this.dispatchHandlers.set(GatewayDispatchEvents.MessageDeleteBulk, this.onMessageBulkDelete);

		this.dispatchHandlers.set(GatewayDispatchEvents.PresenceUpdate, this.onPresenceUpdate);

		this.dispatchHandlers.set(GatewayDispatchEvents.TypingStart, this.onTypingStart);

		this.dispatchHandlers.set(GatewayDispatchEvents.UserUpdate, this.onUserUpdate);
	}

	private onopen = () => {
		this.logger.debug(`[Connected] ${this.url} (took ${Date.now() - this.connectionStartTime!}ms)`);
		this.readyState = WebSocket.OPEN;
		this.reconnectTimeout = 0;

		this.handleIdentify();
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private onmessage = (e: MessageEvent<any>) => {
		const payload: GatewayReceivePayload = JSON.parse(e.data);
		if (payload.op !== GatewayOpcodes.Dispatch) {
			this.logger.debug(`[Gateway] -> ${payload.op}`, payload);
		}

		switch (payload.op) {
			case GatewayOpcodes.Dispatch:
				this.handleDispatch(payload);
				break;
			case GatewayOpcodes.Heartbeat:
				this.sendHeartbeat();
				break;
			case GatewayOpcodes.Reconnect:
				this.handleReconnect();
				break;
			case GatewayOpcodes.InvalidSession:
				this.handleInvalidSession(payload.d);
				break;
			case GatewayOpcodes.Hello:
				this.handleHello(payload.d);
				break;
			case GatewayOpcodes.HeartbeatAck:
				this.handleHeartbeatAck();
				break;
			default:
				this.logger.debug("Received unknown opcode");
				break;
		}
	};

	private onerror = (e: Event) => {
		this.logger.error("[Gateway] Socket Error", e);
	};

	private onclose = (e: CloseEvent) => {
		this.readyState = WebSocket.CLOSED;
		this.handleClose(e.code);
	};

	private sendJson = (payload: GatewaySendPayload) => {
		if (!this.socket) {
			this.logger.error("Socket is not open");
			return;
		}

		if (this.socket.readyState !== WebSocket.OPEN) {
			this.logger.error(`Socket is not open; readyState: ${this.socket.readyState}`);
			return;
		}
		this.logger.debug(`[Gateway] <- ${payload.op}`, payload);
		this.socket.send(JSON.stringify(payload));
	};

	/**
	 * Sends Identify payload to gateway
	 */
	private handleIdentify = () => {
		this.logger.debug("handleIdentify called");
		if (!this.app.token) {
			return this.logger.error("Token shouldn't be null here");
		}
		this.identifyStartTime = Date.now();

		const payload: GatewayIdentify = {
			op: GatewayOpcodes.Identify,
			d: {
				token: this.app.token!,
				capabilities: 16381,
				properties: {
					browser: "spacebar Web",
					client_build_number: 0,
					release_channel: "dev",
					browser_user_agent: navigator.userAgent,
				},
				compress: false,
				presence: {
					status: PresenceUpdateStatus.Online,
					since: Date.now(),
					activities: [],
					afk: false,
				},
			},
		};
		this.sendJson(payload);
	};

	/**
	 * Processes an invalid session opcode
	 */
	private handleInvalidSession = (resumable: boolean) => {
		this.cleanup();

		this.logger.debug(`Received invalid session; Can Resume: ${resumable}`);
		if (!resumable) {
			return;
		}

		// TODO: handle resumable
	};

	/**
	 * Processes a reconnect opcode
	 */
	private handleReconnect() {
		this.cleanup();
		this.logger.debug("Received reconnect");

		this.startReconnect();
	}

	private handleResume() {
		this.logger.debug("handleResume called");
		if (!this.app.token) {
			return this.logger.error("Token shouldn't be null here");
		}

		this.sendJson({
			op: GatewayOpcodes.Resume,
			d: {
				token: this.app.token!,
				session_id: this.sessionId!,
				seq: this.sequence,
			},
		});
	}

	private handleHello = (data: GatewayHelloData) => {
		this.heartbeatInterval = data.heartbeat_interval;
		this.reconnectTimeout = this.heartbeatInterval;
		this.logger.info(
			`[Hello] heartbeat interval: ${data.heartbeat_interval} (took ${Date.now() - this.connectionStartTime!}ms)`,
		);
		this.startHeartbeater();
	};

	canReconnect(code: GatewayCloseCodes | undefined) {
		if (!code) {
			return true;
		}

		switch (code) {
			case GatewayCloseCodes.AuthenticationFailed:
			case GatewayCloseCodes.InvalidShard:
			case GatewayCloseCodes.ShardingRequired:
			case GatewayCloseCodes.InvalidAPIVersion:
			case GatewayCloseCodes.InvalidIntents:
			case GatewayCloseCodes.DisallowedIntents:
				return false;
			default:
				return true;
		}
	}

	private handleClose = (code: number | undefined) => {
		this.cleanup();

		if (code === 4004) {
			this.logger.warn("closed because of authentication failure.");
			// remove token, this will send us back to the login screen
			// TODO: maybe we could show a toast here so the user knows why they got logged out
			this.app.logout();
			this.reset();
			this.app.setAppLoading(false);
			return;
		}

		// dont reconnect on "going away"
		if (code === 1001) return;

		// if (this.reconnectTimeout === 0) this.reconnectTimeout = RECONNECT_TIMEOUT;
		// else this.reconnectTimeout += RECONNECT_TIMEOUT;

		// this.logger.debug(
		// 	`Websocket closed with code ${code}; Will reconnect in ${(this.reconnectTimeout / 1000).toFixed(
		// 		2,
		// 	)} seconds.`,
		// );

		alert(`Gateway connection closed with code ${code}, please refresh the page`);

		// this.startReconnect();
	};

	/**
	 * Resets the gateway state
	 */
	private reset = () => {
		this.sessionId = null;
		this.sequence = 0;
		this.readyState = WebSocket.CLOSED;
	};

	/**
	 * Starts the heartbeat interval
	 */
	private startHeartbeater = () => {
		if (this.heartbeater) {
			clearInterval(this.heartbeater);
			this.heartbeater = null;
		}

		const heartbeaterFn = () => {
			if (this.heartbeatAck) {
				this.heartbeatAck = false;
				this.sendHeartbeat();
			} else {
				this.handleHeartbeatTimeout();
			}
		};

		this.initialHeartbeatTimeout = setTimeout(() => {
			this.initialHeartbeatTimeout = null;
			this.heartbeater = setInterval(heartbeaterFn, this.heartbeatInterval!);
			heartbeaterFn();
		}, Math.floor(Math.random() * this.heartbeatInterval!));
	};

	/**
	 * Stops the heartbeat interval
	 */
	private stopHeartbeater = () => {
		if (this.heartbeater) {
			clearInterval(this.heartbeater);
			this.heartbeater = null;
		}

		if (this.initialHeartbeatTimeout) {
			clearTimeout(this.initialHeartbeatTimeout);
			this.initialHeartbeatTimeout = null;
		}
	};

	/**
	 * Handles a heartbeat timeout
	 */
	private handleHeartbeatTimeout = () => {
		this.logger.warn(
			`[Heartbeat ACK Timeout] should reconnect in ${(RECONNECT_TIMEOUT / 1000).toFixed(2)} seconds`,
		);

		this.socket?.close(4009);

		this.cleanup();
		this.reset();

		this.startReconnect();
	};

	/**
	 * Sends a heartbeat
	 */
	private sendHeartbeat = () => {
		const payload: GatewayHeartbeat = {
			op: GatewayOpcodes.Heartbeat,
			d: this.sequence,
		};
		this.logger.debug("Sending heartbeat");
		this.sendJson(payload);
	};

	/**
	 * Stops heartbeat interval and removes socket
	 */
	private cleanup = () => {
		this.logger.debug("Cleaning up");
		this.stopHeartbeater();
		this.socket = null;
	};

	/**
	 * Processes a heartbeat ack opcode
	 */
	private handleHeartbeatAck = () => {
		this.logger.debug("Received heartbeat ack");
		this.heartbeatAck = true;
	};

	/**
	 * processes a dispatch opcode
	 */
	private handleDispatch = (data: GatewayDispatchPayload) => {
		const { d, t, s } = data;
		this.logger.debug(`[Gateway] -> ${t}`, d);
		this.sequence = s;
		const handler = this.dispatchHandlers.get(t);
		if (!handler) {
			this.logger.debug(`No handler for dispatch event ${t}`);
			return;
		}

		handler(d);
	};

	/**
	 * Processes a resumed dispatch event
	 */
	private onResumed = () => {
		this.logger.debug("Resumed");
	};

	/**
	 * Processes a ready dispatch event
	 */
	private onReady = (data: GatewayReadyDispatchData) => {
		this.logger.info(`[Ready] took ${Date.now() - this.connectionStartTime!}ms`);
		const { session_id, guilds, users, user, private_channels, sessions, read_state } = data;
		this.sessionId = session_id;
		this.session = (sessions as GatewaySession[]).find((x) => x.session_id === session_id);

		this.app.setUser(user);

		this.app.guilds.addAll(guilds);
		this.app.guilds.setInitialGuildsLoaded();
		if (users) {
			this.app.users.addAll(users);
		}

		// TODO: store relationships
		this.app.readStateStore.addAll(read_state.entries);
		this.app.privateChannels.addAll(private_channels);

		if (data.merged_members) {
			// store merged members (the client users member object for each guild)
			for (const mm of data.merged_members as (APIGuildMember & { guild_id: string; id: string })[][]) {
				for (const m of mm) {
					const guild = this.app.guilds.get(m.guild_id);
					if (!guild) {
						this.logger.warn(`[Ready] Guild ${m.guild_id} not found for member ${m.id}`);
						continue;
					}
					guild.members.add(m);
				}
			}
		}

		this.reconnectTimeout = 0;
		this.app.setGatewayReady(true);
	};

	public onChannelOpen = (guildId: Snowflake, channelId: Snowflake) => {
		const guildChannels = this.lazyRequestChannels.get(guildId) ?? [];

		if (guildChannels.includes(channelId)) return;
		const payload: GatewayLazyRequestData = {
			guild_id: guildId,
			// activities: true,
			// threads: true,
			// typing: true,
			channels: {
				[channelId]: [[0, 99]],
			},
		};
		this.lazyRequestChannels.set(guildId, [channelId]);

		this.sendJson({
			op: GatewayOpcodes.LazyRequest,
			d: payload,
		} as GatewayLazyRequest);
	};

	// Start dispatch handlers

	private onGuildCreate = (data: GatewayGuildCreateDispatchData) => {
		this.logger.debug("Received guild create event");
		runInAction(() => {
			this.app.guilds.add({
				...data,
				...data.properties,
			} as unknown as GatewayGuild);
		});
	};

	private onGuildUpdate = (data: GatewayGuildModifyDispatchData) => {
		this.logger.debug("Received guild update event");
		this.app.guilds.get(data.id)?.update(data);
	};

	private onGuildDelete = (data: GatewayGuildDeleteDispatchData) => {
		this.logger.debug("Received guild delete event");
		runInAction(() => {
			this.app.guilds.remove(data.id);
		});
	};

	private onGuildMemberAdd = (data: GatewayGuildMemberAddDispatchData) => {
		this.logger.debug("Received GuildMemberAdd event");
		const guild = this.app.guilds.get(data.guild_id);
		if (!guild) {
			this.logger.warn(`[GuildMemberAdd] Guild ${data.guild_id} not found for member ${data.user?.id}`);
			return;
		}
		guild.members.add(data);
	};

	private onGuildMemberRemove = (data: GatewayGuildMemberRemoveDispatchData) => {
		this.logger.debug("Received GuildMemberRemove event");
		const guild = this.app.guilds.get(data.guild_id);
		if (!guild) {
			this.logger.warn(`[GuildMemberRemove] Guild ${data.guild_id} not found for member ${data.user.id}`);
			return;
		}
		guild.members.remove(data.user.id);
	};

	private onGuildMemberUpdate = (data: GatewayGuildMemberUpdateDispatchData) => {
		this.logger.debug("Received GuildMemberUpdate event");
		const guild = this.app.guilds.get(data.guild_id);
		if (!guild) {
			this.logger.warn(`[GuildMemberUpdate] Guild ${data.guild_id} not found for member ${data.user.id}`);
			return;
		}
		guild.members.update(data as APIGuildMember);
	};

	private onGuildMemberListUpdate = (data: GatewayGuildMemberListUpdateDispatchData) => {
		this.logger.debug("Received GuildMemberListUpdate event");
		const { guild_id } = data;
		const guild = this.app.guilds.get(guild_id);

		if (!guild) {
			this.logger.warn(`[GuildMemberListUpdate] Guild ${guild_id} not found`);
			return;
		}

		guild.updateMemberList(data);
	};

	private onChannelCreate = (data: GatewayChannelCreateDispatchData) => {
		if (data.type === ChannelType.DM || data.type === ChannelType.GroupDM) {
			this.app.privateChannels.add(data);
			return;
		}

		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[ChannelCreate] Guild ${data.guild_id} not found for channel ${data.id}`);
			return;
		}
		guild.addChannel(data);
	};

	private onChannelUpdate = (data: GatewayChannelUpdateDispatchData) => {
		if (data.type === ChannelType.DM || data.type === ChannelType.GroupDM) {
			this.app.privateChannels.update(data);
			return;
		}

		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[ChannelUpdate] Guild ${data.guild_id} not found for channel ${data.id}`);
			return;
		}
		guild.updateChannel(data);
	};

	private onChannelDelete = (data: GatewayChannelDeleteDispatchData) => {
		if (data.type === ChannelType.DM || data.type === ChannelType.GroupDM) {
			this.app.privateChannels.remove(data.id);
			return;
		}

		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[ChannelDelete] Guild ${data.guild_id} not found for channel ${data.id}`);
			return;
		}
		guild.removeChannel(data.id);
	};

	private onMessageAck = (data: { channel_id: string; message_id: string; version: number }) => {
		// get readstate for channel
		const readstate = this.app.readStateStore.get(data.channel_id);
		if (!readstate) {
			this.logger.warn(`[MessageAck] Readstate not found for channel ${data.channel_id}`);
			return;
		}

		runInAction(() => {
			readstate.lastMessageId = data.message_id;
		});

		this.logger.debug(
			`[MessageAck] Updated last message id for channel readstate ${data.channel_id} to ${data.message_id}`,
		);
	};

	private onMessageCreate = (data: GatewayMessageCreateDispatchData) => {
		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[MessageCreate] Guild ${data.guild_id} not found for channel ${data.id}`);
			return;
		}
		const channel = this.app.channels.get(data.channel_id);
		if (!channel) {
			this.logger.warn(`[MessageCreate] Channel ${data.channel_id} not found for message ${data.id}`);
			return;
		}

		channel.messages.add(data);
		this.app.queue.handleIncomingMessage(data);
	};

	private onMessageUpdate = (data: GatewayMessageUpdateDispatchData) => {
		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[MessageUpdate] Guild ${data.guild_id} not found for channel ${data.id}`);
			return;
		}
		const channel = this.app.channels.get(data.channel_id);
		if (!channel) {
			this.logger.warn(`[MessageUpdate] Channel ${data.channel_id} not found for message ${data.id}`);
			return;
		}

		channel.messages.update(data as APIMessage);
	};

	private onMessageDelete = (data: GatewayMessageDeleteDispatchData) => {
		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[MessageDelete] Guild ${data.guild_id} not found for channel ${data.id}`);
			return;
		}
		const channel = this.app.channels.get(data.channel_id);
		if (!channel) {
			this.logger.warn(`[MessageDelete] Channel ${data.channel_id} not found for message ${data.id}`);
			return;
		}

		channel.messages.remove(data.id);
	};

	private onMessageBulkDelete = (data: GatewayMessageDeleteBulkDispatchData) => {
		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[MessageDeleteBulk] Guild ${data.guild_id} not found.`);
			return;
		}
		const channel = this.app.channels.get(data.channel_id);
		if (!channel) {
			this.logger.warn(`[MessageDeleteBulk] Channel ${data.channel_id} not found.`);
			return;
		}

		for (const id of data.ids) {
			channel.messages.remove(id);
		}
	};

	private onPresenceUpdate = (data: GatewayPresenceUpdateDispatchData) => {
		this.app.presences.update(data);
	};

	private onTypingStart = (data: GatewayTypingStartDispatchData) => {
		const guild = this.app.guilds.get(data.guild_id!);
		if (!guild) {
			this.logger.warn(`[TypingStart] Guild ${data.guild_id} not found for channel ${data.channel_id}`);
			return;
		}
		const channel = this.app.channels.get(data.channel_id);
		if (!channel) {
			this.logger.warn(`[TypingStart] Channel ${data.channel_id} not found`);
			return;
		}

		const stop = debounce(() => {
			this.logger.debug(`[TypingStart] ${data.user_id} has stopped typing in ${channel.id}`);
			runInAction(() => channel.typingIds.delete(data.user_id));
		}, 12_000); // little bit of extra delay to allow clients to send continuation typing events

		if (!channel.typingIds.has(data.user_id)) {
			runInAction(() => channel.typingIds.set(data.user_id, stop));
			stop();
		} else {
			this.logger.debug(`[TypingStart] ${data.user_id} is still typing in ${channel.id}`);
			channel.typingIds.get(data.user_id)?.();
		}
	};

	private onUserUpdate = (data: GatewayUserUpdateDispatchData) => {
		this.app.users.update(data);

		if (data.id === this.app.account!.id) {
			this.app.setUser(data);
		}
	};
}
