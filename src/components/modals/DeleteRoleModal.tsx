import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const ModalContainer = styled.div`
	background: var(--background-secondary);
	border-radius: 8px;
	width: 440px;
	max-width: 90vw;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const ModalHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid var(--background-tertiary);
`;

const ModalTitle = styled.h2`
	margin: 0;
	font-size: 20px;
	font-weight: 600;
	color: var(--text);
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	font-size: 18px;
	padding: 4px;
	border-radius: 4px;
	
	&:hover {
		background: var(--background-tertiary);
		color: var(--text);
	}
`;

const ModalBody = styled.div`
	padding: 20px;
`;

const ModalMessage = styled.p`
	margin: 0 0 20px 0;
	color: var(--text-muted);
	font-size: 14px;
	line-height: 1.4;
`;

const ModalActions = styled.div`
	display: flex;
	gap: 12px;
	justify-content: flex-end;
`;

const CancelButton = styled.button`
	background: var(--background-tertiary);
	color: var(--text);
	border: none;
	padding: 10px 16px;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
	
	&:hover {
		background: var(--background-primary);
	}
`;

const DeleteButton = styled.button`
	background: var(--error);
	color: white;
	border: none;
	padding: 10px 16px;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
	
	&:hover {
		background: var(--error-hover);
	}
	
	&:disabled {
		background: var(--background-tertiary);
		cursor: not-allowed;
		opacity: 0.5;
	}
`;

const ErrorMessage = styled.div`
	background: var(--error);
	color: white;
	padding: 12px;
	border-radius: 4px;
	margin-bottom: 16px;
	font-size: 14px;
`;

interface DeleteRoleModalProps {
	role: any;
	onClose: () => void;
	onRoleDeleted: () => void;
}

function DeleteRoleModal({ role, onClose, onRoleDeleted }: DeleteRoleModalProps) {
	const app = useAppStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		setIsDeleting(true);
		setError(null);
		
		try {
			// Get the guild ID from the current active guild
			const guildId = app.activeGuild?.id;
			if (!guildId) {
				throw new Error('No active guild found');
			}

			await app.rest.delete(`/v9/guilds/${guildId}/roles/${role.id}`);
			console.log('Role deleted successfully');
			
			// Close modal and notify parent
			onRoleDeleted();
			
		} catch (error: any) {
			console.error('Error deleting role:', error);
			setError('Failed to delete role: ' + (error.message || 'Unknown error'));
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<ModalOverlay onClick={handleClose}>
			<ModalContainer onClick={(e) => e.stopPropagation()}>
				<ModalHeader>
					<ModalTitle>Delete Role</ModalTitle>
					<CloseButton onClick={handleClose}>×</CloseButton>
				</ModalHeader>
				<ModalBody>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					<ModalMessage>
						Are you sure you want to delete role "{role?.name}"? This action cannot be undone.
					</ModalMessage>
					<ModalActions>
						<CancelButton onClick={handleClose}>
							Cancel
						</CancelButton>
						<DeleteButton 
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete Role'}
						</DeleteButton>
					</ModalActions>
				</ModalBody>
			</ModalContainer>
		</ModalOverlay>
	);
}

export default observer(DeleteRoleModal);
