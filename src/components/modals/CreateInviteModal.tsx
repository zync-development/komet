import { ModalProps, modalController } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import styled from "styled-components";
import { Modal } from "./ModalComponents";
import Icon from "@components/Icon";
import { ChannelType } from "@spacebarchat/spacebar-api-types/v9";

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

const Select = styled.select`
	width: 100%;
	padding: 10px;
	border: 1px solid var(--background-tertiary);
	border-radius: 6px;
	background: var(--background-primary);
	color: var(--text);
	font-size: 14px;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const Input = styled.input`
	width: 100%;
	padding: 10px;
	border: 1px solid var(--background-tertiary);
	border-radius: 6px;
	background: var(--background-primary);
	color: var(--text);
	font-size: 14px;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
	}
`;

const CheckboxContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const Checkbox = styled.input`
	width: 16px;
	height: 16px;
	cursor: pointer;
`;

const CheckboxLabel = styled.label`
	font-size: 14px;
	color: var(--text);
	cursor: pointer;
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

const SuccessMessage = styled.div`
	background: var(--success);
	color: white;
	padding: 12px;
	border-radius: 4px;
	margin-bottom: 16px;
	font-size: 14px;
`;

const InvitePreview = styled.div`
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 6px;
	padding: 16px;
	margin-bottom: 20px;
`;

const InviteCode = styled.div`
	font-family: monospace;
	font-size: 18px;
	font-weight: 600;
	color: var(--primary);
	margin-bottom: 8px;
`;

const InviteDetails = styled.div`
	font-size: 14px;
	color: var(--text-secondary);
`;

export function CreateInviteModal({ target: channel, ...props }: ModalProps<"create_invite">) {
	const app = useAppStore();
	const [selectedChannel, setSelectedChannel] = useState(channel?.id || '');
	const [maxUses, setMaxUses] = useState<number | null>(null);
	const [expiresIn, setExpiresIn] = useState<number | null>(null);
	const [temporary, setTemporary] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [createdInvite, setCreatedInvite] = useState<any>(null);

	// Get the guild from the channel
	const guild = channel?.guild;
	
	// Debug logging
	console.log('CreateInviteModal Debug:', {
		channel,
		channelId: channel?.id,
		guild,
		guildId: channel?.guildId,
		appGuilds: app.guilds.count,
		selectedChannel
	});
	
	// Get text channels for invite creation
	const textChannels = guild?.channels?.filter((ch: any) => 
		ch.type === ChannelType.GuildText
	) || [];

	const handleCreateInvite = async () => {
		if (!selectedChannel) {
			setError('Please select a channel for the invite');
			return;
		}
		
		setError(null);
		setIsCreating(true);
		
		try {
			const inviteData: any = {
				max_age: expiresIn ? expiresIn * 3600 : 0, // Convert hours to seconds
				max_uses: maxUses || 0,
				temporary: temporary
			};

			console.log('Creating invite with data:', {
				channelId: selectedChannel,
				inviteData,
				apiUrl: `/v9/channels/${selectedChannel}/invites`
			});

			const newInvite = await app.rest.post(`/v9/channels/${selectedChannel}/invites`, inviteData);
			
			console.log('Invite created successfully:', newInvite);
			setCreatedInvite(newInvite);
			
		} catch (error: any) {
			console.error('Error creating invite:', error);
			console.error('Error details:', {
				status: error.status,
				statusText: error.statusText,
				response: error.response,
				message: error.message
			});
			setError('Failed to create invite: ' + (error.message || 'Unknown error'));
		} finally {
			setIsCreating(false);
		}
	};

	const handleCopyInvite = () => {
		if (createdInvite?.code) {
			const inviteUrl = `${window.location.origin}/invite/${createdInvite.code}`;
			navigator.clipboard.writeText(inviteUrl);
			// You could show a toast notification here
		}
	};

	const handleClose = () => {
		modalController.closeAll();
	};

	const handleDone = () => {
		modalController.closeAll();
	};

	if (!guild) {
		return (
			<Modal
				{...props}
				title="Create Invite"
				description="Unable to create invite - guild not found."
				onClose={handleClose}
			>
				<FormContainer>
					<ErrorMessage>Failed to load guild information.</ErrorMessage>
					<ButtonGroup>
						<CancelButton onClick={handleClose}>
							Close
						</CancelButton>
					</ButtonGroup>
				</FormContainer>
			</Modal>
		);
	}

	return (
		<Modal
			{...props}
			title="Create Invite"
			description={`Create an invite for ${guild.name}`}
			onClose={handleClose}
		>
			<FormContainer>
				{/* Error Message */}
				{error && <ErrorMessage>{error}</ErrorMessage>}
				
				{/* Success Message */}
				{createdInvite && (
					<SuccessMessage>
						<InvitePreview>
							<InviteCode>#{createdInvite.code}</InviteCode>
							<InviteDetails>
								Channel: #{guild.channels?.find((c: any) => c.id === selectedChannel)?.name || 'Unknown'}<br />
								Max Uses: {maxUses || 'Unlimited'}<br />
								Expires: {expiresIn ? `In ${expiresIn} hours` : 'Never'}<br />
								Temporary: {temporary ? 'Yes' : 'No'}
							</InviteDetails>
						</InvitePreview>
					</SuccessMessage>
				)}
				
				{!createdInvite && (
					<>
						<InputGroup>
							<Label>Channel</Label>
							<Select
								value={selectedChannel}
								onChange={(e) => setSelectedChannel(e.target.value)}
							>
								<option value="">Select a channel</option>
								{textChannels.map((ch: any) => (
									<option key={ch.id} value={ch.id}>
										#{ch.name}
									</option>
								))}
							</Select>
						</InputGroup>
						
						<InputGroup>
							<Label>Max Uses (0 = unlimited)</Label>
							<Input
								type="number"
								min="0"
								max="100"
								placeholder="0"
								value={maxUses || ''}
								onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : null)}
							/>
						</InputGroup>
						
						<InputGroup>
							<Label>Expires In (hours, 0 = never)</Label>
							<Input
								type="number"
								min="0"
								max="8760"
								placeholder="24"
								value={expiresIn || ''}
								onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : null)}
							/>
						</InputGroup>
						
						<InputGroup>
							<CheckboxContainer>
								<Checkbox
									type="checkbox"
									id="temporary"
									checked={temporary}
									onChange={(e) => setTemporary(e.target.checked)}
								/>
								<CheckboxLabel htmlFor="temporary">
									Temporary membership (kicked after going offline)
								</CheckboxLabel>
							</CheckboxContainer>
						</InputGroup>
					</>
				)}
				
				<ButtonGroup>
					<CancelButton onClick={handleClose}>
						Cancel
					</CancelButton>
					
					{createdInvite ? (
						<>
							<CancelButton onClick={handleCopyInvite}>
								<Icon icon="mdiContentCopy" size={16} />
								Copy Link
							</CancelButton>
							<SaveButton onClick={handleDone}>
								Done
							</SaveButton>
						</>
					) : (
						<SaveButton 
							onClick={handleCreateInvite}
							disabled={!selectedChannel || isCreating}
						>
							{isCreating ? 'Creating...' : 'Create Invite'}
						</SaveButton>
					)}
				</ButtonGroup>
			</FormContainer>
		</Modal>
	);
}

export default observer(CreateInviteModal);
