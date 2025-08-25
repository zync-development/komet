import type { Snowflake } from "@spacebarchat/spacebar-api-types/globals";
import {
	ChannelType,
	RESTPutAPIGuildBanJSONBody,
	RESTPutAPIGuildBanResult,
	Routes,
	type APIChannel,
	type APIGuild,
	type GatewayGuild,
	type GatewayGuildMemberListUpdateDispatchData,
} from "@spacebarchat/spacebar-api-types/v9";
import { AppStore, GuildMemberListStore, GuildMemberStore } from "@stores";
import { asAcronym, compareChannels } from "@utils";
import { ObservableMap, ObservableSet, action, computed, makeAutoObservable, observable } from "mobx";

export default class Guild {
	private readonly app: AppStore;

	id: Snowflake;
	joinedAt: string;
	@observable threads: unknown[];
	@observable stickers: unknown[]; // TODO:
	@observable stageInstances: unknown[]; // TODO:
	@observable roles_: ObservableSet<Snowflake>;
	@observable emojis_: ObservableSet<Snowflake>;
	@observable memberCount: number;
	@observable lazy: boolean;
	@observable large: boolean;
	@observable guildScheduledEvents: unknown[]; // TODO:
	@observable channels_: ObservableSet<Snowflake>;
	@observable name: string;
	@observable description: string | null = null;
	@observable icon: string | null = null;
	@observable splash: string | null = null;
	@observable banner: string | null = null;
	@observable features: string[];
	@observable preferredLocale: string;
	@observable ownerId: Snowflake;
	@observable applicationId: Snowflake | null = null;
	@observable afkChannelId: Snowflake | null = null;
	@observable afkTimeout: number;
	@observable systemChannelId: Snowflake | null = null;
	@observable verificationLevel: number;
	@observable explicitContentFilter: number;
	@observable defaultMessageNotifications: number;
	@observable mfaLevel: number;
	@observable vanityUrlCode: string | null = null;
	@observable premiumTier: number;
	//   @observable premium_progress_bar_enabled: boolean
	@observable systemChannelFlags: number;
	@observable discoverySplash: string | null = null;
	@observable rulesChannelId: Snowflake | null = null;
	@observable publicUpdatesChannelId: Snowflake | null = null;
	@observable maxVideoChannelUsers: number;
	@observable maxMembers: number;
	@observable nsfwLevel: number;
	@observable hubType: number | null = null;
	@observable members: GuildMemberStore;
	@observable memberLists: ObservableMap<string, GuildMemberListStore> = new ObservableMap();

	get appStore(): AppStore {
		return this.app;
	}

	constructor(app: AppStore, data: GatewayGuild) {
		this.app = app;
		this.roles_ = new ObservableSet();
		this.emojis_ = new ObservableSet();
		this.channels_ = new ObservableSet();
		this.members = new GuildMemberStore(app, this);

		this.id = data.id;
		this.joinedAt = data.joined_at;
		this.threads = data.threads;
		this.stickers = data.stickers;
		this.stageInstances = data.stage_instances;
		this.memberCount = data.member_count;
		this.lazy = data.lazy;
		this.large = data.large;
		this.guildScheduledEvents = data.guild_scheduled_events;
		this.name = data.properties.name;
		this.description = data.properties.description;
		this.icon = data.properties.icon;
		this.splash = data.properties.splash;
		this.banner = data.properties.banner;
		this.features = data.properties.features;
		this.preferredLocale = data.properties.preferred_locale;
		this.ownerId = data.properties.owner_id;
		this.applicationId = data.properties.application_id;
		this.afkChannelId = data.properties.afk_channel_id;
		this.afkTimeout = data.properties.afk_timeout;
		this.systemChannelId = data.properties.system_channel_id;
		this.verificationLevel = data.properties.verification_level;
		this.explicitContentFilter = data.properties.explicit_content_filter;
		this.defaultMessageNotifications = data.properties.default_message_notifications;
		this.mfaLevel = data.properties.mfa_level;
		this.vanityUrlCode = data.properties.vanity_url_code;
		this.premiumTier = data.properties.premium_tier;
		// this.premium_progress_bar_enabled = data.properties.premium_progress_bar_enabled; // FIXME: missing
		this.systemChannelFlags = data.properties.system_channel_flags;
		this.discoverySplash = data.properties.discovery_splash;
		this.rulesChannelId = data.properties.rules_channel_id;
		this.publicUpdatesChannelId = data.properties.public_updates_channel_id;
		this.maxVideoChannelUsers = data.properties.max_video_channel_users!;
		this.maxMembers = data.properties.max_members!;
		this.nsfwLevel = data.properties.nsfw_level;
		this.hubType = data.properties.hub_type;

		app.roles.addAll(data.roles);
		app.emojis.addAll(data.emojis);
		app.channels.addAll(data.channels);

		data.roles.forEach((role) => this.roles_.add(role.id));
		data.emojis.forEach((emoji) => emoji.id && this.emojis_?.add(emoji.id));
		data.channels?.forEach((channel) => this.channels_.add(channel.id));

		makeAutoObservable(this);
	}

	@action
	update(data: APIGuild | GatewayGuild) {
		if ("properties" in data) {
			// Filter out computed properties to avoid MobX errors
			const { roles, channels, emojis, ...safeData } = data;
			Object.assign(this, { ...safeData, ...safeData.properties });
			return;
		}

		// Filter out computed properties to avoid MobX errors
		const { roles, channels, emojis, ...safeData } = data;
		Object.assign(this, safeData);
	}

	@action
	updateMemberList(data: GatewayGuildMemberListUpdateDispatchData) {
		const store = this.memberLists.get(data.id);
		if (store) {
			store.update(data);
		} else {
			this.memberLists.set(data.id, new GuildMemberListStore(this.app, this, data));
		}
	}

	getMemberList(id: string): GuildMemberListStore | undefined {
		return this.memberLists.get(id);
	}

	@computed
	get acronym() {
		return asAcronym(this.name);
	}

	@computed
	get channels() {
		let guildChannels = this.app.channels.all.filter((channel) => this.channels_.has(channel.id));
		guildChannels = guildChannels.filter((channel) => {
			if (channel.type === ChannelType.GuildCategory) {
				// Always show categories, even if they don't have children yet
				return true;
			}

			// Check if user has permission to view this channel
			return channel.hasPermission("ViewChannel");
		});
		const topLevelChannels = guildChannels.filter((channel) => !channel.parentId);
		const sortedChannels = topLevelChannels
			.sort(compareChannels)
			.flatMap((topLevelChannel) => [
				topLevelChannel,
				...guildChannels.filter((channel) => channel.parentId === topLevelChannel.id).sort(compareChannels),
			]);
		return sortedChannels;
	}

	@computed
	get roles() {
		  return this.app.roles.all.filter((role: any) => this.roles_.has(role.id));
	}

	@computed
	get emojis() {
		return this.app.emojis.all.filter((emoji) => this.emojis_.has(emoji.id));
	}

	@action
	addChannel(data: APIChannel) {
		this.app.channels.add(data);
		this.channels_.add(data.id);
	}

	@action
	updateChannel(data: APIChannel) {
		this.app.channels.update(data);
	}

	@action
	removeChannel(id: Snowflake) {
		this.app.channels.remove(id);
		this.channels_.delete(id);
	}

	@action
	async kickMember(id: Snowflake, reason?: string) {
		return this.app.rest.delete(
			Routes.guildMember(this.id, id),
			{},
			reason
				? {
						"X-Audit-Log-Reason": reason,
					}
				: {},
		);
	}

	@action
	async banMember(id: Snowflake, reason?: string, deleteMessageSeconds?: number) {
		return this.app.rest.put<RESTPutAPIGuildBanJSONBody, RESTPutAPIGuildBanResult>(
			Routes.guildBan(this.id, id),
			{
				delete_message_seconds: deleteMessageSeconds,
			},
			{},
			reason
				? {
						"X-Audit-Log-Reason": reason,
					}
				: {},
		);
	}
}
