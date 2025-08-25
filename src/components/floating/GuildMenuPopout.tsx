import useLogger from "@hooks/useLogger";
import styled from "styled-components";

import { modalController } from "@/controllers/modals";
import { ContextMenu, ContextMenuButton, ContextMenuDivider } from "@components/contextMenus/ContextMenu";
import { useAppStore } from "@hooks/useAppStore";
import { Permissions, calculatePermissions } from "@utils";
import { Role } from "@structures";
import React, { useEffect } from "react";

const CustomContextMenu = styled(ContextMenu)`
	width: 200px;
`;

function GuildMenuPopout() {
	const app = useAppStore();
	const { activeGuild, account } = app;
	const logger = useLogger("GuildMenuPopout");

	const [hasCreateChannelPermission, setHasCreateChannelPermission] = React.useState(false);

	useEffect(() => {
		if (!activeGuild) return;

		const member = activeGuild.members.get(account!.id);
		if (!member) return;

		const userRoles = member.roles.map((roleId) => app.roles.get(roleId)).filter((role): role is Role => role !== undefined);
		const serverRoles = activeGuild.roles;

		const permission = calculatePermissions(account!.id, activeGuild, userRoles, serverRoles, undefined, app.channelPermissions);
		const hasPermission = (permission & Permissions.ManageChannel) === Permissions.ManageChannel;
		setHasCreateChannelPermission(hasPermission);
	}, [activeGuild]);

	if (!activeGuild) {
		logger.error("activeGuild is undefined");
		return null;
	}

	function leaveGuild() {
		modalController.push({
			type: "leave_server",
			target: activeGuild!,
		});
	}

	function onChannelCreateClick() {
		modalController.push({
			type: "create_channel",
			guild: activeGuild!,
		});
	}

	function onCreateCategoryClick() {
		modalController.push({
			type: "create_category",
			guild: activeGuild!,
		});
	}

	function onServerSettingsClick() {
		modalController.push({
			type: "server_settings",
			target: activeGuild!,
		});
	}

	return (
		<CustomContextMenu>
			<ContextMenuButton icon="mdiCog" onClick={onServerSettingsClick}>
				Server Settings
			</ContextMenuButton>
			{hasCreateChannelPermission && (
				<>
					<ContextMenuButton icon="mdiPlusCircle" onClick={onChannelCreateClick}>
						Create Channel
					</ContextMenuButton>
					<ContextMenuButton icon="mdiFolderPlus" onClick={onCreateCategoryClick}>
						Create Category
					</ContextMenuButton>
				</>
			)}
			<ContextMenuDivider />
			<ContextMenuButton icon="mdiBell" disabled>
				Notification Settings
			</ContextMenuButton>
			<ContextMenuButton icon="mdiShieldLock" disabled>
				Privacy Settings
			</ContextMenuButton>
			<ContextMenuDivider />
			<ContextMenuButton icon="mdiLocationExit" destructive onClick={leaveGuild}>
				Leave Guild
			</ContextMenuButton>
		</CustomContextMenu>
	);
}

export default GuildMenuPopout;
