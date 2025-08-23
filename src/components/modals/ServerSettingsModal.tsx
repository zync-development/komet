import { ModalProps } from "@/controllers/modals";
import Icon from "@components/Icon";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { Modal } from "./ModalComponents";
import { Routes } from "@spacebarchat/spacebar-api-types/v9";
import { ChannelType } from "@spacebarchat/spacebar-api-types/v9";

// Main container
const Container = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
	background: var(--background-primary);
`;

// Left sidebar
const Sidebar = styled.div`
	width: 240px;
	background: var(--background-secondary);
	border-right: 1px solid var(--background-tertiary);
	display: flex;
	flex-direction: column;
`;

const ServerName = styled.div`
	padding: 20px 16px 16px 16px;
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
	border-bottom: 1px solid var(--background-tertiary);
`;

const NavSection = styled.div`
	margin-top: 8px;
`;

const NavSectionHeader = styled.div`
	padding: 8px 16px 4px 16px;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const NavItem = styled.div<{ active?: boolean }>`
	display: flex;
	align-items: center;
	padding: 8px 16px;
	margin: 2px 8px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s ease;
	color: var(--text);
	background: ${props => props.active ? 'var(--background-primary)' : 'transparent'};

	&:hover {
		background: var(--background-primary);
	}
`;

const NavItemIcon = styled.div`
	margin-right: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
`;

const DeleteServerButton = styled.div`
	display: flex;
	align-items: center;
	padding: 8px 16px;
	margin: 8px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s ease;
	color: var(--error);
	margin-top: auto;
	margin-bottom: 16px;

	&:hover {
		background: var(--background-primary);
	}
`;

// Right content area
const Content = styled.div`
	flex: 1;
	background: var(--background-primary);
	overflow-y: auto;
`;

const ContentHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 24px 16px 24px;
	border-bottom: 1px solid var(--background-tertiary);
`;

const ContentTitle = styled.h1`
	font-size: 20px;
	font-weight: 600;
	color: var(--text);
	margin: 0;
`;

const CloseButton = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	color: var(--text-secondary);
`;

const CloseIcon = styled.div`
	width: 32px;
	height: 32px;
	border: 1px solid var(--background-tertiary);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 4px;
`;

const CloseText = styled.span`
	font-size: 12px;
	color: var(--text-secondary);
`;

// Overview section styles
const OverviewSection = styled.div`
	padding: 24px;
`;

const Section = styled.div`
	margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
	margin: 0 0 16px 0;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const AvatarSection = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 16px;
	margin-bottom: 24px;
`;

const Avatar = styled.div`
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: var(--background-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32px;
	font-weight: 600;
	color: var(--text);
	flex-shrink: 0;
`;

const AvatarContent = styled.div`
	flex: 1;
`;

const InputLabel = styled.label`
	display: block;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 8px;
`;

const Input = styled.input`
	width: 100%;
	padding: 8px 12px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	margin-bottom: 8px;

	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const RemoveLink = styled.a`
	color: var(--text-secondary);
	font-size: 12px;
	text-decoration: none;
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
`;

const TextArea = styled.textarea`
	width: 100%;
	padding: 8px 12px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	min-height: 80px;
	resize: vertical;
	margin-bottom: 8px;

	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const MarkdownInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: var(--text-secondary);
	margin-bottom: 8px;
`;

const BannerSection = styled.div`
	margin-bottom: 24px;
`;

const Banner = styled.div`
	width: 100%;
	height: 120px;
	background: var(--background-tertiary);
	border-radius: 4px;
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	padding: 16px;
	color: var(--text);
	font-weight: 600;
	margin-bottom: 8px;
`;

const SystemChannelsSection = styled.div`
	margin-bottom: 24px;
`;

const SystemChannelRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid var(--background-tertiary);
`;

const SystemChannelLabel = styled.span`
	color: var(--text);
	font-size: 14px;
`;

const Select = styled.select`
	padding: 6px 12px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
`;

const SaveButton = styled.button`
	padding: 8px 16px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-tertiary);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

// Categories section styles
const CategoriesContent = styled.div`
	padding: 24px;
`;

const CategoryButton = styled.div<{ active?: boolean }>`
	display: inline-block;
	padding: 8px 16px;
	margin: 4px;
	background: ${props => props.active ? 'var(--background-secondary)' : 'var(--background-tertiary)'};
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background: var(--background-secondary);
	}
`;

const AddButton = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 18px;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background: var(--background-secondary);
	}
`;

// Roles section styles
const RolesContent = styled.div`
	padding: 24px;
`;

const RoleTabs = styled.div`
	display: flex;
	gap: 8px;
	margin-bottom: 24px;
`;

const RoleTab = styled.button<{ active?: boolean }>`
	padding: 8px 16px;
	background: ${props => props.active ? 'var(--background-secondary)' : 'transparent'};
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-secondary);
	}
`;

const CreateRoleButton = styled.button`
	padding: 8px 16px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	cursor: pointer;
	margin-bottom: 24px;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-tertiary);
	}
`;

const PermissionItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid var(--background-tertiary);
`;

const PermissionInfo = styled.div`
	flex: 1;
`;

const PermissionName = styled.div`
	color: var(--text);
	font-size: 14px;
	font-weight: 500;
	margin-bottom: 4px;
`;

const PermissionDescription = styled.div`
	color: var(--text-secondary);
	font-size: 12px;
	line-height: 1.4;
`;

const PermissionCheckbox = styled.input`
	width: 18px;
	height: 18px;
	accent-color: var(--primary);
`;

// Emojis section styles
const EmojisContent = styled.div`
	padding: 24px;
`;

const WarningBanner = styled.div`
	background: #f97316;
	color: white;
	padding: 16px;
	border-radius: 4px;
	margin-bottom: 24px;
	display: flex;
	align-items: flex-start;
	gap: 12px;
`;

const WarningIcon = styled.div`
	flex-shrink: 0;
	margin-top: 2px;
`;

const WarningText = styled.div`
	font-size: 14px;
	line-height: 1.4;
`;

const UploadSection = styled.div`
	margin-bottom: 24px;
`;

const UploadTitle = styled.h3`
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
	margin: 0 0 16px 0;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const UploadArea = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 16px;
	margin-bottom: 16px;
`;

const EmojiPreview = styled.div`
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: var(--background-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
	font-size: 14px;
	flex-shrink: 0;
`;

const UploadInfo = styled.div`
	flex: 1;
`;

const UploadText = styled.div`
	color: var(--text);
	font-size: 14px;
	margin-bottom: 4px;
`;

const UploadSize = styled.div`
	color: var(--text-secondary);
	font-size: 12px;
`;

const EmojiNameInput = styled.input`
	width: 100%;
	padding: 8px 12px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	margin-bottom: 16px;

	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const EmojiSaveButton = styled.button`
	padding: 8px 16px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-tertiary);
	}
`;

const EmojiCount = styled.div`
	color: var(--text);
	font-size: 14px;
	font-weight: 500;
`;

// Members section styles
const MembersContent = styled.div`
	padding: 24px;
`;

const SearchInput = styled.input`
	width: 100%;
	padding: 12px 16px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	color: var(--text);
	font-size: 14px;
	margin-bottom: 16px;

	&::placeholder {
		color: var(--text-secondary);
	}

	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const MemberCount = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
	margin-bottom: 16px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const MemberItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid var(--background-tertiary);
`;

const MemberInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const MemberAvatar = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: var(--background-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text);
	font-size: 14px;
	font-weight: 500;
`;

const MemberName = styled.span`
	color: var(--text);
	font-size: 14px;
`;

const MemberDropdown = styled.div`
	color: var(--text-secondary);
	cursor: pointer;
`;

const RolesSection = styled.div`
	margin-top: 24px;
`;

// Invites section styles
const InvitesContent = styled.div`
	padding: 24px;
`;

const InviteHeaders = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 80px;
	gap: 16px;
	padding: 12px 0;
	border-bottom: 1px solid var(--background-tertiary);
	margin-bottom: 16px;
`;

const InviteHeader = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

// Bans section styles
const BansContent = styled.div`
	padding: 24px;
`;

const BanHeaders = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 80px;
	gap: 16px;
	padding: 12px 0;
	border-bottom: 1px solid var(--background-tertiary);
	margin-bottom: 16px;
`;

const BanHeader = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

type SettingsSection = 'overview' | 'categories' | 'roles' | 'emojis' | 'members' | 'invites' | 'bans';

function ServerSettingsModal(props: ModalProps<"server_settings">) {
	const app = useAppStore();
	const { target: guild } = props;
	const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	
	// Categories state
	const [isCreatingCategory, setIsCreatingCategory] = useState(false);
	const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [editingCategoryName, setEditingCategoryName] = useState('');
	const [showCreateDropdown, setShowCreateDropdown] = useState(false);
	const [newChannelName, setNewChannelName] = useState('');
	const [newChannelType, setNewChannelType] = useState<ChannelType>(ChannelType.GuildText);
	const [selectedCategoryForChannel, setSelectedCategoryForChannel] = useState<string | null>(null);

	// Get categories and channels
	const categories = app.channels.all.filter(channel => 
		channel.guildId === guild.id && channel.type === ChannelType.GuildCategory
	);
	
	const textChannels = app.channels.all.filter(channel => 
		channel.guildId === guild.id && channel.type === ChannelType.GuildText
	);
	
	const voiceChannels = app.channels.all.filter(channel => 
		channel.guildId === guild.id && channel.type === ChannelType.GuildVoice
	);

	// Get uncategorized channels (channels without a parent)
	const uncategorizedChannels = app.channels.all.filter(channel => 
		channel.guildId === guild.id && 
		(channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) &&
		!channel.parentId
	);

	// Check if user can manage channels (simplified check - you might need to implement proper permission checking)
	const canManageChannels = true; // TODO: Implement proper permission checking

	// Debug logging
	console.log('Guild ID:', guild.id);
	console.log('All channels:', app.channels.all);
	console.log('Categories found:', categories);
	console.log('Text channels found:', textChannels);
	console.log('Voice channels found:', voiceChannels);
	console.log('Uncategorized channels:', uncategorizedChannels);
	console.log('Can manage channels:', canManageChannels);

	const { register, handleSubmit, formState: { isSubmitting } } = useForm({
		defaultValues: {
			serverName: guild.name || '',
			serverDescription: guild.description || '',
		}
	});

	const onSubmit = async (data: { serverName: string; serverDescription: string }) => {
		console.log("Form data:", data);
		setError(null);
		setSuccess(false);
		setIsSaving(true);

		try {
			// Use your existing REST client instead of raw fetch
			const updatedGuildData = await app.rest.patch<{
				name: string;
				description: string;
			}, any>(
				Routes.guild(guild.id),
				{
					name: data.serverName,
					description: data.serverDescription,
				}
			);

			console.log("Server updated successfully:", updatedGuildData);

			// Update only the specific properties we changed to avoid MobX computed property errors
			guild.name = updatedGuildData.name;
			guild.description = updatedGuildData.description;

			setSuccess(true);
			setTimeout(() => {
				props.onClose?.(); // Close modal on success
			}, 1500);

		} catch (error: any) {
			console.error("Error updating server:", error);
			
			// Handle different types of errors
			if (error.message?.includes("MISSING_PERMISSIONS")) {
				setError("You don't have permission to manage this server. You need the 'Manage Server' permission.");
			} else if (error.message?.includes("MANAGE_GUILD")) {
				setError("You need the 'Manage Server' permission to update server settings.");
			} else if (error.status === 403) {
				setError("Access denied. You don't have permission to modify this server.");
			} else if (error.status === 404) {
				setError("Server not found. Please refresh and try again.");
			} else {
				setError(error.message || "Failed to update server. Please try again.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	// Categories functions
	const createCategory = async () => {
		if (!newCategoryName.trim()) return;
		
		try {
			console.log('Creating category:', newCategoryName.trim());
			console.log('Guild ID:', guild.id);
			
			const newCategory = await app.rest.post(Routes.guildChannels(guild.id), {
				name: newCategoryName.trim(),
				type: ChannelType.GuildCategory,
				position: categories.length
			});
			
			console.log("Category created:", newCategory);
			setNewCategoryName('');
			setIsCreatingCategory(false);
			
			// Refresh the page or update local state
			window.location.reload();
		} catch (error: any) {
			console.error("Error creating category:", error);
			
			// Handle specific permission errors
			if (error.message?.includes("MISSING_PERMISSIONS")) {
				setError("You need the 'Manage Channels' permission to create categories.");
			} else if (error.message?.includes("MANAGE_CHANNELS")) {
				setError("You need the 'Manage Channels' permission to create categories.");
			} else if (error.status === 403) {
				setError("Access denied. You need the 'Manage Channels' permission.");
			} else {
				setError("Failed to create category: " + (error.message || "Unknown error"));
			}
		}
	};

	const updateCategory = async (categoryId: string) => {
		if (!editingCategoryName.trim()) return;
		
		try {
			await app.rest.patch(Routes.channel(categoryId), {
				name: editingCategoryName.trim()
			});
			
			console.log("Category updated:", categoryId);
			setEditingCategoryId(null);
			setEditingCategoryName('');
			
			// Refresh the page or update local state
			window.location.reload();
		} catch (error: any) {
			console.error("Error updating category:", error);
			setError("Failed to update category: " + (error.message || "Unknown error"));
		}
	};

	const deleteCategory = async (categoryId: string) => {
		if (!confirm("Are you sure you want to delete this category? All channels in it will be moved to the top level.")) {
			return;
		}
		
		try {
			await app.rest.delete(Routes.channel(categoryId));
			
			console.log("Category deleted:", categoryId);
			
			// Refresh the page or update local state
			window.location.reload();
		} catch (error: any) {
			console.error("Error deleting category:", error);
			setError("Failed to delete category: " + (error.message || "Unknown error"));
		}
	};

	const createChannel = async () => {
		if (!newChannelName.trim()) return;
		
		try {
			console.log('Creating channel:', newChannelName.trim(), 'Type:', newChannelType);
			console.log('Guild ID:', guild.id, 'Parent ID:', selectedCategoryForChannel);
			
			const newChannel = await app.rest.post(Routes.guildChannels(guild.id), {
				name: newChannelName.trim(),
				type: newChannelType,
				parent_id: selectedCategoryForChannel
			});
			
			console.log("Channel created:", newChannel);
			setNewChannelName('');
			setSelectedCategoryForChannel(null);
			setShowCreateDropdown(false);
			
			// Refresh the page or update local state
			window.location.reload();
		} catch (error: any) {
			console.error("Error creating channel:", error);
			
			// Handle specific permission errors
			if (error.message?.includes("MISSING_PERMISSIONS")) {
				setError("You need the 'Manage Channels' permission to create channels.");
			} else if (error.message?.includes("MANAGE_CHANNELS")) {
				setError("You need the 'Manage Channels' permission to create channels.");
			} else if (error.status === 403) {
				setError("Access denied. You need the 'Manage Channels' permission.");
			} else {
				setError("Failed to create channel: " + (error.message || "Unknown error"));
			}
		}
	};

	const handleClose = () => {
		props.onClose?.();
	};

	const handleSectionChange = (section: SettingsSection) => {
		setActiveSection(section);
		setError(null); // Clear any errors when switching sections
		setSuccess(false);
	};

	const renderOverview = () => (
		<OverviewSection as="form" onSubmit={handleSubmit(onSubmit)}>
			{/* Error Message */}
			{error && (
				<div style={{
					background: 'var(--error)',
					color: 'white',
					padding: '12px',
					borderRadius: '4px',
					marginBottom: '16px',
					fontSize: '14px'
				}}>
					{error}
				</div>
			)}

			{/* Success Message */}
			{success && (
				<div style={{
					background: 'var(--success)',
					color: 'white',
					padding: '12px',
					borderRadius: '4px',
					marginBottom: '16px',
					fontSize: '14px'
				}}>
					Server updated successfully!
				</div>
			)}

			<Section>
				<SectionTitle>Server Name</SectionTitle>
				<AvatarSection>
					<Avatar>
						{guild.name?.charAt(0).toUpperCase() || 'G'}
					</Avatar>
					<AvatarContent>
						<InputLabel>Server Name</InputLabel>
						<Input
							type="text"
							{...register("serverName", { 
								required: "Server name is required",
								minLength: { value: 2, message: "Server name must be at least 2 characters" },
								maxLength: { value: 100, message: "Server name must be less than 100 characters" }
							})}
							placeholder="Enter server name"
						/>
						<RemoveLink>Remove (max 2.50 MB)</RemoveLink>
					</AvatarContent>
				</AvatarSection>
			</Section>

			<Section>
				<SectionTitle>Server Description</SectionTitle>
				<TextArea
					placeholder="Add a topic..."
					{...register("serverDescription", {
						maxLength: { value: 500, message: "Description must be less than 500 characters" }
					})}
				/>
				<MarkdownInfo>
					<Icon icon="mdiFormatText" size="16px" />
					Server descriptions support Markdown formatting. <a href="#" style={{color: '#00b0f4'}}>Learn more here.</a>
				</MarkdownInfo>
			</Section>

			<Section>
				<SectionTitle>Custom Banner</SectionTitle>
				<BannerSection>
					<Banner>
						Benguin <Icon icon="mdiCheckCircle" size="16px" color="#00b0f4" />
					</Banner>
					<RemoveLink>Remove (max 6.00 MB)</RemoveLink>
				</BannerSection>
			</Section>

			<Section>
				<SectionTitle>System Message Channels</SectionTitle>
				<SystemChannelsSection>
					<SystemChannelRow>
						<SystemChannelLabel>User Joined</SystemChannelLabel>
						<Select defaultValue="disabled">
							<option value="disabled">Disabled</option>
						</Select>
					</SystemChannelRow>
					<SystemChannelRow>
						<SystemChannelLabel>User Left</SystemChannelLabel>
						<Select defaultValue="disabled">
							<option value="disabled">Disabled</option>
						</Select>
					</SystemChannelRow>
					<SystemChannelRow>
						<SystemChannelLabel>User Kicked</SystemChannelLabel>
						<Select defaultValue="disabled">
							<option value="disabled">Disabled</option>
						</Select>
					</SystemChannelRow>
					<SystemChannelRow>
						<SystemChannelLabel>User Banned</SystemChannelLabel>
						<Select defaultValue="disabled">
							<option value="disabled">Disabled</option>
						</Select>
					</SystemChannelRow>
				</SystemChannelsSection>
			</Section>

			<SaveButton 
				type="submit" 
				disabled={isSaving || isSubmitting}
				style={{
					background: isSaving ? 'var(--background-tertiary)' : 'var(--background-secondary)',
					cursor: isSaving ? 'not-allowed' : 'pointer'
				}}
			>
				{isSaving ? 'Saving...' : 'Save Changes'}
			</SaveButton>
		</OverviewSection>
	);

	const renderCategories = () => (
		<CategoriesContent>
			<Section>
				<SectionTitle>Categories</SectionTitle>
				
				{/* Error/Success Messages */}
				{error && (
					<div style={{
						background: 'var(--error)',
						color: 'white',
						padding: '12px',
						borderRadius: '4px',
						marginBottom: '16px',
						fontSize: '14px'
					}}>
						{error}
					</div>
				)}

				{/* Create New Category/Channel Dropdown */}
				{canManageChannels && (
					<div style={{ position: 'relative', marginBottom: '20px' }}>
						{!showCreateDropdown ? (
							<button
								onClick={() => setShowCreateDropdown(true)}
								style={{
									background: 'var(--primary)',
									color: 'white',
									border: 'none',
									borderRadius: '6px',
									padding: '10px 16px',
									fontSize: '14px',
									fontWeight: '500',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									transition: 'background-color 0.2s ease'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'var(--primary-hover)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'var(--primary)';
								}}
							>
								<Icon icon="mdiPlus" size="16px" />
								Create
								<Icon icon="mdiChevronDown" size="14px" />
							</button>
						) : (
							<div style={{
								background: 'var(--background-secondary)',
								borderRadius: '8px',
								border: '1px solid var(--background-tertiary)',
								overflow: 'hidden',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
							}}>
								{/* Create Category */}
								{!isCreatingCategory ? (
									<button
										onClick={() => {
											setIsCreatingCategory(true);
											setShowCreateDropdown(false);
										}}
										style={{
											width: '100%',
											background: 'none',
											border: 'none',
											padding: '12px 16px',
											color: 'var(--text)',
											fontSize: '14px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											transition: 'background-color 0.2s ease'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = 'var(--background-tertiary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = 'none';
										}}
									>
										<Icon icon="mdiFolderPlus" size="16px" />
										Create Category
									</button>
								) : (
									<div style={{ padding: '16px' }}>
										<Input
											type="text"
											placeholder="Category name"
											value={newCategoryName}
											onChange={(e) => setNewCategoryName(e.target.value)}
											style={{ marginBottom: '12px' }}
										/>
										<div style={{ display: 'flex', gap: '8px' }}>
											<SaveButton 
												onClick={createCategory}
												disabled={!newCategoryName.trim()}
												style={{ flex: 1 }}
											>
												Create
											</SaveButton>
											<SaveButton 
												onClick={() => {
													setIsCreatingCategory(false);
													setNewCategoryName('');
												}}
												style={{ 
													flex: 1,
													background: 'var(--background-tertiary)',
													color: 'var(--text-muted)'
												}}
											>
												Cancel
											</SaveButton>
										</div>
									</div>
								)}

								{/* Divider */}
								{!isCreatingCategory && (
									<div style={{
										height: '1px',
										background: 'var(--background-tertiary)',
										margin: '0 16px'
									}} />
								)}

								{/* Create Channel */}
								{!isCreatingCategory && (
									<div style={{ padding: '16px' }}>
										<div style={{ marginBottom: '12px' }}>
											<Input
												type="text"
												placeholder="Channel name"
												value={newChannelName}
												onChange={(e) => setNewChannelName(e.target.value)}
												style={{ marginBottom: '8px' }}
											/>
											
											{/* Channel Type Selection */}
											<select
												value={newChannelType}
												onChange={(e) => setNewChannelType(Number(e.target.value))}
												style={{
													width: '100%',
													padding: '8px 12px',
													borderRadius: '4px',
													border: '1px solid var(--background-tertiary)',
													background: 'var(--background-primary)',
													color: 'var(--text)',
													fontSize: '14px',
													marginBottom: '8px'
												}}
											>
												<option value={ChannelType.GuildText}>Text Channel</option>
												<option value={ChannelType.GuildVoice}>Voice Channel</option>
												<option value={ChannelType.GuildAnnouncement}>Announcement Channel</option>
												<option value={ChannelType.GuildStageVoice}>Stage Channel</option>
												<option value={ChannelType.GuildForum}>Forum Channel</option>
											</select>

											{/* Category Selection */}
											<select
												value={selectedCategoryForChannel || ''}
												onChange={(e) => setSelectedCategoryForChannel(e.target.value || null)}
												style={{
													width: '100%',
													padding: '8px 12px',
													borderRadius: '4px',
													border: '1px solid var(--background-tertiary)',
													background: 'var(--background-primary)',
													color: 'var(--text)',
													fontSize: '14px',
													marginBottom: '12px'
												}}
											>
												<option value="">No Category</option>
												{categories.map(category => (
													<option key={category.id} value={category.id}>
														{category.name}
													</option>
												))}
											</select>
										</div>
										
										<div style={{ display: 'flex', gap: '8px' }}>
											<SaveButton 
												onClick={createChannel}
												disabled={!newChannelName.trim()}
												style={{ flex: 1 }}
											>
												Create
											</SaveButton>
											<SaveButton 
												onClick={() => {
													setShowCreateDropdown(false);
													setNewChannelName('');
													setSelectedCategoryForChannel(null);
												}}
												style={{ 
													flex: 1,
													background: 'var(--background-tertiary)',
													color: 'var(--text-muted)'
												}}
											>
												Cancel
											</SaveButton>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Permission message */}
				{!canManageChannels && (
					<div style={{
						background: 'var(--background-tertiary)',
						color: 'var(--text-muted)',
						padding: '12px 16px',
						borderRadius: '6px',
						marginBottom: '20px',
						fontSize: '14px',
						textAlign: 'center'
					}}>
						You need the "Manage Channels" permission to create categories.
					</div>
				)}

				{/* Existing Categories */}
				{categories.length === 0 ? (
					<div>
						{/* Show uncategorized channels if no categories exist */}
						{uncategorizedChannels.length > 0 && (
							<div style={{
								background: 'var(--background-secondary)',
								borderRadius: '8px',
								marginBottom: '16px',
								border: '1px solid var(--background-tertiary)',
								overflow: 'hidden'
							}}>
								<div style={{
									background: 'var(--background-tertiary)',
									padding: '12px 16px',
									fontWeight: '600',
									color: 'var(--text)',
									fontSize: '14px'
								}}>
									Uncategorized Channels
								</div>
								<div style={{ padding: '8px 16px' }}>
									{uncategorizedChannels.map(channel => (
										<div key={channel.id} style={{
											display: 'flex',
											alignItems: 'center',
											padding: '4px 0',
											color: 'var(--text-muted)',
											fontSize: '13px'
										}}>
											<Icon 
												icon={channel.type === ChannelType.GuildText ? "mdiPound" : "mdiVolumeHigh"} 
												size="14px" 
												style={{ marginRight: '8px' }} 
											/>
											{channel.name}
										</div>
									))}
								</div>
							</div>
						)}
						
						{/* No categories message */}
						<div style={{
							textAlign: 'center',
							padding: '32px',
							color: 'var(--text-muted)',
							fontSize: '14px'
						}}>
							{uncategorizedChannels.length === 0 
								? "No channels found. This server might not have any channels yet."
								: "No categories yet. Create your first category to organize your channels!"
							}
						</div>
					</div>
				) : (
					categories.map((category) => (
						<div key={category.id} style={{
							background: 'var(--background-secondary)',
							borderRadius: '8px',
							marginBottom: '12px',
							border: '1px solid var(--background-tertiary)',
							overflow: 'hidden'
						}}>
							{/* Category Header */}
							<div style={{
								background: 'var(--background-tertiary)',
								padding: '12px 16px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between'
							}}>
								{editingCategoryId === category.id ? (
									<Input
										type="text"
										value={editingCategoryName}
										onChange={(e) => setEditingCategoryName(e.target.value)}
										style={{ flex: 1, marginRight: '8px' }}
									/>
								) : (
									<span style={{ 
										fontWeight: '600',
										color: 'var(--text)',
										fontSize: '14px'
									}}>
										{category.name}
									</span>
								)}
								
								<div style={{ display: 'flex', gap: '4px' }}>
									{editingCategoryId === category.id ? (
										<>
											<button
												onClick={() => updateCategory(category.id)}
												disabled={!editingCategoryName.trim()}
												style={{
													background: 'var(--primary)',
													color: 'white',
													border: 'none',
													borderRadius: '4px',
													padding: '4px 8px',
													fontSize: '12px',
													cursor: 'pointer',
													opacity: editingCategoryName.trim() ? 1 : 0.5
												}}
											>
												Save
											</button>
											<button
												onClick={() => {
													setEditingCategoryId(null);
													setEditingCategoryName('');
												}}
												style={{
													background: 'var(--background-tertiary)',
													color: 'var(--text-muted)',
													border: 'none',
													borderRadius: '4px',
													padding: '4px 8px',
													fontSize: '12px',
													cursor: 'pointer'
												}}
											>
												Cancel
											</button>
										</>
									) : (
										<>
											<button
												onClick={() => {
													setEditingCategoryId(category.id);
													setEditingCategoryName(category.name || '');
												}}
												style={{
													background: 'var(--background-tertiary)',
													color: 'var(--text-muted)',
													border: 'none',
													borderRadius: '4px',
													padding: '4px 8px',
													fontSize: '12px',
													cursor: 'pointer'
												}}
											>
												<Icon icon="mdiPencil" size="12px" />
											</button>
											<button
												onClick={() => deleteCategory(category.id)}
												style={{
													background: 'var(--error)',
													color: 'white',
													border: 'none',
													borderRadius: '4px',
													padding: '4px 8px',
													fontSize: '12px',
													cursor: 'pointer'
												}}
											>
												<Icon icon="mdiDelete" size="12px" />
											</button>
										</>
									)}
								</div>
							</div>
							
							{/* Category Channels */}
							<div style={{ padding: '8px 16px' }}>
								{/* Text Channels */}
								{textChannels
									.filter(channel => channel.parentId === category.id)
									.map(channel => (
										<div key={channel.id} style={{
											display: 'flex',
											alignItems: 'center',
											padding: '4px 0',
											color: 'var(--text-muted)',
											fontSize: '13px'
										}}>
											<Icon icon="mdiPound" size="14px" style={{ marginRight: '8px' }} />
											{channel.name}
										</div>
									))
								}
								
								{/* Voice Channels */}
								{voiceChannels
									.filter(channel => channel.parentId === category.id)
									.map(channel => (
										<div key={channel.id} style={{
											display: 'flex',
											alignItems: 'center',
											padding: '4px 0',
											color: 'var(--text-muted)',
											fontSize: '13px'
										}}>
											<Icon icon="mdiVolumeHigh" size="14px" style={{ marginRight: '8px' }} />
											{channel.name}
										</div>
									))
								}
								
								{/* No channels in category */}
								{textChannels.filter(ch => ch.parentId === category.id).length === 0 &&
								 voiceChannels.filter(ch => ch.parentId === category.id).length === 0 && (
									<div style={{
										color: 'var(--text-muted)',
										fontSize: '12px',
										fontStyle: 'italic',
										padding: '8px 0',
										textAlign: 'center'
									}}>
										No channels in this category
									</div>
								)}
							</div>
						</div>
					))
				)}

				{/* Show uncategorized channels if they exist */}
				{uncategorizedChannels.length > 0 && (
					<div style={{
						background: 'var(--background-secondary)',
						borderRadius: '8px',
						marginTop: '16px',
						border: '1px solid var(--background-tertiary)',
						overflow: 'hidden'
					}}>
						<div style={{
							background: 'var(--background-tertiary)',
							padding: '12px 16px',
							fontWeight: '600',
							color: 'var(--text)',
							fontSize: '14px'
						}}>
							Uncategorized Channels
						</div>
						<div style={{ padding: '8px 16px' }}>
							{uncategorizedChannels.map(channel => (
								<div key={channel.id} style={{
									display: 'flex',
									alignItems: 'center',
									padding: '4px 0',
									color: 'var(--text-muted)',
									fontSize: '13px'
								}}>
									<Icon 
										icon={channel.type === ChannelType.GuildText ? "mdiPound" : "mdiVolumeHigh"} 
										size="14px" 
										style={{ marginRight: '8px' }} 
									/>
									{channel.name}
								</div>
							))}
						</div>
					</div>
				)}
			</Section>
		</CategoriesContent>
	);

	const renderRoles = () => (
		<RolesContent>
			<RoleTabs>
				<RoleTab active>Default</RoleTab>
				<RoleTab>Role Ranking</RoleTab>
				<RoleTab>Save</RoleTab>
			</RoleTabs>
			
			<CreateRoleButton>Create Role</CreateRoleButton>

			<SectionTitle>Edit Permissions</SectionTitle>
			
			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Manage Channels</PermissionName>
					<PermissionDescription>Allows members to edit or delete a channel.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Manage Server</PermissionName>
					<PermissionDescription>Allows members to change this server's name, description, icon and other related information.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Manage Permissions</PermissionName>
					<PermissionDescription>Allows members to change permissions for channels and roles with a lower ranking.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Manage Roles</PermissionName>
					<PermissionDescription>Allows members to create, edit and delete roles with a lower rank than theirs. Also allows them to modify role permissions on channels.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Manage Customization</PermissionName>
					<PermissionDescription>Allows members to create, edit and delete emojis.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Kick Members</PermissionName>
					<PermissionDescription>Allows members to remove members from this server. Kicked members may rejoin with an invite.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Ban Members</PermissionName>
					<PermissionDescription>Allows members to permanently remove members from this server.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Timeout Members</PermissionName>
					<PermissionDescription>Allows members to temporarily prevent users from interacting with the server.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Assign Roles</PermissionName>
					<PermissionDescription>Allows members to assign roles below their own rank to other members.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Change Nickname</PermissionName>
					<PermissionDescription>Allows members to change their nickname on this server.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" defaultChecked />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Manage Nicknames</PermissionName>
					<PermissionDescription>Allows members to change the nicknames of other members.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Change Avatar</PermissionName>
					<PermissionDescription>Allows members to change their server avatar on this server.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" defaultChecked />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Remove Avatars</PermissionName>
					<PermissionDescription>Allows members to remove the server avatars of other members on this server.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>View Channel</PermissionName>
					<PermissionDescription>Allows members to view any channels they have this permission on.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" defaultChecked />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Send Messages</PermissionName>
					<PermissionDescription>Allows members to send messages in text channels.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" defaultChecked />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Manage Messages</PermissionName>
					<PermissionDescription>Allows members to delete messages sent by other members.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Invite Others</PermissionName>
					<PermissionDescription>Allows members to invite other users to a channel.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" defaultChecked />
			</PermissionItem>

			<PermissionItem>
				<PermissionInfo>
					<PermissionName>Send Embeds</PermissionName>
					<PermissionDescription>Allows members to send embedded content, whether from links or custom.</PermissionDescription>
				</PermissionInfo>
				<PermissionCheckbox type="checkbox" defaultChecked />
			</PermissionItem>
		</RolesContent>
	);

	const renderEmojis = () => (
		<EmojisContent>
			<WarningBanner>
				<WarningIcon>
					<Icon icon="mdiInformation" size="20px" />
				</WarningIcon>
				<WarningText>
					This UI was never finished and will be polished in the new client.<br />
					Also please note that emoji names must be lowercase alphanumeric!
				</WarningText>
			</WarningBanner>

			<UploadSection>
				<UploadTitle>Upload Emoji</UploadTitle>
				<UploadArea>
					<EmojiPreview>Upload</EmojiPreview>
					<UploadInfo>
						<UploadText>Upload</UploadText>
						<UploadSize>(max 500.00 KB)</UploadSize>
					</UploadInfo>
				</UploadArea>
				
				<InputLabel>Name</InputLabel>
				<EmojiNameInput 
					type="text" 
					placeholder="Enter emoji name"
				/>
				
				<EmojiSaveButton>Save</EmojiSaveButton>
			</UploadSection>

			<EmojiCount>Emojis - 0</EmojiCount>
		</EmojisContent>
	);

	const renderMembers = () => (
		<MembersContent>
			<SearchInput 
				placeholder="Search for a specific user..." 
			/>
			
			<MemberCount>1 Members</MemberCount>
			
			<MemberItem>
				<MemberInfo>
					<MemberAvatar>B</MemberAvatar>
					<MemberName>benguin</MemberName>
				</MemberInfo>
				<MemberDropdown>
					<Icon icon="mdiChevronDown" size="16px" />
				</MemberDropdown>
			</MemberItem>

			<RolesSection>
				<SectionTitle>Roles</SectionTitle>
				<SaveButton>Save</SaveButton>
			</RolesSection>
		</MembersContent>
	);

	const renderInvites = () => (
		<InvitesContent>
			<InviteHeaders>
				<InviteHeader>Invite Code</InviteHeader>
				<InviteHeader>Inviter</InviteHeader>
				<InviteHeader>Channel</InviteHeader>
				<InviteHeader>Revoke</InviteHeader>
			</InviteHeaders>
			{/* No invites to display */}
		</InvitesContent>
	);

	const renderBans = () => (
		<BansContent>
			<SearchInput 
				placeholder="Search for a specific user..." 
			/>
			
			<BanHeaders>
				<BanHeader>User</BanHeader>
				<BanHeader>Ban Reason</BanHeader>
				<BanHeader>Revoke</BanHeader>
			</BanHeaders>
			{/* No bans to display */}
		</BansContent>
	);

	const renderContent = () => {
		switch (activeSection) {
			case 'overview':
				return renderOverview();
			case 'categories':
				return renderCategories();
			case 'roles':
				return renderRoles();
			case 'emojis':
				return renderEmojis();
			case 'members':
				return renderMembers();
			case 'invites':
				return renderInvites();
			case 'bans':
				return renderBans();
			default:
				return renderOverview();
		}
	};

	return (
		<Modal {...props} fullScreen withoutCloseButton withEmptyActionBar padding="0">
			<Container>
				<Sidebar>
					<ServerName>{guild.name}</ServerName>
					
					<NavSection>
						<NavItem 
							active={activeSection === 'overview'} 
							onClick={() => handleSectionChange('overview')}
						>
							<NavItemIcon>
								<Icon icon="mdiInformation" size="20px" />
							</NavItemIcon>
							Overview
						</NavItem>
						<NavItem 
							active={activeSection === 'categories'} 
							onClick={() => handleSectionChange('categories')}
						>
							<NavItemIcon>
								<Icon icon="mdiFormatListBulleted" size="20px" />
							</NavItemIcon>
							Categories
						</NavItem>
						<NavItem 
							active={activeSection === 'roles'} 
							onClick={() => handleSectionChange('roles')}
						>
							<NavItemIcon>
								<Icon icon="mdiFlag" size="20px" />
							</NavItemIcon>
							Roles
						</NavItem>
					</NavSection>

					<NavSection>
						<NavSectionHeader>Customization</NavSectionHeader>
						<NavItem 
							active={activeSection === 'emojis'} 
							onClick={() => handleSectionChange('emojis')}
						>
							<NavItemIcon>
								<Icon icon="mdiEmoticon" size="20px" />
							</NavItemIcon>
							Emojis
						</NavItem>
					</NavSection>

					<NavSection>
						<NavSectionHeader>User Management</NavSectionHeader>
						<NavItem 
							active={activeSection === 'members'} 
							onClick={() => handleSectionChange('members')}
						>
							<NavItemIcon>
								<Icon icon="mdiAccountGroup" size="20px" />
							</NavItemIcon>
							Members
						</NavItem>
						<NavItem 
							active={activeSection === 'invites'} 
							onClick={() => handleSectionChange('invites')}
						>
							<NavItemIcon>
								<Icon icon="mdiEmail" size="20px" />
							</NavItemIcon>
							Invites
						</NavItem>
						<NavItem 
							active={activeSection === 'bans'} 
							onClick={() => handleSectionChange('bans')}
						>
							<NavItemIcon>
								<Icon icon="mdiAccountRemove" size="20px" />
							</NavItemIcon>
							Bans
						</NavItem>
					</NavSection>

					<DeleteServerButton>
						<NavItemIcon>
							<Icon icon="mdiDelete" size="20px" color="var(--error)" />
						</NavItemIcon>
						Delete server
					</DeleteServerButton>
				</Sidebar>

				<Content>
					<ContentHeader>
						<ContentTitle>
							{activeSection === 'overview' && 'Overview'}
							{activeSection === 'categories' && 'Categories'}
							{activeSection === 'roles' && 'Edit Default'}
							{activeSection === 'emojis' && 'Emojis'}
							{activeSection === 'members' && 'Members'}
							{activeSection === 'invites' && 'Invites'}
							{activeSection === 'bans' && 'Bans'}
						</ContentTitle>
						
						{activeSection === 'categories' && (
							<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
								<span style={{color: 'var(--text-secondary)', fontSize: '14px'}}>Saving</span>
								<Icon icon="mdiLoading" size="16px" style={{animation: 'spin 1s linear infinite'}} />
							</div>
						)}
						
						<CloseButton onClick={handleClose}>
							<CloseIcon>
								<Icon icon="mdiClose" size="18px" />
							</CloseIcon>
							<CloseText>ESC</CloseText>
						</CloseButton>
					</ContentHeader>

					{renderContent()}
				</Content>
			</Container>

			<style>
				{`
					@keyframes spin {
						from { transform: rotate(0deg); }
						to { transform: rotate(360deg); }
					}
				`}
			</style>
		</Modal>
	);
}

export default observer(ServerSettingsModal);
