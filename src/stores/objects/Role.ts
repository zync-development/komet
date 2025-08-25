import type { APIRole, APIRoleTags } from "@spacebarchat/spacebar-api-types/v9";
import { AppStore } from "@stores";
import { action, makeAutoObservable, observable } from "mobx";

export default class Role {
	private readonly app: AppStore;

	id: string;
	@observable name: string;
	@observable color: string;
	@observable hoist: boolean;
	@observable icon?: string | null | undefined;
	@observable unicode_emoji?: string | null | undefined;
	@observable position: number;
	@observable permissions: bigint;
	@observable denied_permissions: bigint;
	managed: boolean;
	@observable mentionable: boolean;
	@observable tags?: APIRoleTags | undefined;
	@observable memberCount: number = 0;

	constructor(app: AppStore, data: APIRole) {
		this.app = app;

		this.id = data.id;
		this.name = data.name;
		this.color = "#" + data.color.toString(16).padStart(6, "0");
		this.hoist = data.hoist;
		this.icon = data.icon;
		this.unicode_emoji = data.unicode_emoji;
		this.position = data.position;
		this.permissions = BigInt(data.permissions);
		  this.denied_permissions = BigInt((data as any).denied_permissions ?? 0);
		this.managed = data.managed;
		this.mentionable = data.mentionable;
		this.tags = data.tags;

		makeAutoObservable(this);
	}

	@action
	update(role: APIRole) {
		Object.assign(this, role);
	}

	@action
	async fetchMemberCount() {
		try {
			const response = await this.app.rest.get(
				`/guilds/${this.app.activeGuild?.id}/roles/${this.id}/member-ids`
			);
			    this.memberCount = (response as any[]).length;
		} catch (error) {
			console.error("Failed to fetch member count for role:", this.id, error);
			this.memberCount = 0;
		}
	}

	@action
	setMemberCount(count: number) {
		this.memberCount = count;
	}
}
