// adapted from https://github.com/revoltchat/revite/blob/master/src/controllers/modals/types.ts

import {
	APIAttachment,
	APIEmbedImage,
	APIEmbedThumbnail,
	APIEmbedVideo,
	APIInvite,
} from "@spacebarchat/spacebar-api-types/v9";
import { Channel, Guild, GuildMember, Message } from "@structures";

export type Modal = {
	key?: string;
} & (
	| {
			type: "add_server" | "add_friend" | "create_server" | "join_server" | "settings";
	  }
	| {
			type: "server_settings";
			target: Guild;
	  }
	| {
			type: "error";
			title: string;
			description?: string;
			error: string;
			recoverable?: boolean;
	  }
	| {
			type: "clipboard";
			text: string;
	  }
	| {
			type: "create_invite";
			target: Channel;
	  }
	| {
			type: "kick_member";
		target: GuildMember;
	  }
	| {
			type: "ban_member";
			target: GuildMember;
	  }
	| {
			type: "delete_message";
			target: Message;
	  }
	| {
			type: "leave_server";
			target: Guild;
	  }
	| {
			type: "image_viewer";
			attachment: APIAttachment | APIEmbedImage | APIEmbedThumbnail | APIEmbedVideo;
			width?: number;
			height?: number;
			isVideo?: boolean;
	  }
	| {
			type: "create_channel";
			guild: Guild;
			category?: Channel;
	  }
	| {
			type: "create_category";
			guild: Guild;
	  }
	| {
			type: "delete_channel";
			channel: Channel;
	  }
	| {
			type: "invite";
			inviteData: APIInvite;
	  }
	| {
			type: "text_viewer";
			text: string;
	  }
);

export type ModalProps<T extends Modal["type"]> = Modal & { type: T } & {
	onClose: () => void;
	signal?: "close" | "confirm";
};
