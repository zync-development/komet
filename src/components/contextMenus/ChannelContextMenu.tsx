// loosely based on https://github.com/revoltchat/frontend/blob/master/components/app/menus/UserContextMenu.tsx

import { modalController } from "@/controllers/modals";
import Channel from "@structures/Channel";
import { ContextMenu, ContextMenuButton, ContextMenuDivider } from "./ContextMenu";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { ChannelType } from "@spacebarchat/spacebar-api-types/v9";

interface MenuProps {
	channel: Channel;
}

function ChannelContextMenu({ channel }: MenuProps) {
	const app = useAppStore();
	const isCategory = channel.type === ChannelType.GuildCategory;

	/**
	 * Copy id to clipboard
	 */
	function copyId() {
		navigator.clipboard.writeText(channel.id);
	}

	/**
	 * Copy link to clipboard (only for text channels)
	 */
	function copyLink() {
		if (channel.type === ChannelType.GuildText) {
			navigator.clipboard.writeText(`${window.location.origin}/channels/${channel.guildId}/${channel.id}`);
		}
	}

	/**
	 * Open invite creation modal (only for text channels)
	 */
	function openInviteCreateModal() {
		if (channel.type === ChannelType.GuildText) {
			modalController.push({
				type: "create_invite",
				target: channel,
			});
		}
	}

	/**
	 * Edit channel/category
	 */
	async function editChannel() {
		const itemType = isCategory ? "category" : "channel";
		const itemName = isCategory ? channel.name : `#${channel.name}`;
		
		const newName = prompt(`Enter new name for ${itemType} "${itemName}":`, channel.name);
		if (newName && newName.trim() && newName !== channel.name) {
			try {
				await app.rest.patch(`/api/v9/channels/${channel.id}`, {
					name: newName.trim()
				});
				
				console.log(`${itemType} updated successfully`);
				// Refresh the page to show changes
				window.location.reload();
			} catch (error: any) {
				console.error(`Error updating ${itemType}:`, error);
				alert(`Failed to update ${itemType}: ` + (error.message || "Unknown error"));
			}
		}
	}

	/**
	 * Show delete confirmation modal
	 */
	function showDeleteConfirmation() {
		console.log('showDeleteConfirmation called');
		console.log('Channel:', channel);
		console.log('Channel ID:', channel.id);
		console.log('Channel type:', channel.type);
		console.log('Is category:', isCategory);
		
		try {
			modalController.push({
				type: "delete_channel",
				channel: channel,
			});
			console.log('Modal pushed successfully');
		} catch (error) {
			console.error('Error pushing modal:', error);
		}
	}

	return (
		<ContextMenu>
			{/* Only show these options for text channels */}
			{channel.type === ChannelType.GuildText && (
				<>
					<ContextMenuButton icon="mdiAccountPlus" onClick={openInviteCreateModal}>
						Create Invite
					</ContextMenuButton>
					<ContextMenuButton icon="mdiLink" onClick={copyLink}>
						Copy Link
					</ContextMenuButton>
					<ContextMenuDivider />
				</>
			)}
			
			{/* Show edit/delete for both channels and categories */}
			{channel.hasPermission("ManageChannel") && (
				<>
					<ContextMenuButton icon="mdiPencil" onClick={editChannel}>
						Edit {isCategory ? "Category" : "Channel"}
					</ContextMenuButton>
					<ContextMenuButton icon="mdiDelete" onClick={showDeleteConfirmation} destructive>
						Delete {isCategory ? "Category" : "Channel"}
					</ContextMenuButton>
					<ContextMenuDivider />
				</>
			)}

			<ContextMenuButton
				icon="mdiIdentifier"
				iconProps={{
					style: {
						filter: "invert(100%)",
						background: "black",
						borderRadius: "4px",
					},
				}}
				onClick={copyId}
			>
				Copy {isCategory ? "Category" : "Channel"} ID
			</ContextMenuButton>
		</ContextMenu>
	);
}

export default observer(ChannelContextMenu);
