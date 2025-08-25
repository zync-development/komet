import type { APIUser } from "@spacebarchat/spacebar-api-types/v9";
import {
	CDNRoutes,
	DefaultUserAvatarAssets,
	ImageFormat,
	UserFlags,
	UserPremiumType,
} from "@spacebarchat/spacebar-api-types/v9";
import { REST } from "@utils";
import { makeAutoObservable } from "mobx";

export default class AccountStore {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	display_name?: string;
	bio?: string;
	banner?: string | null;

	avatarDecoration?: unknown;
	email: string | null = null;
	verified = false;
	bot = false;
	system = false;
	mfaEnabled = false;
	premiumType?: UserPremiumType.NitroClassic | UserPremiumType.Nitro | UserPremiumType.NitroBasic;
	flags?: UserFlags;
	publicFlags?: UserFlags;
	raw: APIUser;
	//   phone: string | null;
	//   nsfwAllowed: boolean | null;

	constructor(user: APIUser) {
		this.raw = user;

		this.id = user.id;
		this.username = user.username;
		this.discriminator = user.discriminator;
		this.avatar = user.avatar;
		this.display_name = (user as any).display_name;
		this.bio = (user as any).bio;
		this.banner = (user as any).banner;
		// this.avatarDecoration = user.avatar_decoration;
		if (user.email) {
			this.email = user.email;
		}
		if (user.verified) {
			this.verified = user.verified;
		}
		if (user.bot) {
			this.bot = user.bot;
		}
		if (user.system) {
			this.system = user.system;
		}
		if (user.mfa_enabled) {
			this.mfaEnabled = user.mfa_enabled;
		}
		if (user.premium_type) {
			this.premiumType = user.premium_type;
		}
		if (user.flags) {
			this.flags = user.flags;
		}
		if (user.public_flags) {
			this.publicFlags = user.public_flags;
		}
		// this.phone = user.phone;
		// this.nsfwAllowed = user.nsfw_allowed;

		makeAutoObservable(this);
	}

	/**
	 * Gets the users default avatar url
	 * @returns The URL to the user's default avatar.
	 */
	get defaultAvatarUrl(): string {
		return REST.makeCDNUrl(
			CDNRoutes.defaultUserAvatar((Number(this.discriminator) % 5) as DefaultUserAvatarAssets),
		);
	}

	/**
	 * Gets the users display avatar url
	 * @returns The URL to the user's avatar or the default avatar if they don't have one.
	 */
	get avatarUrl(): string {
		if (this.avatar) return REST.makeCDNUrl(CDNRoutes.userAvatar(this.id, this.avatar, ImageFormat.PNG));
		else return this.defaultAvatarUrl;
	}
	
	/**
	 * Update the user's banner
	 * @param bannerUrl The new banner URL
	 */
}