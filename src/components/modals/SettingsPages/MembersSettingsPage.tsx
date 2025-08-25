import { Routes, CDNRoutes, ImageFormat } from "@spacebarchat/spacebar-api-types/v9";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Icon from "@components/Icon";
import { REST } from "@utils";

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

const Title = styled.h2`
	margin: 0 0 8px 0;
	font-size: 24px;
	font-weight: 700;
	color: var(--text);
`;

const Description = styled.p`
	margin: 0;
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.4;
`;

const SearchContainer = styled.div`
	position: relative;
	margin-bottom: 20px;
`;

const SearchInput = styled.input`
	width: 100%;
	padding: 12px 16px 12px 40px;
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

	&::placeholder {
		color: var(--text-muted);
	}
`;

const SearchIcon = styled.div`
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-muted);
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Content = styled.div`
	flex: 1;
	padding: 24px;
	overflow-y: auto;
`;

const MemberCount = styled.div`
	font-size: 14px;
	color: var(--text-secondary);
	margin-bottom: 20px;
	padding: 12px 16px;
	background: var(--background-tertiary);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.06);
`;

const MembersList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const MemberItem = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 16px;
	background: var(--background-secondary);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: rgba(255, 255, 255, 0.1);
	}
`;

const MemberAvatar = styled.div<{ color?: string }>`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: ${props => props.color || 'var(--primary)'};
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 16px;
	font-weight: 600;
	flex-shrink: 0;
`;

const MemberInfo = styled.div`
	flex: 1;
	min-width: 0;
`;

const MemberName = styled.div`
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
	margin-bottom: 4px;
`;

const MemberDetails = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: var(--text-secondary);
`;

const MemberRoles = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 8px;
`;

const RoleTag = styled.span<{ color: string }>`
	padding: 4px 8px;
	background: ${props => props.color};
	color: white;
	border-radius: 12px;
	font-size: 11px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 4px;
`;

const MemberActions = styled.div`
	display: flex;
	gap: 8px;
	opacity: 0;
	transition: opacity 0.2s ease;

	${MemberItem}:hover & {
		opacity: 1;
	}
`;

const MemberActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
	padding: 8px 16px;
	border-radius: 6px;
	border: none;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;

	background: ${props => {
		if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.1)';
		if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.06)';
		return 'var(--primary)';
	}};

	color: ${props => {
		if (props.variant === 'danger') return 'var(--error)';
		if (props.variant === 'secondary') return 'var(--text)';
		return 'white';
	}};

	&:hover {
		background: ${props => {
			if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
			if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
			return 'var(--primary-hover)';
		}};
		transform: translateY(-1px);
	}
`;

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	text-align: center;
	color: var(--text-muted);
`;

const EmptyStateIcon = styled.div`
	font-size: 64px;
	margin-bottom: 16px;
	opacity: 0.3;
`;

const EmptyStateTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 18px;
	font-weight: 600;
	color: var(--text);
`;

const EmptyStateDescription = styled.p`
	margin: 0;
	font-size: 14px;
	line-height: 1.4;
`;

const LoadingState = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px;
	color: var(--text-muted);
`;

// Profile popup styled components
const ProfilePopup = styled.div<{ isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: ${props => props.isOpen ? 'flex' : 'none'};
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const ProfileContent = styled.div`
	background: #2f3136;
	border-radius: 8px;
	width: 90%;
	max-width: 400px;
	max-height: 80vh;
	overflow: hidden;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const ProfileHeader = styled.div`
	display: flex;
	align-items: flex-start;
	padding: 20px;
	gap: 16px;
	position: relative;
`;

const AvatarContainer = styled.div`
	position: relative;
	flex-shrink: 0;
`;

const Avatar = styled.div<{ hasAvatar: boolean }>`
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: ${props => props.hasAvatar ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
	border: ${props => props.hasAvatar ? 'none' : '2px dashed rgba(255, 255, 255, 0.3)'};
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

const StatusIndicator = styled.div<{ status: string }>`
	position: absolute;
	bottom: 4px;
	right: 4px;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: ${props => {
		switch (props.status) {
			case 'online': return '#43b581';
			case 'idle': return '#faa61a';
			case 'dnd': return '#f04747';
			default: return '#747f8d';
		}
	}};
	border: 3px solid #2f3136;
`;

const UserInfo = styled.div`
	flex: 1;
	min-width: 0;
`;

const Username = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 4px;
`;

const UsernameText = styled.span`
	font-size: 20px;
	font-weight: 700;
	color: white;
`;

const CrownIcon = styled.div`
	color: #faa61a;
	font-size: 20px;
`;

const UserTag = styled.div`
	font-size: 14px;
	color: #b9bbbe;
	margin-bottom: 8px;
`;

const StatusMessage = styled.div`
	font-size: 14px;
	color: #b9bbbe;
	margin-bottom: 16px;
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 8px;
	margin-left: auto;
`;

const ActionButton = styled.button`
	width: 32px;
	height: 32px;
	border-radius: 4px;
	border: none;
	background: rgba(255, 255, 255, 0.06);
	color: #b9bbbe;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}
`;

const TabContainer = styled.div`
	padding: 0 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const Tab = styled.div<{ active: boolean }>`
	display: inline-block;
	padding: 12px 0;
	margin-right: 24px;
	color: ${props => props.active ? 'white' : '#b9bbbe'};
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	position: relative;
	transition: color 0.2s ease;

	&:after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: ${props => props.active ? '#43b581' : 'transparent'};
		transition: background 0.2s ease;
	}

	&:hover {
		color: ${props => props.active ? 'white' : 'white'};
	}
`;

const ProfileBody = styled.div`
	padding: 20px;
`;

const InformationSection = styled.div`
	margin-bottom: 24px;
`;

const SectionHeader = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: #b9bbbe;
	text-transform: uppercase;
	letter-spacing: 0.02em;
	margin-bottom: 8px;
`;

const SectionContent = styled.div`
	font-size: 14px;
	color: white;
	line-height: 1.4;
`;

interface Member {
	id: string;
	username: string;
	discriminator: string;
	avatar?: string;
	nick?: string;
	roles: string[];
	joined_at: string;
}

function MembersSettingsPage() {
	const app = useAppStore();
	const guild = app.activeGuild;
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	
	// Profile popup state
	const [profilePopup, setProfilePopup] = useState<{
		isOpen: boolean;
		member: Member | null;
	}>({
		isOpen: false,
		member: null
	});
	const [activeTab, setActiveTab] = useState<'profile' | 'roles'>('profile');

	// Fetch members when component mounts
	useEffect(() => {
		if (guild) {
			fetchMembers();
		}
	}, [guild]);

	const fetchMembers = async () => {
		if (!guild) return;
		
		setLoading(true);
		try {
			const response = await app.rest.get(
				`/guilds/${guild.id}/members?limit=1000`
			);
			setMembers(Array.isArray(response) ? response : []);
		} catch (error) {
			console.error("Failed to fetch members:", error);
			setMembers([]);
		} finally {
			setLoading(false);
		}
	};

	// Filter members based on search query
	const filteredMembers = useMemo(() => {
		if (!searchQuery.trim()) return members;
		return members.filter(member => 
			(member.nick || member.username).toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [members, searchQuery]);

	const handleKickMember = async (memberId: string) => {
		if (!guild) return;

		try {
			await app.rest.delete(
				`/guilds/${guild.id}/members/${memberId}`
			);
			
			// Remove member from local state
			setMembers(prev => prev.filter(m => m.id !== memberId));
		} catch (error) {
			console.error("Failed to kick member:", error);
		}
	};

	const openProfilePopup = (member: Member) => {
		setProfilePopup({
			isOpen: true,
			member
		});
		setActiveTab('profile');
	};

	const closeProfilePopup = () => {
		setProfilePopup({
			isOpen: false,
			member: null
		});
	};

	const getDisplayName = (member: Member) => {
		return member.nick || member.username;
	};

	const getDisplayAvatar = (member: Member) => {
		if (member.avatar) {
			return REST.makeCDNUrl(CDNRoutes.userAvatar(member.id, member.avatar, ImageFormat.PNG));
		}
		return null;
	};

	const getRoleColor = (roleId: string) => {
		const role = guild?.roles.find((r: any) => r.id === roleId);
		return role?.color || '#747f8d';
	};

	if (!guild) return null;

	if (loading) {
		return (
			<Container>
				<LoadingState>
					<Icon icon="mdiLoading" size="24px" spin />
					<span style={{ marginLeft: '12px' }}>Loading members...</span>
				</LoadingState>
			</Container>
		);
	}

	return (
		<Container>
			<Header>
				<Title>Server Members</Title>
				<Description>
					Manage your server members, view their roles, and assign or remove roles as needed.
				</Description>
			</Header>

			<Content>
				<SearchContainer>
					<SearchIcon>
						<Icon icon="mdiMagnify" size="18px" />
					</SearchIcon>
					<SearchInput
						placeholder="Search members by name or nickname..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</SearchContainer>

				<MemberCount>
					{filteredMembers.length} of {members.length} members
				</MemberCount>

				{filteredMembers.length === 0 ? (
					<EmptyState>
						<EmptyStateIcon>
							<Icon icon="mdiAccountGroup" size="64px" />
						</EmptyStateIcon>
						<EmptyStateTitle>No members found</EmptyStateTitle>
						<EmptyStateDescription>
							{searchQuery ? 'Try adjusting your search terms' : 'No members in this server'}
						</EmptyStateDescription>
					</EmptyState>
				) : (
					<MembersList>
						{filteredMembers.map((member) => (
							<MemberItem key={member.id}>
								<MemberAvatar color={getRoleColor(member.roles[0] || guild.id)}>
									{getDisplayAvatar(member) ? (
										<img 
											src={getDisplayAvatar(member)!} 
											alt={getDisplayName(member)}
											style={{ width: '100%', height: '100%', borderRadius: '50%' }}
										/>
									) : (
										getDisplayName(member).charAt(0).toUpperCase()
									)}
								</MemberAvatar>

								<MemberInfo>
									<MemberName>{getDisplayName(member)}</MemberName>
									<MemberDetails>
										<span>@{member.username}</span>
										<span>•</span>
										<span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
									</MemberDetails>
									
									<MemberRoles>
										{member.roles
											.filter(roleId => roleId !== guild.id) // Filter out @everyone role
											.map(roleId => {
												const role = guild.roles.find((r: any) => r.id === roleId);
												return role ? (
													<RoleTag key={roleId} color={role.color}>
														<Icon icon="mdiAccountCog" size="10px" />
														{role.name}
													</RoleTag>
												) : null;
											})
										}
									</MemberRoles>
								</MemberInfo>

								<MemberActions>
									<MemberActionButton
										variant="secondary"
										onClick={() => openProfilePopup(member)}
									>
										<Icon icon="mdiAccountCog" size="14px" />
										View Profile
									</MemberActionButton>
									
									<MemberActionButton
										variant="danger"
										onClick={() => handleKickMember(member.id)}
									>
										<Icon icon="mdiAccountRemove" size="14px" />
										Kick
									</MemberActionButton>
								</MemberActions>
							</MemberItem>
						))}
					</MembersList>
				)}
			</Content>
			
			{/* Profile popup */}
			<ProfilePopup isOpen={profilePopup.isOpen} onClick={closeProfilePopup}>
				<ProfileContent onClick={(e) => e.stopPropagation()}>
					{profilePopup.member && (
						<>
							<ProfileHeader>
								<AvatarContainer>
									<Avatar hasAvatar={!!getDisplayAvatar(profilePopup.member)}>
										{getDisplayAvatar(profilePopup.member) ? (
											<img 
												src={getDisplayAvatar(profilePopup.member)!} 
												alt={getDisplayName(profilePopup.member)}
											/>
										) : (
											getDisplayName(profilePopup.member).charAt(0).toUpperCase()
										)}
									</Avatar>
									<StatusIndicator status="online" />
								</AvatarContainer>

								<UserInfo>
									<Username>
										<UsernameText>{getDisplayName(profilePopup.member)}</UsernameText>
										{/* Show crown for server owner */}
										{profilePopup.member.roles.includes(guild?.ownerId || '') && (
											<CrownIcon>
												<Icon icon="mdiCrown" size="20px" />
											</CrownIcon>
										)}
									</Username>
									<UserTag>{profilePopup.member.username}#{profilePopup.member.discriminator}</UserTag>
									<StatusMessage>Hey!</StatusMessage>
								</UserInfo>

								<ActionButtons>
									<ActionButton onClick={() => console.log("Edit profile clicked")}>
										<Icon icon="mdiPencil" size="16px" />
									</ActionButton>
									<ActionButton onClick={() => console.log("Report user clicked")}>
										<Icon icon="mdiFlag" size="16px" />
									</ActionButton>
								</ActionButtons>
							</ProfileHeader>

							<TabContainer>
								<Tab 
									active={activeTab === 'profile'} 
									onClick={() => setActiveTab('profile')}
								>
									Profile
								</Tab>
								<Tab 
									active={activeTab === 'roles'} 
									onClick={() => setActiveTab('roles')}
								>
									Roles
								</Tab>
							</TabContainer>

							<ProfileBody>
								{activeTab === 'profile' && (
									<InformationSection>
										<SectionHeader>INFORMATION</SectionHeader>
										<SectionContent>
											Just a normal person lol.
										</SectionContent>
									</InformationSection>
								)}

								{activeTab === 'roles' && (
									<InformationSection>
										<SectionHeader>ROLES</SectionHeader>
										<SectionContent>
											{profilePopup.member.roles
												.filter(roleId => roleId !== guild?.id) // Filter out @everyone role
												.map(roleId => {
													const role = guild?.roles.find((r: any) => r.id === roleId);
													return role ? (
														<div key={roleId} style={{ 
															marginBottom: '8px',
															padding: '8px 12px',
															background: role.color || '#747f8d',
															color: 'white',
															borderRadius: '4px',
															display: 'inline-block',
															marginRight: '8px'
														}}>
															{role.name}
														</div>
													) : null;
												})
											}
											{profilePopup.member.roles.filter(roleId => roleId !== guild?.id).length === 0 && (
												<span style={{ color: '#b9bbbe' }}>No custom roles assigned</span>
											)}
										</SectionContent>
									</InformationSection>
								)}
							</ProfileBody>
						</>
					)}
				</ProfileContent>
			</ProfilePopup>
		</Container>
	);
}

export default observer(MembersSettingsPage);
