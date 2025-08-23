import { ThemePresets, type Theme } from "@contexts/Theme";
import { PresenceUpdateStatus } from "@spacebarchat/spacebar-api-types/v9";
import { action, computed, makeAutoObservable, observable } from "mobx";
import secureLocalStorage from "react-secure-storage";

export default class ThemeStore {
	@observable backgroundGifUrl: string | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	@action
	setBackgroundGifUrl(url: string) {
		this.backgroundGifUrl = url;
		secureLocalStorage.setItem("backgroundGifUrl", url);
	}

	@action
	loadBackgroundGifUrl() {
		const url = secureLocalStorage.getItem("backgroundGifUrl") as string | null;
		if (url) {
			this.backgroundGifUrl = url;
		}
	}

	@computed
	getVariables(): Theme {
		return {
			...ThemePresets["dark"],
			light: false,
		};
	}

	@computed
	computeVariables() {
		const variables = this.getVariables();

		return variables as unknown as Theme;
	}

	@computed
	getStatusColor(status?: PresenceUpdateStatus) {
		switch (status) {
			case PresenceUpdateStatus.Online:
				return ThemePresets["dark"].successLight;
			case PresenceUpdateStatus.Idle:
				return ThemePresets["dark"].statusIdle;
			case PresenceUpdateStatus.DoNotDisturb:
				return ThemePresets["dark"].dangerLight;
			case PresenceUpdateStatus.Offline:
			default:
				return ThemePresets["dark"].statusOffline;
		}
	}
}
