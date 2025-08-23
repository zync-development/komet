import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import styled from "styled-components";
import { Modal } from "./ModalComponents";
import Icon from "@components/Icon";

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

const Input = styled.input`
	width: 100%;
	padding: 10px 12px;
	border: 1px solid var(--background-tertiary);
	border-radius: 6px;
	background: var(--background-secondary);
	color: var(--text);
	font-size: 14px;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const ColorPicker = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const ColorPreview = styled.div<{ color: string }>`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background-color: ${props => props.color};
	border: 2px solid var(--background-tertiary);
	cursor: pointer;
`;

const ColorInput = styled.input`
	width: 80px;
	padding: 8px;
	border: 1px solid var(--background-tertiary);
	border-radius: 4px;
	background: var(--background-secondary);
	color: var(--text);
	font-size: 14px;
	font-family: monospace;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	justify-content: flex-end;
`;

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
	color: var(--text);
	border: none;
	border-radius: 6px;
	padding: 10px 16px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
	
	&:hover {
		background: var(--background-primary);
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

interface CreateRoleModalProps {
	guild: any;
	onClose: () => void;
	onRoleCreated: () => void;
}

function CreateRoleModal({ guild, onClose, onRoleCreated }: CreateRoleModalProps) {
	const app = useAppStore();
	const [roleName, setRoleName] = useState('');
	const [roleColor, setRoleColor] = useState('#99aab5');
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCreateRole = async () => {
		if (!roleName.trim()) return;
		
		setError(null);
		setIsCreating(true);
		
		try {
			const newRole = await app.rest.post(`/v9/guilds/${guild.id}/roles`, {
				name: roleName.trim(),
				color: parseInt(roleColor.replace('#', ''), 16),
				permissions: '0'
			});
			
			console.log('Role created successfully:', newRole);
			onRoleCreated();
			
		} catch (error: any) {
			console.error('Error creating role:', error);
			setError('Failed to create role: ' + (error.message || 'Unknown error'));
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<Modal
			title="Create Role"
			description={`Create a new role in ${guild.name}`}
			onClose={handleClose}
		>
			<FormContainer>
				{/* Error Message */}
				{error && <ErrorMessage>{error}</ErrorMessage>}
				
				<InputGroup>
					<Label>Role Name</Label>
					<Input
						type="text"
						placeholder="Enter role name"
						value={roleName}
						onChange={(e) => setRoleName(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === 'Enter' && roleName.trim()) {
								handleCreateRole();
							}
						}}
					/>
				</InputGroup>
				
				<InputGroup>
					<Label>Role Color</Label>
					<ColorPicker>
						<ColorPreview 
							color={roleColor} 
							onClick={() => document.getElementById('colorInput')?.click()}
						/>
						<ColorInput
							id="colorInput"
							type="color"
							value={roleColor}
							onChange={(e) => setRoleColor(e.target.value)}
						/>
						<ColorInput
							type="text"
							value={roleColor}
							onChange={(e) => setRoleColor(e.target.value)}
							placeholder="#99aab5"
						/>
					</ColorPicker>
				</InputGroup>
				
				<ButtonGroup>
					<CancelButton onClick={handleClose}>
						Cancel
					</CancelButton>
					<SaveButton 
						onClick={handleCreateRole}
						disabled={!roleName.trim() || isCreating}
					>
						{isCreating ? 'Creating...' : 'Create Role'}
					</SaveButton>
				</ButtonGroup>
			</FormContainer>
		</Modal>
	);
}

export default observer(CreateRoleModal);
