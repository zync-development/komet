import { Routes } from "@spacebarchat/spacebar-api-types/v9";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { modalController } from "@/controllers/modals";
import RoleEditor from "./RoleEditor";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import Icon from "@components/Icon";

const Container = styled.div`
	display: flex;
	height: 100%;
	gap: 24px;
`;

const LeftPanel = styled.div`
	width: 320px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const RightPanel = styled.div`
	flex: 1;
	background: var(--background-secondary);
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	overflow: hidden;
`;

// Header section
const Header = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const Title = styled.h2`
	margin: 0;
	font-size: 20px;
	font-weight: 700;
	color: var(--text);
`;

const Description = styled.p`
	margin: 0;
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.4;
`;

// Search and filters
const SearchContainer = styled.div`
	position: relative;
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

// Role templates
const TemplatesSection = styled.div`
	background: var(--background-secondary);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	overflow: hidden;
`;

const TemplatesHeader = styled.div`
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.02);
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const TemplatesTitle = styled.h3`
	margin: 0;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const TemplatesList = styled.div`
	padding: 8px;
`;

const TemplateItem = styled.button`
	width: 100%;
	padding: 8px 12px;
	background: none;
	border: none;
	border-radius: 6px;
	color: var(--text);
	font-size: 13px;
	text-align: left;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 8px;

	&:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	&:active {
		transform: translateY(1px);
	}
`;

// Create role button
const CreateRoleButton = styled.button`
	width: 100%;
	padding: 12px 16px;
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;

	&:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
	}

	&:active {
		transform: translateY(0);
	}
`;

// Roles list
const RolesList = styled.div`
	background: var(--background-secondary);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	overflow: hidden;
	flex: 1;
`;

const RolesListHeader = styled.div`
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.02);
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const RolesListTitle = styled.h3`
	margin: 0;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const RoleCount = styled.span`
	font-size: 12px;
	color: var(--text-muted);
	background: rgba(255, 255, 255, 0.06);
	padding: 2px 8px;
	border-radius: 10px;
`;

const RolesContainer = styled.div`
	padding: 8px;
	max-height: 400px;
	overflow-y: auto;
`;

const RoleItem = styled.div<{ isSelected: boolean; isDragging: boolean }>`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	margin-bottom: 4px;
	background: ${props => props.isSelected ? 'rgba(88, 101, 242, 0.15)' : 'transparent'};
	border: 1px solid ${props => props.isSelected ? 'var(--primary)' : 'transparent'};
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;

	&:hover {
		background: ${props => props.isSelected ? 'rgba(88, 101, 242, 0.2)' : 'rgba(255, 255, 255, 0.04)'};
		transform: ${props => props.isDragging ? 'none' : 'translateX(2px)'};
	}

	&:last-child {
		margin-bottom: 0;
	}
`;

const RoleColor = styled.div<{ color: string }>`
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background-color: ${props => props.color};
	flex-shrink: 0;
	border: 2px solid rgba(255, 255, 255, 0.1);
`;

const RoleInfo = styled.div`
	flex: 1;
	min-width: 0;
`;

const RoleName = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
	margin-bottom: 2px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const RoleDetails = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: var(--text-secondary);
`;

const RoleMemberCount = styled.span`
	display: flex;
	align-items: center;
	gap: 4px;
`;

const RolePosition = styled.span`
	background: rgba(255, 255, 255, 0.06);
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 11px;
`;

const RoleActions = styled.div`
	display: flex;
	gap: 4px;
	opacity: 0;
	transition: opacity 0.2s ease;

	${RoleItem}:hover & {
		opacity: 1;
	}
`;

const RoleActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
	width: 28px;
	height: 28px;
	border-radius: 6px;
	background: ${props => props.variant === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.06)'};
	color: ${props => props.variant === 'delete' ? 'var(--error)' : 'var(--text)'};
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background: ${props => props.variant === 'delete' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
		transform: scale(1.05);
	}
`;

const DragHandle = styled.div`
	color: var(--text-muted);
	cursor: grab;
	opacity: 0.6;
	transition: opacity 0.2s ease;

	&:hover {
		opacity: 1;
	}

	${RoleItem}:hover & {
		opacity: 1;
	}
`;

// Empty state
const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	text-align: center;
	color: var(--text-muted);
`;

const EmptyStateIcon = styled.div`
	font-size: 48px;
	margin-bottom: 16px;
	opacity: 0.5;
`;

const EmptyStateTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
`;

const EmptyStateDescription = styled.p`
	margin: 0;
	font-size: 14px;
	line-height: 1.4;
`;

// Role templates data
const ROLE_TEMPLATES = [
	{
		name: "Moderator",
		description: "Basic moderation permissions",
		icon: "mdiShieldAccount",
		color: "#5865f2"
	},
	{
		name: "Admin",
		description: "Full server management",
		icon: "mdiCrown",
		color: "#faa61a"
	},
	{
		name: "Member",
		description: "Standard member access",
		icon: "mdiAccount",
		color: "#57f287"
	},
	{
		name: "Guest",
		description: "Limited access role",
		icon: "mdiAccountQuestion",
		color: "#747f8d"
	}
];

function RolesSettingsPage() {
	const app = useAppStore();
	const guild = app.activeGuild;
	const [selectedRole, setSelectedRole] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	if (!guild) return null;

	// Filter roles based on search query
	const filteredRoles = useMemo(() => {
		if (!searchQuery.trim()) return guild.roles;
		return guild.roles.filter(role => 
			role.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [guild.roles, searchQuery]);

	const selectedRoleObject = selectedRole ? app.roles.get(selectedRole) : null;

	// Fetch member counts for all roles when component mounts
	useEffect(() => {
		if (guild && guild.roles.length > 0) {
			// Fetch member counts for all roles at once
			app.rest.get(`/guilds/${guild.id}/roles/member-counts/`)
				.then((response: any) => {
					// Update each role's memberCount property
					guild.roles.forEach(role => {
						if (response[role.id]) {
							role.setMemberCount(response[role.id]);
						}
					});
				})
				.catch((error: any) => {
					console.error("Failed to fetch role member counts:", error);
				});
		}
	}, [guild]);

	const onDragEnd = async (result: any) => {
		if (!result.destination) return;

		const reorderedRoles = Array.from(guild.roles);
		const [removed] = reorderedRoles.splice(result.source.index, 1);
		reorderedRoles.splice(result.destination.index, 0, removed);

		// Update positions and send to backend
		for (let i = 0; i < reorderedRoles.length; i++) {
			reorderedRoles[i].position = i;
			try {
				await app.rest.patch(
					Routes.guildRole(guild.id, reorderedRoles[i].id),
					{
						position: i,
					}
				);
			} catch (error) {
				console.error("Failed to update role position:", error);
			}
		}
		// Note: The store will automatically reflect the new order through MobX
	};

	const handleCreateRole = () => {
		modalController.push({ 
			type: "create_role" as any, 
			guild: guild
		});
	};

	const handleCreateRoleFromTemplate = (template: typeof ROLE_TEMPLATES[0]) => {
		modalController.push({ 
			type: "create_role" as any, 
			guild: guild, 
			template: template
		});
	};

	const handleEditRole = (role: any, e: React.MouseEvent) => {
		e.stopPropagation();
		modalController.push({ 
			type: "edit_role" as any, 
			role: role
		});
	};

	const handleDeleteRole = (role: any, e: React.MouseEvent) => {
		e.stopPropagation();
		modalController.push({ 
			type: "delete_role" as any, 
			role: role
		});
	};

	return (
		<Container>
			<LeftPanel>
				<Header>
					<Title>Server Roles</Title>
					<Description>
						Manage roles and permissions for your server members. 
						Drag and drop to reorder roles.
					</Description>
				</Header>

				<SearchContainer>
					<SearchIcon>
						<Icon icon="mdiMagnify" size="18px" />
					</SearchIcon>
					<SearchInput
						placeholder="Search roles..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</SearchContainer>

				<TemplatesSection>
					<TemplatesHeader>
						<TemplatesTitle>Quick Create</TemplatesTitle>
					</TemplatesHeader>
					<TemplatesList>
						{ROLE_TEMPLATES.map((template) => (
							<TemplateItem
								key={template.name}
								onClick={() => handleCreateRoleFromTemplate(template)}
								title={template.description}
							>
								<Icon 
									icon={template.icon} 
									size="16px" 
									color={template.color}
								/>
								{template.name}
							</TemplateItem>
						))}
					</TemplatesList>
				</TemplatesSection>

				<CreateRoleButton onClick={handleCreateRole}>
					<Icon icon="mdiPlus" size="16px" />
					Create Custom Role
				</CreateRoleButton>

				<RolesList>
					<RolesListHeader>
						<TemplatesTitle>Roles ({filteredRoles.length})</TemplatesTitle>
						<RoleCount>{guild.roles.length}</RoleCount>
					</RolesListHeader>
					
					{filteredRoles.length === 0 ? (
						<EmptyState>
							<EmptyStateIcon>
								<Icon icon="mdiFlag" size="48px" />
							</EmptyStateIcon>
							<EmptyStateTitle>No roles found</EmptyStateTitle>
							<EmptyStateDescription>
								{searchQuery ? 'Try adjusting your search terms' : 'Create your first role to get started'}
							</EmptyStateDescription>
						</EmptyState>
					) : (
						<DragDropContext onDragEnd={onDragEnd}>
							<Droppable droppableId="roles">
								{(provided) => (
									<RolesContainer {...provided.droppableProps} ref={provided.innerRef}>
										{filteredRoles.map((role, index) => (
											<Draggable key={role.id} draggableId={role.id} index={index}>
												{(provided, snapshot) => (
													<RoleItem
														ref={provided.innerRef}
														{...provided.draggableProps}
														isSelected={selectedRole === role.id}
														isDragging={snapshot.isDragging}
														onClick={() => setSelectedRole(role.id)}
													>
														<RoleColor color={role.color} />
														
														<RoleInfo>
															<RoleName>{role.name}</RoleName>
															<RoleDetails>
																<RoleMemberCount>
																	<Icon icon="mdiAccount" size="12px" />
																	{role.memberCount}
																</RoleMemberCount>
																<RolePosition>#{role.position}</RolePosition>
															</RoleDetails>
														</RoleInfo>

														<RoleActions>
															<RoleActionButton
																onClick={(e) => handleEditRole(role, e)}
																title="Edit role"
															>
																<Icon icon="mdiPencil" size="14px" />
															</RoleActionButton>
															<RoleActionButton
																variant="delete"
																onClick={(e) => handleDeleteRole(role, e)}
																title="Delete role"
															>
																<Icon icon="mdiDelete" size="14px" />
															</RoleActionButton>
														</RoleActions>

														<div {...provided.dragHandleProps}>
															<DragHandle>
																<Icon icon="mdiDrag" size="16px" />
															</DragHandle>
														</div>
													</RoleItem>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</RolesContainer>
								)}
							</Droppable>
						</DragDropContext>
					)}
				</RolesList>
			</LeftPanel>

			<RightPanel>
				{selectedRoleObject ? (
					<RoleEditor role={selectedRoleObject} />
				) : (
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
						padding: '40px',
						textAlign: 'center',
						color: 'var(--text-muted)'
					}}>
						<Icon icon="mdiFlag" size="64px" style={{ marginBottom: '16px', opacity: 0.3 }} />
						<h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
							Select a Role
						</h3>
						<p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4 }}>
							Choose a role from the list to edit its settings and permissions
						</p>
					</div>
				)}
			</RightPanel>
		</Container>
	);
}

export default observer(RolesSettingsPage);