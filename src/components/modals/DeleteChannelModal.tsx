import { ModalProps } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { ChannelType } from "@spacebarchat/spacebar-api-types/v9";
import styled from "styled-components";
import { useState } from "react";
import { runInAction } from "mobx";

// Custom modal overlay and container
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

function DeleteChannelModal(props: ModalProps<"delete_channel">) {
	const { channel } = props;
	const app = useAppStore();
	const isCategory = channel.type === ChannelType.GuildCategory;
	
	console.log('DeleteChannelModal rendered');
	console.log('Props:', props);
	console.log('Channel:', channel);
	console.log('Is category:', isCategory);
	
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		setIsDeleting(true);
		setError(null);
		
		try {
			console.log('Attempting to delete channel:', channel.id);
			console.log('Channel details:', channel);
			
			// Fix the API endpoint - remove the double /api/
			const response = await app.rest.delete(`/v9/channels/${channel.id}`);
			console.log('Delete response:', response);
			console.log(`${isCategory ? "Category" : "Channel"} deleted successfully`);
			
			// Close modal on success
			props.onClose?.();
			
			// Use MobX action to update the store properly
			// This will automatically update the channel list without reloading
			runInAction(() => {
				app.channels.remove(channel.id);
			});
			
		} catch (error: any) {
			console.error(`Error deleting ${isCategory ? "category" : "channel"}:`, error);
			console.error('Error details:', {
				message: error.message,
				status: error.status,
				statusText: error.statusText,
				response: error.response,
				stack: error.stack
			});
			
			// Set error message to display in UI
			setError(`Failed to delete ${isCategory ? "category" : "channel"}: ${error.message || "Unknown error"}`);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		props.onClose?.();
	};

	return (
		<ModalOverlay onClick={handleClose}>
			<ModalContainer onClick={(e) => e.stopPropagation()}>
				<ModalHeader>
					<ModalTitle>Delete {isCategory ? "Category" : "Channel"}</ModalTitle>
					<CloseButton onClick={handleClose}>×</CloseButton>
				</ModalHeader>
				<ModalBody>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					<ModalMessage>
						Are you sure you want to delete {isCategory ? `category "${channel.name}"` : `#${channel.name}`}? 
						{isCategory ? " All channels in this category will be moved to the top level." : " This cannot be undone."}
					</ModalMessage>
					<ModalActions>
						<CancelButton onClick={handleClose}>
							Cancel
						</CancelButton>
						<DeleteButton 
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : `Delete ${isCategory ? "Category" : "Channel"}`}
						</DeleteButton>
					</ModalActions>
				</ModalBody>
			</ModalContainer>
		</ModalOverlay>
	);
}

export default observer(DeleteChannelModal);
