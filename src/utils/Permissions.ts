import { Channel, Role, Guild } from "@structures";
import { ChannelPermissionStore } from "@stores";

export const Permissions = {
	ManageChannel: 1n << 0n,
	ManageServer: 1n << 1n,
	ManagePermissions: 1n << 2n,
	ManageRole: 1n << 3n,
	ManageWebhooks: 1n << 4n,
	ViewChannel: 1n << 5n,
	KickMembers: 1n << 6n,
	BanMembers: 1n << 7n,
	TimeoutMembers: 1n << 8n,
	AssignRoles: 1n << 9n,
	ManageNicknames: 1n << 10n,
	RemoveAvatars: 1n << 11n,
	ChangeNickname: 1n << 12n,
	ChangeAvatar: 1n << 13n,
	ReadMessageHistory: 1n << 14n,
	SendMessage: 1n << 15n,
	ManageMessages: 1n << 16n,
	SendEmbeds: 1n << 17n,
	UploadFiles: 1n << 18n,
	React: 1n << 19n,
	Masquerade: 1n << 20n,
	MentionEveryone: 1n << 21n,
	MentionRoles: 1n << 22n,
	Connect: 1n << 23n,
	Speak: 1n << 24n,
	Video: 1n << 25n,
	MuteMembers: 1n << 26n,
	DeafenMembers: 1n << 27n,
	MoveMembers: 1n << 28n,
	InviteOthers: 1n << 29n,
	ManageCustomisation: 1n << 30n,
	
	// Add FLAGS property for compatibility
	FLAGS: {
		MANAGE_CHANNEL: 1n << 0n,
		MANAGE_SERVER: 1n << 1n,
		MANAGE_PERMISSIONS: 1n << 2n,
		MANAGE_ROLE: 1n << 3n,
		MANAGE_WEBHOOKS: 1n << 4n,
		VIEW_CHANNEL: 1n << 5n,
		KICK_MEMBERS: 1n << 6n,
		BAN_MEMBERS: 1n << 7n,
		TIMEOUT_MEMBERS: 1n << 8n,
		ASSIGN_ROLES: 1n << 9n,
		MANAGE_NICKNAMES: 1n << 10n,
		REMOVE_AVATARS: 1n << 11n,
		CHANGE_NICKNAME: 1n << 12n,
		CHANGE_AVATAR: 1n << 13n,
		READ_MESSAGE_HISTORY: 1n << 14n,
		SEND_MESSAGE: 1n << 15n,
		MANAGE_MESSAGES: 1n << 16n,
		SEND_EMBEDS: 1n << 17n,
		UPLOAD_FILES: 1n << 18n,
		REACT: 1n << 19n,
		MASQUERADE: 1n << 20n,
		MENTION_EVERYONE: 1n << 21n,
		MENTION_ROLES: 1n << 22n,
		CONNECT: 1n << 23n,
		SPEAK: 1n << 24n,
		VIDEO: 1n << 25n,
		MUTE_MEMBERS: 1n << 26n,
		DEAFEN_MEMBERS: 1n << 27n,
		MOVE_MEMBERS: 1n << 28n,
		INVITE_OTHERS: 1n << 29n,
		MANAGE_CUSTOMISATION: 1n << 30n,
	},
	
	// Add the getPermission function to the Permissions object
	getPermission,
};

export function calculatePermissions(
	userId: string,
	guild: Guild,
	userRoles: Role[],
	serverRoles: Role[],
	channel: Channel | undefined,
	channelPermissions: ChannelPermissionStore
) {
	if (userId === guild.ownerId) {
		console.log(`[Permissions] User ${userId} is guild owner, returning all permissions`);
		return 2n**31n - 1n; // All permissions
	}

	const everyoneRole = serverRoles.find((r) => r.name === "@everyone");
	if (!everyoneRole) {
		console.log(`[Permissions] No @everyone role found for guild ${guild.id}`);
		return 0n;
	}

	console.log(`[Permissions] @everyone role permissions: ${everyoneRole.permissions} (${BigInt(everyoneRole.permissions).toString(2)})`);
	
	// Ensure all permission values are BigInt
	let finalPermissions = BigInt(everyoneRole.permissions);

	const sortedUserRoles = userRoles.sort((a, b) => a.position - b.position);

	for (const role of sortedUserRoles) {
		// Ensure role permissions are BigInt
		const rolePermissions = BigInt(role.permissions);
		const roleDeniedPermissions = BigInt(role.denied_permissions);
		
		finalPermissions &= ~roleDeniedPermissions;
		finalPermissions |= rolePermissions;
	}

	if (channel) {
		const channelOverwrites = channelPermissions.getOverwrites(channel.id);
		if (channelOverwrites) {
			for (const role of sortedUserRoles) {
				const overwrite = channelOverwrites.get(role.id);
				if (overwrite) {
					// Ensure overwrite permissions are BigInt
					const overwriteDeny = BigInt(overwrite.deny);
					const overwriteAllow = BigInt(overwrite.allow);
					
					finalPermissions &= ~overwriteDeny;
					finalPermissions |= overwriteAllow;
				}
			}
		}
	}

	console.log(`[Permissions] Final permissions for user ${userId}: ${finalPermissions} (${finalPermissions.toString(2)})`);
	console.log(`[Permissions] Has VIEW_CHANNEL (${Permissions.ViewChannel}): ${(finalPermissions & Permissions.ViewChannel) === Permissions.ViewChannel}`);
	
	return finalPermissions;
}

export function getPermission(
	userId: string,
	guild: Guild | undefined,
	channel: Channel | undefined
) {
	if (!guild) return new Set();
	
	// Get user member from guild
	const member = guild.members.get(userId);
	if (!member) return new Set();
	
	// Get user roles - use the guild's roles computed property
	const userRoles = member.roles.map((roleId) => guild.roles.find(r => r.id === roleId)).filter((role): role is Role => role !== undefined);
	const serverRoles = guild.roles;
	
	// Debug logging
	console.log(`[Permissions] User ${userId} in guild ${guild.id}:`);
	console.log(`[Permissions] Member roles:`, member.roles);
	console.log(`[Permissions] Found user roles:`, userRoles);
	console.log(`[Permissions] Server roles:`, serverRoles);
	console.log(`[Permissions] Everyone role:`, serverRoles.find(r => r.name === "@everyone"));
	
	// Calculate permissions - use the guild's app reference to get channelPermissions
	const permissions = calculatePermissions(userId, guild, userRoles, serverRoles, channel, guild.appStore.channelPermissions);
	
	// Convert to Set for easy permission checking
	const permissionSet = new Set<string>();
	
	// Check each permission flag
	Object.entries(Permissions).forEach(([name, flag]) => {
		// Skip the getPermission function itself and FLAGS
		if (typeof flag === 'function' || name === 'FLAGS') return;
		
		// Ensure both values are BigInt for comparison
		const bigIntFlag = BigInt(flag as any);
		const bigIntPermissions = BigInt(permissions);
		
		if ((bigIntPermissions & bigIntFlag) === bigIntFlag) {
			permissionSet.add(name);
		}
	});
	
	// Also check FLAGS permissions for compatibility
	Object.entries(Permissions.FLAGS).forEach(([name, flag]) => {
		// Ensure both values are BigInt for comparison
		const bigIntFlag = BigInt(flag as any);
		const bigIntPermissions = BigInt(permissions);
		
		if ((bigIntPermissions & bigIntFlag) === bigIntFlag) {
			permissionSet.add(name);
		}
	});
	
	return permissionSet;
}
