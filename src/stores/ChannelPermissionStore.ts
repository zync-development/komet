import type { Snowflake } from "@spacebarchat/spacebar-api-types/globals";
import { action, makeAutoObservable, observable, ObservableMap } from "mobx";

export interface PermissionOverwrite {
	allow: bigint;
	deny: bigint;
}

export default class ChannelPermissionStore {
	@observable private readonly overwrites: ObservableMap<Snowflake, ObservableMap<Snowflake, PermissionOverwrite>>;

	constructor() {
		this.overwrites = observable.map();

		makeAutoObservable(this);
	}

	@action
	setOverwrite(channelId: Snowflake, roleId: Snowflake, overwrite: PermissionOverwrite) {
		if (!this.overwrites.has(channelId)) {
			this.overwrites.set(channelId, observable.map());
		}
		this.overwrites.get(channelId)!.set(roleId, overwrite);
	}

	getOverwrites(channelId: Snowflake) {
		return this.overwrites.get(channelId);
	}
}
