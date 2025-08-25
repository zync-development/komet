import { ModalProps } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import styled from "styled-components";
import { Modal } from "./ModalComponents";
import { Routes } from "@spacebarchat/spacebar-api-types/v9";
import { Role } from "@structures";
import Icon from "@components/Icon";

const Container = styled.div`
	padding: 24px;
`;

const Header = styled.div`
	text-align: center;
	margin-bottom: 32px;
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

const WarningBanner = styled.div`
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.2);
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 24px;
	display: flex;
	align-items: flex-start;
	gap: 12px;
`;

const WarningIcon = styled.div`
	color: var(--error);
	flex-shrink: 0;
	margin-top: 2px;
`;

const WarningContent = styled.div`
	flex: 1;
`;

const WarningTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--error);
`;

const WarningText = styled.p`
	margin: 0;
	font-size: 14px;
	color: var(--text);
	line-height: 1.4;
`;

const RoleInfo = styled.div`
	background: var(--background-secondary);
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	padding: 20px;
	margin-bottom: 24px;
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

const RoleDetails = styled.div`
	flex: 1;
`;

const RoleName = styled.h3`
	margin: 0 0 4px 0;
	font-size: 18px;
	font-weight: 600;
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

const RoleStats = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	gap: 16px;
	padding-top: 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const StatItem = styled.div`
	text-align: center;
`;

const StatValue = styled.div`
	font-size: 20px;
	font-weight: 700;
	color: var(--text);
	margin-bottom: 4px;
`;

const StatLabel = styled.div`
	font-size: 12px;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const ImpactSection = styled.div`
	margin-bottom: 24px;
`;

const ImpactTitle = styled.h4`
	margin: 0 0 12px 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ImpactList = styled.ul`
	margin: 0;
	padding-left: 20px;
	color: var(--text);
	font-size: 14px;
	line-height: 1.5;
`;

const ImpactItem = styled.li`
	margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
	padding: 12px 24px;
	border-radius: 8px;
	border: none;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	flex: 1;

	background: ${props => {
		if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.06)';
		if (props.variant === 'danger') return 'var(--error)';
		return 'var(--primary)';
	}};

	color: ${props => {
		if (props.variant === 'secondary') return 'var(--text)';
		if (props.variant === 'danger') return 'white';
		return 'white';
	}};

	&:hover {
		background: ${props => {
			if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
			if (props.variant === 'danger') return 'var(--error-hover)';
			return 'var(--primary-hover)';
		}};
		transform: translateY(-1px);
		box-shadow: ${props => props.variant === 'danger' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'};
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
`;

interface DeleteRoleModalProps {
	role: Role;
	onRoleDeleted: () => void;
	onClose: () => void;
}

function DeleteRoleModal(props: DeleteRoleModalProps) {
	const app = useAppStore();
	const { role, onClose, onRoleDeleted } = props;
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await app.rest.delete(Routes.guildRole(app.activeGuild!.id, role.id));
			onRoleDeleted();
			onClose();
		} catch (error) {
			console.error("Failed to delete role:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	// TODO: Get actual member count and channel count
	const memberCount = Math.floor(Math.random() * 50) + 1;
	const channelCount = Math.floor(Math.random() * 10) + 1;

	return (
		<Modal title="Delete Role" onClose={onClose} maxWidth="500px">
			<Container>
				<Header>
					<Title>Delete Role</Title>
					<Description>
						This action cannot be undone. Please review the information below before proceeding.
					</Description>
				</Header>

				<WarningBanner>
					<WarningIcon>
						<Icon icon="mdiAlertCircle" size="20px" />
					</WarningIcon>
					<WarningContent>
						<WarningTitle>Warning: This action is permanent</WarningTitle>
						<WarningText>
							Deleting this role will remove it from all members and channels. 
							Members with this role will lose access to any channels or features 
							that were restricted to this role only.
						</WarningText>
					</WarningContent>
				</WarningBanner>

				<RoleInfo>
					<RoleHeader>
						<RoleAvatar color={role.color}>
							{role.name.charAt(0).toUpperCase()}
						</RoleAvatar>
						<RoleDetails>
							<RoleName>{role.name}</RoleName>
							<RoleMeta>
								<RoleMetaItem>
									<Icon icon="mdiFlag" size="14px" />
									Position #{role.position}
								</RoleMetaItem>
								{role.managed && (
									<RoleMetaItem>
										<Icon icon="mdiShield" size="14px" />
										Managed Role
									</RoleMetaItem>
								)}
								{role.hoist && (
									<RoleMetaItem>
										<Icon icon="mdiAccountGroup" size="14px" />
										Hoisted
									</RoleMetaItem>
								)}
								{role.mentionable && (
									<RoleMetaItem>
										<Icon icon="mdiAt" size="14px" />
										Mentionable
									</RoleMetaItem>
								)}
							</RoleMeta>
						</RoleDetails>
					</RoleHeader>

					<RoleStats>
						<StatItem>
							<StatValue>{memberCount}</StatValue>
							<StatLabel>Members</StatLabel>
						</StatItem>
						<StatItem>
							<StatValue>{channelCount}</StatValue>
							<StatLabel>Channels</StatLabel>
						</StatItem>
						<StatItem>
							<StatValue>{role.permissions ? 'Custom' : 'Default'}</StatValue>
							<StatLabel>Permissions</StatLabel>
						</StatItem>
					</RoleStats>
				</RoleInfo>

				<ImpactSection>
					<ImpactTitle>
						<Icon icon="mdiInformation" size="18px" />
						What will happen?
					</ImpactTitle>
					<ImpactList>
						<ImpactItem>
							<strong>{memberCount} members</strong> will lose this role and any associated permissions
						</ImpactItem>
						<ImpactItem>
							<strong>{channelCount} channels</strong> may have their permission overrides affected
						</ImpactItem>
						<ImpactItem>
							Any <strong>webhooks or integrations</strong> using this role will stop working
						</ImpactItem>
						<ImpactItem>
							<strong>Role mentions</strong> (@{role.name}) will no longer function
						</ImpactItem>
					</ImpactList>
				</ImpactSection>

				<ButtonGroup>
					<Button variant="secondary" onClick={onClose} disabled={isDeleting}>
						Cancel
					</Button>
					<Button 
						variant="danger" 
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? 'Deleting...' : 'Delete Role'}
					</Button>
				</ButtonGroup>
			</Container>
		</Modal>
	);
}

export default observer(DeleteRoleModal);
