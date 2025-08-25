import { ContextMenu, ContextMenuButton, ContextMenuDivider } from "@components/contextMenus/ContextMenu";
import { modalController } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { Permissions, calculatePermissions } from "@utils";
import { Role } from "@structures";
import React from "react";
import styled from "styled-components";

const CustomContextMenu = styled(ContextMenu)`
	width: 200px;
`;

interface ChannelListContextMenuProps {
	guildId: string;
}

function ChannelListContextMenu({ guildId }: ChannelListContextMenuProps) {
	const app = useAppStore();
	const guild = app.guilds.get(guildId);
	
	if (!guild) return null;

	const member = guild.members.get(app.account!.id);
	if (!member) return null;

	// Check if user has permission to manage channels
		const userRoles = member.roles.map((roleId) => app.roles.get(roleId)).filter((role): role is Role => role !== undefined);
	const serverRoles = guild.roles.asList();
	
	const hasManageChannelPermission = (calculatePermissions(app.account!.id, guild, userRoles, serverRoles, undefined, app.channelPermissions) & Permissions.ManageChannel) === Permissions.ManageChannel;

	function onCreateChannelClick() {
		modalController.push({
			type: "create_channel",
			guild: guild,
		});
	}

	function onCreateCategoryClick() {
		modalController.push({
			type: "create_category",
			guild: guild,
		});
	}

	return (
		<CustomContextMenu>
			{hasManageChannelPermission && (
				<>
					<ContextMenuButton icon="mdiPlusCircle" onClick={onCreateChannelClick}>
						Create Channel
					</ContextMenuButton>
					<ContextMenuButton icon="mdiFolderPlus" onClick={onCreateCategoryClick}>
						Create Category
					</ContextMenuButton>
					<ContextMenuDivider />
				</>
			)}
			<ContextMenuButton icon="mdiCog" disabled>
				Channel Settings
			</ContextMenuButton>
		</CustomContextMenu>
	);
}

export default ChannelListContextMenu;
