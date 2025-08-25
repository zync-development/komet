import { ModalProps } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useForm } from "react-hook-form";
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

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

const FormSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const SectionTitle = styled.h3`
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
	display: flex;
	align-items: center;
	gap: 8px;
`;

const FormGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
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

	&::placeholder {
		color: var(--text-muted);
	}
`;

const ColorInput = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const ColorPreview = styled.div<{ color: string }>`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: ${props => props.color};
	border: 3px solid rgba(255, 255, 255, 0.1);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 16px;
	font-weight: 700;

	&:hover {
		transform: scale(1.1);
		border-color: rgba(255, 255, 255, 0.2);
	}
`;

const ColorInputField = styled.input`
	width: 100px;
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
	flex-direction: column;
	gap: 12px;
`;

const ToggleItem = styled.label`
	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;
	font-size: 14px;
	color: var(--text);
	padding: 12px;
	background: var(--background-tertiary);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: rgba(255, 255, 255, 0.1);
	}
`;

const Toggle = styled.input`
	width: 18px;
	height: 18px;
	accent-color: var(--primary);
`;

const ToggleInfo = styled.div`
	flex: 1;
`;

const ToggleTitle = styled.div`
	font-weight: 600;
	margin-bottom: 2px;
`;

const ToggleDescription = styled.div`
	font-size: 12px;
	color: var(--text-secondary);
`;

const ErrorMessage = styled.div`
	background: rgba(239, 68, 68, 0.1);
	color: var(--error);
	padding: 12px 16px;
	border-radius: 8px;
	font-size: 14px;
	border: 1px solid rgba(239, 68, 68, 0.2);
`;

const SuccessMessage = styled.div`
	background: rgba(34, 197, 94, 0.1);
	color: var(--success);
	padding: 12px 16px;
	border-radius: 8px;
	font-size: 14px;
	border: 1px solid rgba(34, 197, 94, 0.2);
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
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
		return 'var(--primary)';
	}};

	color: ${props => {
		if (props.variant === 'secondary') return 'var(--text)';
		return 'white';
	}};

	&:hover {
		background: ${props => {
			if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
			return 'var(--primary-hover)';
		}};
		transform: translateY(-1px);
		box-shadow: ${props => props.variant === 'primary' ? '0 4px 12px rgba(88, 101, 242, 0.3)' : 'none'};
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
`;

interface EditRoleModalProps {
	role: Role;
	onRoleUpdated: () => void;
	onClose: () => void;
}

function EditRoleModal(props: EditRoleModalProps) {
	const app = useAppStore();
	const { role, onClose, onRoleUpdated } = props;
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
		defaultValues: {
			name: role.name,
			color: role.color,
			hoist: role.hoist,
			mentionable: role.mentionable,
		}
	});

	const watchedValues = watch();

	const onSubmit = async (data: any) => {
		setIsSaving(true);
		setError(null);
		setSuccess(false);

		try {
			await app.rest.patch(Routes.guildRole(app.activeGuild!.id, role.id), {
				name: data.name,
				color: parseInt(data.color.substring(1), 16),
				hoist: data.hoist,
				mentionable: data.mentionable,
			});
			
			// Update local role data
			role.name = data.name;
			role.color = data.color;
			role.hoist = data.hoist;
			role.mentionable = data.mentionable;
			
			setSuccess(true);
			setTimeout(() => {
				onRoleUpdated();
				onClose();
			}, 1500);
		} catch (error: any) {
			console.error("Failed to update role:", error);
			setError(error.message || "Failed to update role. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = e.target.value;
		setValue('color', newColor);
	};

	return (
		<Modal title="Edit Role" onClose={onClose} maxWidth="600px">
			<Container>
				<Header>
					<Title>Edit Role</Title>
					<Description>
						Modify the properties and settings of the "{role.name}" role.
					</Description>
				</Header>

				{error && (
					<ErrorMessage>
						{error}
					</ErrorMessage>
				)}

				{success && (
					<SuccessMessage>
						Role updated successfully! Closing in a moment...
					</SuccessMessage>
				)}

				<Form onSubmit={handleSubmit(onSubmit)}>
					<FormSection>
						<SectionTitle>
							<Icon icon="mdiCog" size="18px" />
							Basic Settings
						</SectionTitle>
						
						<FormGrid>
							<FormGroup>
								<Label>Role Name</Label>
								<Input 
									{...register("name", { 
										required: "Role name is required",
										minLength: { value: 2, message: "Role name must be at least 2 characters" },
										maxLength: { value: 100, message: "Role name must be less than 100 characters" }
									})} 
									placeholder="Enter role name"
								/>
								{errors.name && (
									<span style={{ color: 'var(--error)', fontSize: '12px' }}>
										{errors.name.message}
									</span>
								)}
							</FormGroup>
							
							<FormGroup>
								<Label>Role Color</Label>
								<ColorInput>
									<ColorPreview 
										color={watchedValues.color || role.color}
										onClick={() => document.getElementById('color-input')?.click()}
									>
										<Icon icon="mdiPalette" size="16px" />
									</ColorPreview>
									<ColorInputField
										id="color-input"
										{...register("color")}
										onChange={handleColorChange}
										placeholder="#5865f2"
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
								<ToggleInfo>
									<ToggleTitle>Display Role Members Separately</ToggleTitle>
									<ToggleDescription>
										Show members with this role in a separate section in the member list
									</ToggleDescription>
								</ToggleInfo>
							</ToggleItem>
							
							<ToggleItem>
								<Toggle 
									type="checkbox" 
									{...register("mentionable")}
								/>
								<ToggleInfo>
									<ToggleTitle>Allow @mentions</ToggleTitle>
									<ToggleDescription>
										Allow anyone to @mention this role
									</ToggleDescription>
								</ToggleInfo>
							</ToggleItem>
						</ToggleGroup>
					</FormSection>

					<ButtonGroup>
						<Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
							Cancel
						</Button>
						<Button 
							type="submit" 
							disabled={isSaving || success}
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</Button>
					</ButtonGroup>
				</Form>
			</Container>
		</Modal>
	);
}

export default observer(EditRoleModal);