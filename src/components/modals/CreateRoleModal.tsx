import { ModalProps } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Modal } from "./ModalComponents";
import { Routes } from "@spacebarchat/spacebar-api-types/v9";
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

// Template section
const TemplateSection = styled.div`
	background: var(--background-secondary);
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	overflow: hidden;
`;

const TemplateHeader = styled.div`
	padding: 16px 20px;
	background: rgba(255, 255, 255, 0.02);
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const TemplateTitle = styled.h4`
	margin: 0;
	font-size: 14px;
	font-weight: 600;
	color: var(--text);
`;

const TemplateList = styled.div`
	padding: 16px;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
	gap: 12px;
`;

const TemplateItem = styled.button<{ isSelected: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 16px 12px;
	background: ${props => props.isSelected ? 'rgba(88, 101, 242, 0.15)' : 'transparent'};
	border: 1px solid ${props => props.isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)'};
	border-radius: 8px;
	color: var(--text);
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: center;

	&:hover {
		background: ${props => props.isSelected ? 'rgba(88, 101, 242, 0.2)' : 'rgba(255, 255, 255, 0.04)'};
		transform: translateY(-1px);
	}
`;

const TemplateIcon = styled.div<{ color: string }>`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: ${props => props.color};
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 16px;
`;

const TemplateName = styled.div`
	font-weight: 600;
`;

const TemplateDescription = styled.div`
	font-size: 11px;
	color: var(--text-secondary);
	line-height: 1.3;
`;

// Permission presets
const PermissionPresets = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const PresetItem = styled.button<{ isSelected: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: ${props => props.isSelected ? 'rgba(88, 101, 242, 0.15)' : 'var(--background-tertiary)'};
	border: 1px solid ${props => props.isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)'};
	border-radius: 8px;
	color: var(--text);
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;

	&:hover {
		background: ${props => props.isSelected ? 'rgba(88, 101, 242, 0.2)' : 'rgba(255, 255, 255, 0.04)'};
		transform: translateY(-1px);
	}
`;

const PresetInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const PresetIcon = styled.div<{ color: string }>`
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: ${props => props.color};
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 12px;
`;

const PresetDetails = styled.div`
	flex: 1;
`;

const PresetName = styled.div`
	font-weight: 600;
	margin-bottom: 2px;
`;

const PresetDescription = styled.div`
	font-size: 12px;
	color: var(--text-secondary);
`;

const PresetCheck = styled.div`
	color: var(--primary);
	opacity: ${props => props.isSelected ? 1 : 0};
	transition: opacity 0.2s ease;
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
		if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.1)';
		return 'var(--primary)';
	}};

	color: ${props => {
		if (props.variant === 'secondary') return 'var(--text)';
		if (props.variant === 'danger') return 'var(--error)';
		return 'white';
	}};

	&:hover {
		background: ${props => {
			if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
			if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
			return 'var(--primary-hover)';
		}};
		transform: translateY(-1px);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
		transform: none;
	}
`;

// Role templates data
const ROLE_TEMPLATES = [
	{
		id: 'moderator',
		name: "Moderator",
		description: "Basic moderation permissions",
		icon: "mdiShieldAccount",
		color: "#5865f2"
	},
	{
		id: 'admin',
		name: "Admin",
		description: "Full server management",
		icon: "mdiCrown",
		color: "#faa61a"
	},
	{
		id: 'member',
		name: "Member",
		description: "Standard member access",
		icon: "mdiAccount",
		color: "#57f287"
	},
	{
		id: 'guest',
		name: "Guest",
		description: "Limited access role",
		icon: "mdiAccountQuestion",
		color: "#747f8d"
	}
];

// Permission presets
const PERMISSION_PRESETS = [
	{
		id: 'moderator',
		name: "Moderator",
		description: "Basic moderation capabilities",
		icon: "M",
		color: "#5865f2",
		permissions: ["ManageMessages", "KickMembers", "BanMembers", "ManageNicknames"]
	},
	{
		id: 'admin',
		name: "Administrator",
		description: "Full server control",
		icon: "A",
		color: "#faa61a",
		permissions: ["Administrator"]
	},
	{
		id: 'member',
		name: "Member",
		description: "Standard member access",
		icon: "M",
		color: "#57f287",
		permissions: ["ViewChannel", "SendMessage", "ReadMessageHistory"]
	},
	{
		id: 'guest',
		name: "Guest",
		description: "Limited access only",
		icon: "G",
		color: "#747f8d",
		permissions: ["ViewChannel"]
	}
];

interface CreateRoleModalProps {
	guild: any;
	onRoleCreated: () => void;
	onClose: () => void;
	template?: typeof ROLE_TEMPLATES[0];
}

function CreateRoleModal(props: CreateRoleModalProps) {
	const app = useAppStore();
	const { guild, onClose, onRoleCreated, template } = props;
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(template?.id || null);
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);

	const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
		defaultValues: {
			name: template?.name || '',
			color: template?.color || '#5865f2',
			hoist: false,
			mentionable: false,
		}
	});

	const watchedValues = watch();

	// Apply template when selected
	useEffect(() => {
		if (selectedTemplate) {
			const template = ROLE_TEMPLATES.find(t => t.id === selectedTemplate);
			if (template) {
				setValue('name', template.name);
				setValue('color', template.color);
			}
		}
	}, [selectedTemplate, setValue]);

	// Apply preset when selected
	useEffect(() => {
		if (selectedPreset) {
			const preset = PERMISSION_PRESETS.find(p => p.id === selectedPreset);
			if (preset) {
				// TODO: Apply permission preset
				console.log('Applying permission preset:', preset);
			}
		}
	}, [selectedPreset]);

	const onSubmit = async (data: any) => {
		setIsCreating(true);
		try {
			await app.rest.post(Routes.guildRoles(guild.id), {
				name: data.name,
				color: parseInt(data.color.substring(1), 16),
				permissions: "0", // Default permissions
				denied_permissions: "0", // Default denied permissions
				hoist: data.hoist,
				mentionable: data.mentionable,
			});
			
			onRoleCreated();
			onClose();
		} catch (error) {
			console.error("Failed to create role:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = e.target.value;
		setValue('color', newColor);
	};

	const handleTemplateSelect = (templateId: string) => {
		setSelectedTemplate(selectedTemplate === templateId ? null : templateId);
	};

	const handlePresetSelect = (presetId: string) => {
		setSelectedPreset(selectedPreset === presetId ? null : presetId);
	};

	return (
		<Modal title="Create New Role" onClose={onClose} maxWidth="700px">
			<Container>
				<Header>
					<Title>Create New Role</Title>
					<Description>
						Create a new role for your server. You can choose from templates or create a custom role.
					</Description>
				</Header>

				<Form onSubmit={handleSubmit(onSubmit)}>
					{/* Template Selection */}
					<FormSection>
						<SectionTitle>
							<Icon icon="mdiPalette" size="18px" />
							Choose Template (Optional)
						</SectionTitle>
						<TemplateSection>
							<TemplateHeader>
								<TemplateTitle>Quick Start Templates</TemplateTitle>
							</TemplateHeader>
							<TemplateList>
								{ROLE_TEMPLATES.map((template) => (
									<TemplateItem
										key={template.id}
										isSelected={selectedTemplate === template.id}
										onClick={() => handleTemplateSelect(template.id)}
										title={template.description}
									>
										<TemplateIcon color={template.color}>
											<Icon icon={template.icon} size="16px" />
										</TemplateIcon>
										<TemplateName>{template.name}</TemplateName>
										<TemplateDescription>{template.description}</TemplateDescription>
									</TemplateItem>
								))}
							</TemplateList>
						</TemplateSection>
					</FormSection>

					{/* Basic Settings */}
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
										color={watchedValues.color || '#5865f2'}
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

					{/* Permission Presets */}
					<FormSection>
						<SectionTitle>
							<Icon icon="mdiShield" size="18px" />
							Permission Presets (Optional)
						</SectionTitle>
						<Description>
							Choose a permission preset to quickly set up common permission combinations.
						</Description>
						
						<PermissionPresets>
							{PERMISSION_PRESETS.map((preset) => (
								<PresetItem
									key={preset.id}
									isSelected={selectedPreset === preset.id}
									onClick={() => handlePresetSelect(preset.id)}
								>
									<PresetInfo>
										<PresetIcon color={preset.color}>
											{preset.icon}
										</PresetIcon>
										<PresetDetails>
											<PresetName>{preset.name}</PresetName>
											<PresetDescription>{preset.description}</PresetDescription>
										</PresetDetails>
									</PresetInfo>
									<PresetCheck isSelected={selectedPreset === preset.id}>
										<Icon icon="mdiCheck" size="18px" />
									</PresetCheck>
								</PresetItem>
							))}
						</PermissionPresets>
					</FormSection>

					<ButtonGroup>
						<Button type="button" variant="secondary" onClick={onClose}>
							Cancel
						</Button>
						<Button 
							type="submit" 
							disabled={isCreating || !watchedValues.name?.trim()}
						>
							{isCreating ? 'Creating...' : 'Create Role'}
						</Button>
					</ButtonGroup>
				</Form>
			</Container>
		</Modal>
	);
}

export default observer(CreateRoleModal);