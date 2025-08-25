import { Routes } from "@spacebarchat/spacebar-api-types/v9";
import { useAppStore } from "@hooks/useAppStore";
import { Permissions } from "@utils/Permissions";
import { Role } from "@structures";
import { observer } from "mobx-react-lite";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { modalController } from "@/controllers/modals";
import Icon from "@components/Icon";
import { useState } from "react";

const Container = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
`;

const Header = styled.div`
	padding: 24px 24px 20px 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
`;

const RoleHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 16px;
`;

const RoleAvatar = styled.div<{ color: string }>`
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: ${props => props.color};
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 20px;
	font-weight: 700;
	border: 3px solid rgba(255, 255, 255, 0.1);
`;

const RoleInfo = styled.div`
	flex: 1;
`;

const RoleName = styled.h2`
	margin: 0 0 4px 0;
	font-size: 24px;
	font-weight: 700;
	color: var(--text);
`;

const RoleMeta = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 13px;
	color: var(--text-secondary);
`;

const RoleMetaItem = styled.span`
	display: flex;
	align-items: center;
	gap: 4px;
`;

const RoleActions = styled.div`
	display: flex;
	gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' | 'secondary' }>`
	padding: 8px 16px;
	border-radius: 6px;
	border: none;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 6px;

	background: ${props => {
		if (props.variant === 'delete') return 'rgba(239, 68, 68, 0.1)';
		if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.06)';
		return 'var(--primary)';
	}};

	color: ${props => {
		if (props.variant === 'delete') return 'var(--error)';
		if (props.variant === 'secondary') return 'var(--text)';
		return 'white';
	}};

	&:hover {
		background: ${props => {
			if (props.variant === 'delete') return 'rgba(239, 68, 68, 0.2)';
			if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
			return 'var(--primary-hover)';
		}};
		transform: translateY(-1px);
	}
`;

const Content = styled.div`
	flex: 1;
	padding: 24px;
	overflow-y: auto;
`;

const Section = styled.div`
	margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
	margin: 0 0 16px 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
	display: flex;
	align-items: center;
	gap: 8px;
`;

const SectionDescription = styled.p`
	margin: 0 0 20px 0;
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.4;
`;

const FormGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	margin-bottom: 24px;
`;

const FormGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const Label = styled.label`
	font-size: 13px;
	font-weight: 600;
	color: var(--text);
`;

const Input = styled.input`
	padding: 12px 16px;
	background: var(--background-tertiary);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: var(--text);
	font-size: 14px;
	transition: all 0.2s ease;

	&:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
	}

	&:hover {
		border-color: rgba(255, 255, 255, 0.2);
	}
`;

const ColorInput = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const ColorPreview = styled.div<{ color: string }>`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: ${props => props.color};
	border: 2px solid rgba(255, 255, 255, 0.1);
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		transform: scale(1.1);
		border-color: rgba(255, 255, 255, 0.2);
	}
`;

const ColorInputField = styled.input`
	width: 80px;
	padding: 8px 12px;
	background: var(--background-tertiary);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	color: var(--text);
	font-size: 13px;
	font-family: monospace;
	text-align: center;

	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const ToggleGroup = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 24px;
`;

const ToggleItem = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	font-size: 14px;
	color: var(--text);
`;

const Toggle = styled.input`
	width: 18px;
	height: 18px;
	accent-color: var(--primary);
`;

// Permission management
const PermissionSection = styled.div`
	margin-bottom: 32px;
`;

const PermissionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
`;

const PermissionActions = styled.div`
	display: flex;
	gap: 8px;
`;

const PermissionButton = styled.button<{ variant: 'select' | 'deselect' | 'clear' }>`
	padding: 6px 12px;
	border-radius: 4px;
	border: none;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	background: ${props => {
		if (props.variant === 'select') return 'rgba(34, 197, 94, 0.1)';
		if (props.variant === 'deselect') return 'rgba(239, 68, 68, 0.1)';
		return 'rgba(255, 255, 255, 0.06)';
	}};

	color: ${props => {
		if (props.variant === 'select') return 'var(--success)';
		if (props.variant === 'deselect') return 'var(--error)';
		return 'var(--text)';
	}};

	&:hover {
		background: ${props => {
			if (props.variant === 'select') return 'rgba(34, 197, 94, 0.2)';
			if (props.variant === 'deselect') return 'rgba(239, 68, 68, 0.2)';
			return 'rgba(255, 255, 255, 0.1)';
		}};
	}
`;

const PermissionGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 12px;
`;

const PermissionItem = styled.div`
	background: var(--background-tertiary);
	border-radius: 8px;
	padding: 16px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	transition: all 0.2s ease;

	&:hover {
		border-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}
`;

const PermissionName = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
	margin-bottom: 12px;
`;

const PermissionControls = styled.div`
	display: flex;
	gap: 8px;
`;

const PermissionControl = styled.label`
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	font-size: 13px;
	color: var(--text-secondary);
	transition: color 0.2s ease;

	&:hover {
		color: var(--text);
	}
`;

const PermissionCheckbox = styled.input`
	width: 16px;
	height: 16px;
	accent-color: var(--primary);
`;

const SaveSection = styled.div`
	padding: 20px 24px;
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const SaveInfo = styled.div`
	font-size: 13px;
	color: var(--text-secondary);
`;

const SaveButton = styled.button`
	padding: 12px 24px;
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
`;

const permissionCategories = [
	{
		name: "General Permissions",
		icon: "mdiCog",
		description: "Server-wide management permissions",
		permissions: [
			{ name: "Manage Channel", flag: Permissions.ManageChannel, description: "Create, edit, and delete channels" },
			{ name: "Manage Server", flag: Permissions.ManageServer, description: "Modify server settings and information" },
			{ name: "Manage Permissions", flag: Permissions.ManagePermissions, description: "Manage role permissions" },
			{ name: "Manage Role", flag: Permissions.ManageRole, description: "Create, edit, and delete roles" },
			{ name: "Manage Webhooks", flag: Permissions.ManageWebhooks, description: "Create and manage webhooks" },
			{ name: "View Channel", flag: Permissions.ViewChannel, description: "See channels and their content" },
		],
	},
	{
		name: "Text Permissions",
		icon: "mdiFormatText",
		description: "Permissions related to text channels",
		permissions: [
			{ name: "Read Message History", flag: Permissions.ReadMessageHistory, description: "View previous messages" },
			{ name: "Send Message", flag: Permissions.SendMessage, description: "Send messages in text channels" },
			{ name: "Manage Messages", flag: Permissions.ManageMessages, description: "Delete and edit messages" },
			{ name: "Send Embeds", flag: Permissions.SendEmbeds, description: "Send rich embeds and links" },
			{ name: "Upload Files", flag: Permissions.UploadFiles, description: "Upload files and images" },
			{ name: "React", flag: Permissions.React, description: "Add reactions to messages" },
			{ name: "Masquerade", flag: Permissions.Masquerade, description: "Send messages as other users" },
			{ name: "Mention Everyone", flag: Permissions.MentionEveryone, description: "Mention @everyone and @here" },
			{ name: "Mention Roles", flag: Permissions.MentionRoles, description: "Mention roles that are mentionable" },
		],
	},
	{
		name: "Voice Permissions",
		icon: "mdiVolumeHigh",
		description: "Permissions related to voice channels",
		permissions: [
			{ name: "Connect", flag: Permissions.Connect, description: "Join voice channels" },
			{ name: "Speak", flag: Permissions.Speak, description: "Speak in voice channels" },
			{ name: "Video", flag: Permissions.Video, description: "Use video in voice channels" },
			{ name: "Mute Members", flag: Permissions.MuteMembers, description: "Mute other members" },
			{ name: "Deafen Members", flag: Permissions.DeafenMembers, description: "Deafen other members" },
			{ name: "Move Members", flag: Permissions.MoveMembers, description: "Move members between channels" },
		],
	},
	{
		name: "Member Permissions",
		icon: "mdiAccountGroup",
		description: "Permissions related to member management",
		permissions: [
			{ name: "Kick Members", flag: Permissions.KickMembers, description: "Kick members from the server" },
			{ name: "Ban Members", flag: Permissions.BanMembers, description: "Ban members from the server" },
			{ name: "Timeout Members", flag: Permissions.TimeoutMembers, description: "Timeout members temporarily" },
			{ name: "Assign Roles", flag: Permissions.AssignRoles, description: "Assign roles to members" },
			{ name: "Manage Nicknames", flag: Permissions.ManageNicknames, description: "Change member nicknames" },
			{ name: "Remove Avatars", flag: Permissions.RemoveAvatars, description: "Remove member avatars" },
			{ name: "Change Nickname", flag: Permissions.ChangeNickname, description: "Change own nickname" },
			{ name: "Change Avatar", flag: Permissions.ChangeAvatar, description: "Change own avatar" },
			{ name: "Invite Others", flag: Permissions.InviteOthers, description: "Create server invites" },
			{ name: "Manage Customisation", flag: Permissions.ManageCustomisation, description: "Manage server customization" },
		],
	},
];

interface RoleEditorProps {
	role: Role;
}

function RoleEditor({ role }: RoleEditorProps) {
	const app = useAppStore();
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	const { register, handleSubmit, reset, getValues, watch, setValue } = useForm({
		defaultValues: {
			name: role.name,
			color: role.color,
			hoist: role.hoist,
			mentionable: role.mentionable,
		},
	});

	// Watch for changes
	const watchedValues = watch();
	useState(() => {
		const subscription = watch((value, { name }) => {
			if (name) {
				setHasChanges(true);
			}
		});
		return () => subscription.unsubscribe();
	});

	const onSubmit = async (data: any) => {
		setIsSaving(true);
		try {
			await app.rest.patch(
				Routes.guildRole(role.app.activeGuild!.id, role.id),
				{
					name: data.name,
					color: parseInt(data.color.substring(1), 16),
					hoist: data.hoist,
					mentionable: data.mentionable,
				}
			);
			
			// Update local role data
			role.name = data.name;
			role.color = data.color;
			role.hoist = data.hoist;
			role.mentionable = data.mentionable;
			
			setHasChanges(false);
			console.log("Role updated successfully!");
		} catch (error) {
			console.error("Failed to update role:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handlePermissionChange = (permission: bigint, type: 'allow' | 'deny', checked: boolean) => {
		setHasChanges(true);
		// TODO: Implement permission management
		console.log(`Permission ${permission} ${type}: ${checked}`);
	};

	const handleSelectAllPermissions = (category: typeof permissionCategories[0], type: 'allow' | 'deny') => {
		setHasChanges(true);
		category.permissions.forEach(perm => {
			// TODO: Implement permission management
			console.log(`Setting ${perm.name} ${type} to true`);
		});
	};

	const handleClearPermissions = (category: typeof permissionCategories[0]) => {
		setHasChanges(true);
		category.permissions.forEach(perm => {
			// TODO: Implement permission management
			console.log(`Clearing ${perm.name}`);
		});
	};

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = e.target.value;
		setValue('color', newColor);
		setHasChanges(true);
	};

	return (
		<Container>
			<Header>
				<RoleHeader>
					<RoleAvatar color={watchedValues.color || role.color}>
						{role.name.charAt(0).toUpperCase()}
					</RoleAvatar>
					<RoleInfo>
						<RoleName>{watchedValues.name || role.name}</RoleName>
						<RoleMeta>
							<RoleMetaItem>
								<Icon icon="mdiAccount" size="14px" />
								{/* TODO: Get actual member count */}
								{Math.floor(Math.random() * 50) + 1} members
							</RoleMetaItem>
							<RoleMetaItem>
								<Icon icon="mdiFlag" size="14px" />
								Position #{role.position}
							</RoleMetaItem>
							{role.managed && (
								<RoleMetaItem>
									<Icon icon="mdiShield" size="14px" />
									Managed
								</RoleMetaItem>
							)}
						</RoleMeta>
					</RoleInfo>
					<RoleActions>
						<ActionButton variant="secondary" onClick={() => modalController.push({ type: "edit_role", role: role, onRoleUpdated: () => {} })}>
							<Icon icon="mdiPencil" size="14px" />
							Edit
						</ActionButton>
						<ActionButton variant="delete" onClick={() => modalController.push({ type: "delete_role", role: role, onRoleDeleted: () => {} })}>
							<Icon icon="mdiDelete" size="14px" />
							Delete
						</ActionButton>
					</RoleActions>
				</RoleHeader>
			</Header>

			<Content>
				<Section>
					<SectionTitle>
						<Icon icon="mdiCog" size="18px" />
						Basic Settings
					</SectionTitle>
					<SectionDescription>
						Configure the basic properties of this role.
					</SectionDescription>
					
					<FormGrid>
						<FormGroup>
							<Label>Role Name</Label>
							<Input 
								{...register("name")} 
								placeholder="Enter role name"
							/>
						</FormGroup>
						
						<FormGroup>
							<Label>Role Color</Label>
							<ColorInput>
								<ColorPreview 
									color={watchedValues.color || role.color}
									onClick={() => document.getElementById('color-input')?.click()}
								/>
								<ColorInputField
									id="color-input"
									{...register("color")}
									onChange={handleColorChange}
									placeholder="#000000"
								/>
							</ColorInput>
						</FormGroup>
					</FormGrid>

					<ToggleGroup>
						<ToggleItem>
							<Toggle 
								type="checkbox" 
								{...register("hoist")}
							/>
							Display role members separately from online members
						</ToggleItem>
						
						<ToggleItem>
							<Toggle 
								type="checkbox" 
								{...register("mentionable")}
							/>
							Allow anyone to @mention this role
						</ToggleItem>
					</ToggleGroup>
				</Section>

				<PermissionSection>
					<SectionTitle>
						<Icon icon="mdiShield" size="18px" />
						Permissions
					</SectionTitle>
					<SectionDescription>
						Configure what this role can and cannot do. Be careful with powerful permissions.
					</SectionDescription>

					{permissionCategories.map((category) => (
						<div key={category.name} style={{ marginBottom: '24px' }}>
							<PermissionHeader>
								<div>
									<h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
										{category.name}
									</h4>
									<p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
										{category.description}
									</p>
								</div>
								<PermissionActions>
									<PermissionButton 
										variant="select"
										onClick={() => handleSelectAllPermissions(category, 'allow')}
									>
										Select All
									</PermissionButton>
									<PermissionButton 
										variant="deselect"
										onClick={() => handleSelectAllPermissions(category, 'deny')}
									>
										Deselect All
									</PermissionButton>
									<PermissionButton 
										variant="clear"
										onClick={() => handleClearPermissions(category)}
									>
										Clear
									</PermissionButton>
								</PermissionActions>
							</PermissionHeader>
							
							<PermissionGrid>
								{category.permissions.map((permission) => (
									<PermissionItem key={permission.name}>
										<PermissionName>{permission.name}</PermissionName>
										<p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
											{permission.description}
										</p>
										<PermissionControls>
											<PermissionControl>
												<PermissionCheckbox
													type="checkbox"
													onChange={(e) => handlePermissionChange(permission.flag, 'allow', e.target.checked)}
												/>
												Allow
											</PermissionControl>
											<PermissionControl>
												<PermissionCheckbox
													type="checkbox"
													onChange={(e) => handlePermissionChange(permission.flag, 'deny', e.target.checked)}
												/>
												Deny
											</PermissionControl>
										</PermissionControls>
									</PermissionItem>
								))}
							</PermissionGrid>
						</div>
					))}
				</PermissionSection>
			</Content>

			<SaveSection>
				<SaveInfo>
					{hasChanges ? 'You have unsaved changes' : 'All changes saved'}
				</SaveInfo>
				<SaveButton 
					type="button" 
					onClick={handleSubmit(onSubmit)}
					disabled={!hasChanges || isSaving}
				>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</SaveButton>
			</SaveSection>
		</Container>
	);
}

export default observer(RoleEditor);
