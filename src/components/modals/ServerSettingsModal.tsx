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
import CreateRoleModal from "./CreateRoleModal";
import EditRoleModal from "./EditRoleModal";
import DeleteRoleModal from "./DeleteRoleModal";
import RolesSettingsPage from "./SettingsPages/RolesSettingsPage";
import CreateInviteModal from "./CreateInviteModal";
import MembersSettingsPage from "./SettingsPages/MembersSettingsPage";

// Main container
const Container = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
	background: var(--background-primary);
`;

// Left sidebar
const Sidebar = styled.div`
	width: 280px;
	background: var(--background-secondary);
	border-right: 1px solid rgba(255, 255, 255, 0.06);
	display: flex;
	flex-direction: column;
`;

const ServerName = styled.div`
	padding: 24px 20px 20px 20px;
	font-size: 18px;
	font-weight: 700;
	color: var(--text);
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
`;

const NavSection = styled.div`
	margin-top: 16px;
`;

const NavSectionHeader = styled.div`
	padding: 12px 20px 8px 20px;
	font-size: 11px;
	font-weight: 700;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 1px;
`;

const NavItem = styled.div<{ active?: boolean }>`
	display: flex;
	align-items: center;
	padding: 12px 20px;
	margin: 4px 12px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.15s ease;
	color: var(--text);
	background: ${props => props.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
	font-weight: ${props => props.active ? '600' : '500'};

	&:hover {
		background: ${props => props.active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
		transform: translateX(2px);
	}
`;

const NavItemIcon = styled.div`
	margin-right: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	opacity: 0.8;
`;

const DeleteServerButton = styled.div`
	display: flex;
	align-items: center;
	padding: 12px 20px;
	margin: 12px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.15s ease;
	color: var(--error);
	margin-top: auto;
	margin-bottom: 20px;
	font-weight: 600;

	&:hover {
		background: rgba(239, 68, 68, 0.1);
		transform: translateX(2px);
	}
`;

// Right content area
const Content = styled.div`
	flex: 1;
	background: var(--background-primary);
	overflow-y: auto;
	padding: 32px;
`;

const ContentHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 32px;
	padding-bottom: 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const ContentTitle = styled.h1`
	margin: 0;
	font-size: 28px;
	font-weight: 700;
	color: var(--text);
`;

const ContentDescription = styled.p`
	margin: 8px 0 0 0;
	font-size: 16px;
	color: var(--text-secondary);
	line-height: 1.5;
`;

// Overview section styles
const OverviewContent = styled.div`
	padding: 0;
`;

// Form section styles
const FormSection = styled.div`
	background: var(--background-secondary);
	border-radius: 16px;
	padding: 32px;
	margin-bottom: 24px;
	border: 1px solid rgba(255, 255, 255, 0.06);
`;

const SectionTitle = styled.h3`
	margin: 0 0 24px 0;
	font-size: 20px;
	font-weight: 600;
	color: var(--text);
`;

const InputGroup = styled.div`
	margin-bottom: 24px;
`;

const InputLabel = styled.label`
	display: block;
	margin-bottom: 8px;
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
`;

const Input = styled.input`
	width: 100%;
	padding: 14px 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	background: var(--background-tertiary);
	color: var(--text);
	font-size: 14px;
	transition: all 0.15s ease;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
		transform: translateY(-1px);
	}
	
	&:hover {
		border-color: rgba(255, 255, 255, 0.2);
	}
`;

const TextArea = styled.textarea`
	width: 100%;
	padding: 14px 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	background: var(--background-tertiary);
	color: var(--text);
	font-size: 14px;
	min-height: 100px;
	resize: vertical;
	transition: all 0.15s ease;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
		transform: translateY(-1px);
	}
	
	&:hover {
		border-color: rgba(255, 255, 255, 0.2);
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 16px;
	justify-content: flex-end;
	margin-top: 32px;
`;

const SaveButton = styled.button`
	padding: 12px 24px;
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.15s ease;
	
	&:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}
	
	&:disabled {
		background: var(--background-tertiary);
		cursor: not-allowed;
		opacity: 0.5;
		transform: none;
	}
`;

const CancelButton = styled.button`
	padding: 12px 24px;
	background: var(--background-tertiary);
	color: var(--text);
	border: none;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.15s ease;
	
	&:hover {
	background: var(--background-primary);
		transform: translateY(-2px);
	}
`;

const ErrorMessage = styled.div`
	background: rgba(239, 68, 68, 0.1);
	color: var(--error);
	padding: 16px;
	border-radius: 12px;
	margin-bottom: 24px;
	font-size: 14px;
	border: 1px solid rgba(239, 68, 68, 0.2);
`;

const SuccessMessage = styled.div`
	background: rgba(34, 197, 94, 0.1);
	color: var(--success);
	padding: 16px;
	border-radius: 12px;
	margin-bottom: 24px;
	font-size: 14px;
	border: 1px solid rgba(34, 197, 94, 0.2);
`;

// Banner and system channels styles
const BannerSection = styled.div`
	margin-bottom: 24px;
`;

const Banner = styled.div`
	width: 100%;
	height: 120px;
	background: var(--background-tertiary);
	border-radius: 12px;
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	padding: 16px;
	color: var(--text);
	font-weight: 600;
	margin-bottom: 8px;
	border: 1px solid rgba(255, 255, 255, 0.06);
`;

const RemoveLink = styled.a`
	color: var(--text-secondary);
	font-size: 12px;
	text-decoration: none;
	cursor: pointer;
	transition: color 0.15s ease;

	&:hover {
		color: var(--text);
		text-decoration: underline;
	}
`;

const SystemChannelsSection = styled.div`
	margin-bottom: 24px;
`;

const SystemChannelRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const SystemChannelLabel = styled.span`
	color: var(--text);
	font-size: 14px;
	font-weight: 500;
`;

const Select = styled.select`
	padding: 10px 14px;
	background: var(--background-secondary);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: var(--text);
	font-size: 14px;
	transition: all 0.15s ease;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
	}
`;

// Section component for form organization
const Section = styled.div`
	margin-bottom: 32px;
`;

// Close button components
const CloseButton = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	transition: all 0.15s ease;
	
	&:hover {
		transform: translateY(-2px);
	}
`;

const CloseIcon = styled.div`
	width: 32px;
	height: 32px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 4px;
	transition: all 0.15s ease;
	
	&:hover {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.04);
	}
`;

const CloseText = styled.span`
	font-size: 12px;
	color: var(--text-secondary);
	font-weight: 500;
`;

// Categories section styles
const CategoriesContent = styled.div`
	padding: 0;
`;

const CategorySection = styled.div`
	background: var(--background-secondary);
	border-radius: 16px;
	padding: 32px;
	margin-bottom: 24px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.06);
`;

const CategoryHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
`;

const CategoryTitle = styled.h3`
	margin: 0;
	font-size: 20px;
	font-weight: 600;
	color: var(--text);
`;

const CreateCategoryButton = styled.button`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 20px;
	background: var(--primary);
	border: none;
	border-radius: 12px;
	color: white;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.15s ease;

	&:hover {
		background: var(--primary-hover);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(88, 101, 242, 0.3);
	}
`;

const CategoryList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const CategoryItem = styled.div`
	background: var(--background-tertiary);
	border-radius: 12px;
	padding: 20px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	transition: all 0.15s ease;
	
	&:hover {
		border-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
`;

const CategoryInfo = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
`;

const CategoryName = styled.span`
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
`;

const CategoryActions = styled.div`
	display: flex;
	gap: 8px;
`;

const CategoryActionButton = styled.button<{ danger?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: ${props => props.danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.06)'};
	color: ${props => props.danger ? 'var(--error)' : 'var(--text)'};
	border: none;
	cursor: pointer;
	transition: all 0.15s ease;

	&:hover {
		background: ${props => props.danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
		transform: translateY(-1px);
	}
`;

const ChannelList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const ChannelItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: var(--background-primary);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.04);
	transition: all 0.15s ease;
	
	&:hover {
		border-color: rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}
`;

const ChannelInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const ChannelIcon = styled.div`
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
`;

const ChannelName = styled.span`
	font-size: 14px;
	color: var(--text);
	font-weight: 500;
`;

const ChannelActions = styled.div`
	display: flex;
	gap: 6px;
`;

const ChannelActionButton = styled.button<{ danger?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 6px;
	background: ${props => props.danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.06)'};
	color: ${props => props.danger ? 'var(--error)' : 'var(--text)'};
	border: none;
	cursor: pointer;
	transition: all 0.15s ease;

	&:hover {
		background: ${props => props.danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
		transform: scale(1.05);
	}
`;

const AddChannelButton = styled.button`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 16px;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: var(--text);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}
`;

const DropdownMenu = styled.div`
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: var(--background-secondary);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	z-index: 10;
	overflow: hidden;
`;

const DropdownItem = styled.div`
	padding: 12px 16px;
	cursor: pointer;
	transition: background-color 0.15s ease;
	font-size: 14px;
	color: var(--text);

	&:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	&:first-child {
		border-radius: 12px 12px 0 0;
	}

	&:last-child {
		border-radius: 0 0 12px 12px;
	}
`;

// Roles section styles
const RolesContent = styled.div`
	padding: 0;
`;

const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
`;

const CreateRoleButton = styled.button`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	background: var(--primary);
	border: none;
	border-radius: 6px;
	color: white;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background: var(--primary-hover);
	}
`;

const RolesList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const RoleItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	border-radius: 4px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
`;

const RoleInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const RoleColor = styled.div<{ color: string }>`
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background-color: ${props => props.color};
`;

const RoleDetails = styled.div`
	display: flex;
	flex-direction: column;
`;

const RoleName = styled.span`
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
`;

const RoleMemberCount = styled.span`
	font-size: 12px;
	color: var(--text-secondary);
`;

const RoleActions = styled.div`
	display: flex;
	gap: 8px;
`;

const RoleActionButton = styled.button<{ danger?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 4px;
	background: ${props => props.danger ? 'var(--error)' : 'var(--background-tertiary)'};
	color: ${props => props.danger ? 'white' : 'var(--text)'};
	border: none;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background: ${props => props.danger ? 'var(--error-hover)' : 'var(--background-primary)'};
	}
`;

// Invites section styles
const InvitesContent = styled.div`
	padding: 0;
`;

const CreateInviteButton = styled.button`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	background: var(--primary);
	border: none;
	border-radius: 6px;
	color: white;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background: var(--primary-hover);
	}
`;

const InvitesList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const NoInvitesMessage = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40px 0;
	color: var(--text-muted);
	font-size: 14px;
	text-align: center;
`;

// Emojis section styles
const EmojisContent = styled.div`
	padding: 0;
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

// Members section styles - Removed unused components

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

// Bans section styles
const BansContent = styled.div`
	padding: 0;
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

const BanItem = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 80px;
	gap: 16px;
	padding: 12px 0;
	border-bottom: 1px solid var(--background-tertiary);
	align-items: center;
`;

const BanUser = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const BanAvatar = styled.div`
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

const BanName = styled.span`
	color: var(--text);
	font-size: 14px;
`;

const BanReason = styled.span`
	color: var(--text-secondary);
	font-size: 14px;
`;

const BanActions = styled.div`
	display: flex;
	gap: 8px;
`;

const BanActionButton = styled.button`
	padding: 6px 12px;
	background: var(--background-tertiary);
	border: none;
	border-radius: 4px;
	color: var(--text);
	font-size: 12px;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background: var(--background-primary);
	}
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

	// Roles state
	const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
	const [editingRole, setEditingRole] = useState<any>(null);
	const [deletingRole, setDeletingRole] = useState<any>(null);

	// Invites state
	const [showCreateInviteModal, setShowCreateInviteModal] = useState(false);
	const [inviteCode, setInviteCode] = useState('');
	const [inviter, setInviter] = useState<any>(null);
	const [channel, setChannel] = useState<any>(null);
	const [expiresAt, setExpiresAt] = useState<string | null>(null);
	const [maxUses, setMaxUses] = useState<number | null>(null);
	const [temporary, setTemporary] = useState<boolean | null>(null);
	const [uses, setUses] = useState<number>(0);
	const [createdAt, setCreatedAt] = useState<string>('');

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

	const onSubmit = async (data: { serverName: string; serverDescription: string; serverBanner?: string }) => {
		console.log("Form data:", data);
		setError(null);
		setSuccess(false);
		setIsSaving(true);

		try {
			// Use your existing REST client instead of raw fetch
			const updatedGuildData = await app.rest.patch<{
				name?: string;
				description?: string;
				banner?: string;
			}, any>(
				Routes.guild(guild.id),
				{
					name: data.serverName,
					description: data.serverDescription,
					banner: data.serverBanner,
				}
			);

			console.log("Server updated successfully:", updatedGuildData);

			// Update only the specific properties we changed to avoid MobX computed property errors
			guild.name = updatedGuildData.name;
			guild.description = updatedGuildData.description;
			guild.banner = updatedGuildData.banner;

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

	const handleEditRole = (role: any) => {
		setEditingRole(role);
	};

	const handleDeleteRole = (role: any) => {
		setDeletingRole(role);
	};

	const handleRoleCreated = () => {
		setShowCreateRoleModal(false);
		// Refresh roles list after creation
		window.location.reload();
	};

	const handleRoleUpdated = () => {
		setEditingRole(null);
		// Refresh roles list after update
		window.location.reload();
	};

	const handleRoleDeleted = () => {
		setDeletingRole(null);
		// Refresh roles list after deletion
		window.location.reload();
	};

	const handleInviteCreated = (invite: any) => {
		setShowCreateInviteModal(false);
		setInviteCode(invite.code);
		setInviter(invite.inviter);
		setChannel(invite.channel);
		setExpiresAt(invite.expires_at);
		setMaxUses(invite.max_uses);
		setTemporary(invite.temporary);
		setUses(invite.uses);
		setCreatedAt(invite.created_at);
		// Refresh invites list after creation
		window.location.reload();
	};

	const renderOverview = () => (
		<OverviewContent as="form" onSubmit={handleSubmit(onSubmit)}>
			{/* Error Message */}
			{error && (
				<ErrorMessage>
					{error}
				</ErrorMessage>
			)}

			{/* Success Message */}
			{success && (
				<SuccessMessage>
					Server updated successfully!
				</SuccessMessage>
			)}

			<FormSection>
				<SectionTitle>Server Name</SectionTitle>
				<InputGroup>
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
				</InputGroup>
			</FormSection>

			<FormSection>
				<SectionTitle>Server Description</SectionTitle>
				<InputGroup>
					<InputLabel>Description</InputLabel>
					<TextArea
						placeholder="Add a topic..."
						{...register("serverDescription", {
							maxLength: { value: 500, message: "Description must be less than 500 characters" }
						})}
					/>
				</InputGroup>
			</FormSection>

			<FormSection>
				<SectionTitle>Custom Banner</SectionTitle>
				<BannerSection>
					<Banner>
						Benguin <Icon icon="mdiCheckCircle" size="16px" color="#00b0f4" />
					</Banner>
					<RemoveLink>Remove (max 6.00 MB)</RemoveLink>
					<InputLabel>Banner URL</InputLabel>
					<Input
						type="text"
						{...register("serverBanner")}
						placeholder="Enter banner URL"
					/>
				</BannerSection>
			</FormSection>

			<FormSection>
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
			</FormSection>

			<ButtonGroup>
				<CancelButton onClick={handleClose}>Cancel</CancelButton>
				<SaveButton 
					type="submit" 
					disabled={isSaving || isSubmitting}
				>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</SaveButton>
			</ButtonGroup>
		</OverviewContent>
	);

	const renderCategories = () => (
		<CategoriesContent>
			<Section>
				<CategoryHeader>
					<CategoryTitle>Categories</CategoryTitle>
					<CreateCategoryButton onClick={() => setIsCreatingCategory(true)}>
						<Icon icon="mdiPlus" size="16px" />
						Create Category
					</CreateCategoryButton>
				</CategoryHeader>

				{/* Error/Success Messages */}
				{error && (
					<ErrorMessage>
						{error}
					</ErrorMessage>
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
					<CategorySection>
						<CategoryList>
							{categories.map((category) => (
								<CategoryItem key={category.id}>
									<CategoryInfo>
										{editingCategoryId === category.id ? (
											<Input
												type="text"
												value={editingCategoryName}
												onChange={(e) => setEditingCategoryName(e.target.value)}
												style={{ flex: 1, marginRight: '8px' }}
											/>
										) : (
											<CategoryName>{category.name}</CategoryName>
										)}
										
										<CategoryActions>
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
										</CategoryActions>
									</CategoryInfo>
									
									<ChannelList>
										{/* Text Channels */}
										{textChannels
											.filter(channel => channel.parentId === category.id)
											.map(channel => (
												<ChannelItem key={channel.id}>
													<ChannelInfo>
														<ChannelIcon>
															<Icon icon="mdiPound" size="14px" />
														</ChannelIcon>
														<ChannelName>{channel.name}</ChannelName>
													</ChannelInfo>
													<ChannelActions>
														<ChannelActionButton>
															<Icon icon="mdiPencil" size="14px" />
														</ChannelActionButton>
														<ChannelActionButton danger>
															<Icon icon="mdiDelete" size="14px" />
														</ChannelActionButton>
													</ChannelActions>
												</ChannelItem>
											))
										}
										
										{/* Voice Channels */}
										{voiceChannels
											.filter(channel => channel.parentId === category.id)
											.map(channel => (
												<ChannelItem key={channel.id}>
													<ChannelInfo>
														<ChannelIcon>
															<Icon icon="mdiVolumeHigh" size="14px" />
														</ChannelIcon>
														<ChannelName>{channel.name}</ChannelName>
													</ChannelInfo>
													<ChannelActions>
														<ChannelActionButton>
															<Icon icon="mdiPencil" size="14px" />
														</ChannelActionButton>
														<ChannelActionButton danger>
															<Icon icon="mdiDelete" size="14px" />
														</ChannelActionButton>
													</ChannelActions>
												</ChannelItem>
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
									</ChannelList>
								</CategoryItem>
							))}
						</CategoryList>
					</CategorySection>
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

	const renderRoles = () => <RolesSettingsPage />;

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

	const renderMembers = () => <MembersSettingsPage />;

	const renderInvites = () => (
		<InvitesContent>
			<SectionHeader>
				<SectionTitle>Invites</SectionTitle>
				<CreateInviteButton onClick={() => setShowCreateInviteModal(true)}>
					<Icon icon="mdiPlus" size={16} />
					Create Invite
				</CreateInviteButton>
			</SectionHeader>

			{/* Invites List */}
			<InvitesList>
				{/* Placeholder for existing invites - will be populated when API is ready */}
				<NoInvitesMessage>
					<Icon icon="mdiEmailOutline" size={48} />
					<h3>No invites yet</h3>
					<p>Create your first invite to start inviting people to your server!</p>
				</NoInvitesMessage>
			</InvitesList>

			{/* Create Invite Modal */}
			{showCreateInviteModal && (
				<CreateInviteModal
					guild={guild}
					onClose={() => setShowCreateInviteModal(false)}
					onInviteCreated={handleInviteCreated}
				/>
			)}
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
