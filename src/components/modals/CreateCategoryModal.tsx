import { ModalProps } from "@/controllers/modals";
import { Input } from "@components/AuthComponents";
import Icon from "@components/Icon";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ChannelType, Routes } from "@spacebarchat/spacebar-api-types/v9";
import { Modal } from "./ModalComponents";
import styled from "styled-components";

const SaveButton = styled.button`
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 6px;
	padding: 10px 16px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
	
	&:hover {
		background: var(--primary-hover);
	}
	
	&:disabled {
		background: var(--background-tertiary);
		cursor: not-allowed;
		opacity: 0.5;
	}
`;

const CancelButton = styled.button`
	background: var(--background-tertiary);
	color: var(--text-muted);
	border: none;
	border-radius: 6px;
	padding: 10px 16px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
	
	&:hover {
		background: var(--background-secondary);
	}
`;

const FormContainer = styled.div`
	padding: 20px;
`;

const InputGroup = styled.div`
	margin-bottom: 20px;
`;

const Label = styled.label`
	display: block;
	margin-bottom: 8px;
	font-size: 14px;
	font-weight: 500;
	color: var(--text);
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	justify-content: flex-end;
`;

const ErrorMessage = styled.div`
	background: var(--error);
	color: white;
	padding: 12px;
	border-radius: 4px;
	margin-bottom: 16px;
	font-size: 14px;
`;

const SuccessMessage = styled.div`
	background: var(--success);
	color: white;
	padding: 12px;
	border-radius: 4px;
	margin-bottom: 16px;
	font-size: 14px;
`;

function CreateCategoryModal(props: ModalProps<"create_category">) {
	const { guild } = props;
	const app = useAppStore();
	
	const [categoryName, setCategoryName] = useState('');
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const createCategory = async () => {
		if (!categoryName.trim()) return;
		
		setError(null);
		setSuccess(false);
		setIsCreating(true);
		
		try {
			console.log('Creating category:', categoryName.trim());
			console.log('Guild ID:', guild.id);
			
			const newCategory = await app.rest.post(Routes.guildChannels(guild.id), {
				name: categoryName.trim(),
				type: ChannelType.GuildCategory,
				position: 0
			});
			
			console.log("Category created:", newCategory);
			setSuccess(true);
			
			// Auto-close after success
			setTimeout(() => {
				props.onClose?.();
			}, 1500);
			
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
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		props.onClose?.();
	};

	return (
		<Modal
			title="Create Category"
			description={`Create a new category in ${guild.name}`}
			onClose={handleClose}
		>
			<FormContainer>
				{/* Error Message */}
				{error && <ErrorMessage>{error}</ErrorMessage>}
				
				{/* Success Message */}
				{success && <SuccessMessage>Category created successfully!</SuccessMessage>}
				
				<InputGroup>
					<Label>Category Name</Label>
					<Input
						type="text"
						placeholder="Enter category name"
						value={categoryName}
						onChange={(e) => setCategoryName(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === 'Enter' && categoryName.trim()) {
								createCategory();
							}
						}}
					/>
				</InputGroup>
				
				<ButtonGroup>
					<CancelButton onClick={handleClose}>
						Cancel
					</CancelButton>
					<SaveButton 
						onClick={createCategory}
						disabled={!categoryName.trim() || isCreating}
					>
						{isCreating ? 'Creating...' : 'Create Category'}
					</SaveButton>
				</ButtonGroup>
			</FormContainer>
		</Modal>
	);
}

export default observer(CreateCategoryModal);