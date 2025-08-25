import { Channel } from "@structures";
import { observer } from "mobx-react-lite";
import { useForm, watch, setValue } from "react-hook-form";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Permissions } from "@utils/Permissions";
import { useAppStore } from "@hooks/useAppStore";
import ThreeStatePermissionToggle from "./ThreeStatePermissionToggle";
import { Routes } from "@spacebarchat/spacebar-api-types/v9";

const Container = styled.div`
	display: flex;
	height: 100%;
`;

const SelectionSidebar = styled.div`
	width: 200px;
	background: var(--background-secondary);
	border-right: 1px solid rgba(255, 255, 255, 0.06);
	padding: 16px;
	overflow-y: auto;
`;

const SelectionItem = styled.div<{ active?: boolean }>`
	display: flex;
	align-items: center;
	padding: 10px 12px;
	margin-bottom: 4px;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.15s ease;
	color: var(--text);
	background: ${props => props.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
	font-weight: ${props => props.active ? '600' : '500'};

	&:hover {
		background: ${props => props.active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
	}
`;

const MainContent = styled.div`
	flex: 1;
	background: var(--background-primary);
	overflow-y: auto;
	padding: 32px;
`;

const PermissionSection = styled.div`
	margin-top: 24px;
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	padding-top: 24px;
`;

const PermissionCategoryTitle = styled.h3`
	font-size: 18px;
	font-weight: 600;
	color: var(--text);
	margin-bottom: 16px;
`;

const PermissionGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
`;

const PermissionItem = styled.div`
	display: flex;
	flex-direction: column;
	background: var(--background-secondary);
	border-radius: 8px;
	padding: 12px;
	border: 1px solid rgba(255, 255, 255, 0.06);
`;

const PermissionLabel = styled.label`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	font-size: 14px;
	color: var(--text);
`;

const PermissionCheckbox = styled.input`
	margin-right: 8px;
	width: 16px;
	height: 16px;
	accent-color: var(--primary);
`;

interface PermissionsSettingsPageProps {
	channel: Channel;
}

function PermissionsSettingsPage({ channel }: PermissionsSettingsPageProps) {
	const app = useAppStore();
	const [selectedEntity, setSelectedEntity] = useState<{ type: 'role' | 'member'; id: string } | null>(null);

	const { register, handleSubmit, reset, watch, setValue } = useForm();

	useEffect(() => {
		if (!selectedEntity) {
			reset();
			return;
		}

		const overwrite = app.channelPermissions.getOverwrites(channel.id)?.get(selectedEntity.id);
		const defaultValues: any = {};

		if (overwrite) {
			permissionCategories.forEach((category) => {
				category.permissions.forEach((perm) => {
					defaultValues[`permissions.${perm.flag}`] = (overwrite.allow & perm.flag) === perm.flag;
					defaultValues[`denied_permissions.${perm.flag}`] = (overwrite.deny & perm.flag) === perm.flag;
				});
			});
		}

		reset(defaultValues);
	}, [selectedEntity, channel, app.channelPermissions, reset]);

	const onSubmit = async (data: any) => {
		if (!selectedEntity) return;

		const allow = Object.keys(data.permissions).reduce((acc, key) => {
			if (data.permissions[key]) {
				return acc | BigInt(key);
			}
			return acc;
		}, 0n);

		const deny = Object.keys(data.denied_permissions).reduce((acc, key) => {
			if (data.denied_permissions[key]) {
				return acc | BigInt(key);
			}
			return acc;
		}, 0n);

		try {
			await app.rest.put(
				Routes.channelPermissions(channel.id, selectedEntity.id),
				{
					allow: allow.toString(),
					deny: deny.toString(),
				}
			);
			app.channelPermissions.setOverwrite(channel.id, selectedEntity.id, { allow, deny });
			console.log("Permissions updated successfully!");
		} catch (error) {
			console.error("Failed to update permissions:", error);
		}
	};

	const permissionCategories = [
		{
			name: "General Permissions",
			permissions: [
				{ name: "Manage Channel", flag: Permissions.ManageChannel },
				{ name: "Manage Server", flag: Permissions.ManageServer },
				{ name: "Manage Permissions", flag: Permissions.ManagePermissions },
				{ name: "Manage Role", flag: Permissions.ManageRole },
				{ name: "Manage Webhooks", flag: Permissions.ManageWebhooks },
				{ name: "View Channel", flag: Permissions.ViewChannel },
			],
		},
		{
			name: "Text Permissions",
			permissions: [
				{ name: "Read Message History", flag: Permissions.ReadMessageHistory },
				{ name: "Send Message", flag: Permissions.SendMessage },
				{ name: "Manage Messages", flag: Permissions.ManageMessages },
				{ name: "Send Embeds", flag: Permissions.SendEmbeds },
				{ name: "Upload Files", flag: Permissions.UploadFiles },
				{ name: "React", flag: Permissions.React },
				{ name: "Masquerade", flag: Permissions.Masquerade },
				{ name: "Mention Everyone", flag: Permissions.MentionEveryone },
				{ name: "Mention Roles", flag: Permissions.MentionRoles },
			],
		},
		{
			name: "Voice Permissions",
			permissions: [
				{ name: "Connect", flag: Permissions.Connect },
				{ name: "Speak", flag: Permissions.Speak },
				{ name: "Video", flag: Permissions.Video },
				{ name: "Mute Members", flag: Permissions.MuteMembers },
				{ name: "Deafen Members", flag: Permissions.DeafenMembers },
				{ name: "Move Members", flag: Permissions.MoveMembers },
			],
		},
		{
			name: "Member Permissions",
			permissions: [
				{ name: "Kick Members", flag: Permissions.KickMembers },
				{ name: "Ban Members", flag: Permissions.BanMembers },
				{ name: "Timeout Members", flag: Permissions.TimeoutMembers },
				{ name: "Assign Roles", flag: Permissions.AssignRoles },
				{ name: "Manage Nicknames", flag: Permissions.ManageNicknames },
				{ name: "Remove Avatars", flag: Permissions.RemoveAvatars },
				{ name: "Change Nickname", flag: Permissions.ChangeNickname },
				{ name: "Change Avatar", flag: Permissions.ChangeAvatar },
				{ name: "Invite Others", flag: Permissions.InviteOthers },
				{ name: "Manage Customisation", flag: Permissions.ManageCustomisation },
			],
		},
	];

	return (
		<Container>
			<SelectionSidebar>
				<h3>Roles</h3>
				{roles.map((role) => (
					<SelectionItem
						key={role.id}
						active={selectedEntity?.id === role.id && selectedEntity?.type === 'role'}
						onClick={() => setSelectedEntity({ type: 'role', id: role.id })}
					>
						{role.name}
					</SelectionItem>
				))}

				<h3>Members</h3>
				{members.map((member) => (
					<SelectionItem
						key={member.id}
						active={selectedEntity?.id === member.id && selectedEntity?.type === 'member'}
						onClick={() => setSelectedEntity({ type: 'member', id: member.id })}
					>
						{member.user?.username || member.id}
					</SelectionItem>
				))}
			</SelectionSidebar>
			<MainContent>
				{selectedEntity ? (
					<form onSubmit={handleSubmit(onSubmit)}>
						{/* Permission categories and checkboxes */}
						{permissionCategories.map((category) => (
							<PermissionSection key={category.name}>
								<PermissionCategoryTitle>{category.name}</PermissionCategoryTitle>
								<PermissionGrid>
									{category.permissions.map((permission) => (
										<PermissionItem key={permission.name}>
											<ThreeStatePermissionToggle
												permissionName={permission.name}
												currentState={(() => {
													const allow = watch(`permissions.${permission.flag}`);
													const deny = watch(`denied_permissions.${permission.flag}`);
													if (allow) return 'allow';
													if (deny) return 'deny';
													return 'neutral';
												})()}
												onToggle={(newState) => {
													setValue(`permissions.${permission.flag}`, newState === 'allow');
													setValue(`denied_permissions.${permission.flag}`, newState === 'deny');
												}}
											/>
										</PermissionItem>
									))}
								</PermissionGrid>
							</PermissionSection>
						))}
						<button type="submit">Save</button>
					</form>
				) : (
					<div>Select a role or member to edit permissions</div>
				)}
			</MainContent>
		</Container>
	);
}

export default observer(PermissionsSettingsPage);
