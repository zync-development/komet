import Avatar from "@components/Avatar";
import Button from "@components/Button";
import SectionTitle from "@components/SectionTitle";
import { useAppStore } from "@hooks/useAppStore";
import { RESTPatchAPICurrentUserJSONBody, Routes } from "@spacebarchat/spacebar-api-types/v9";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import Icon from "@components/Icon";

const Content = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	min-height: 0;
	overflow: visible;
`;

const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const SectionHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const SectionTitle = styled.h3`
	color: var(--text);
	font-size: 20px;
	font-weight: 600;
	margin: 0;
`;

const SectionSubtitle = styled.p`
	color: var(--text-secondary);
	font-size: 14px;
	margin: 0;
	line-height: 1.4;
`;

const UserInfoSection = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 20px;
	padding: 20px;
	background: var(--background-secondary);
	border-radius: 8px;
	border: 1px solid var(--background-tertiary);
`;

const AvatarSection = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
`;

const AvatarContainer = styled.div`
	position: relative;
	cursor: pointer;
`;

const AvatarOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.2s ease;
	
	${AvatarContainer}:hover & {
		opacity: 1;
	}
`;

const UserDetails = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const Username = styled.h2`
	color: var(--text);
	font-size: 24px;
	font-weight: 600;
	margin: 0;
`;

const UserId = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--text-secondary);
	font-size: 14px;
`;



const AccountDetailsSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const DetailItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	background: var(--background-secondary);
	border-radius: 8px;
	border: 1px solid var(--background-tertiary);
`;

const DetailLeft = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const DetailIcon = styled.div`
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
`;

const DetailInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

const DetailLabel = styled.span`
	color: var(--text-secondary);
	font-size: 12px;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
	color: var(--text);
	font-size: 16px;
	font-weight: 500;
`;

const DetailActions = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const RevealButton = styled.button`
	color: var(--error);
	background: none;
	border: none;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	text-decoration: underline;
	
	&:hover {
		color: var(--error-light);
	}
`;

const EditButton = styled.button`
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	color: var(--text-secondary);
	cursor: pointer;
	border-radius: 4px;
	transition: all 0.2s ease;
	
	&:hover {
		background: var(--background-tertiary);
		color: var(--text);
	}
`;

const TwoFactorSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const TwoFactorOptions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const TwoFactorOption = styled.button`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 16px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
	
	&:hover {
		background: var(--background-secondary-highlight);
		border-color: var(--background-secondary-highlight);
	}
`;

const TwoFactorIcon = styled.div`
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
`;

const TwoFactorContent = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const TwoFactorTitle = styled.span`
	color: var(--text);
	font-size: 16px;
	font-weight: 600;
`;

const TwoFactorDescription = styled.span`
	color: var(--text-secondary);
	font-size: 14px;
	line-height: 1.4;
`;

const WarningBanner = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px;
	background: var(--error);
	color: white;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
`;

const WarningIcon = styled.div`
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: white;
	border-radius: 50%;
	color: var(--error);
	font-size: 12px;
	font-weight: bold;
`;

const AccountManagementSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const ManagementOptions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const ManagementOption = styled.button`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
	
	&:hover {
		background: var(--background-secondary-highlight);
		border-color: var(--background-secondary-highlight);
	}
`;

const ManagementLeft = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const ManagementIcon = styled.div`
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
`;

const ManagementContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const ManagementTitle = styled.span`
	color: var(--text);
	font-size: 16px;
	font-weight: 600;
`;

const ManagementDescription = styled.span`
	color: var(--text-secondary);
	font-size: 14px;
	line-height: 1.4;
`;

const ArrowIcon = styled.div`
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
`;

const HiddenInput = styled.input`
	display: none;
`;

function AccountSettingsPage() {
	const app = useAppStore();
	const [shouldRedactEmail, setShouldRedactEmail] = useState(true);
	const [selectedFile, setSelectedFile] = useState<File>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [loading, setLoading] = useState(false);

	const redactEmail = (email: string) => {
		const [username, domain] = email.split("@");
		return `${"*".repeat(username.length)}@${domain}`;
	};

	const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		setSelectedFile(event.target.files[0]);
	};

	const discardChanges = () => {
		setSelectedFile(undefined);
	};

	const save = async () => {
		setLoading(true);
		if (!selectedFile) return;
		const reader = new FileReader();
		reader.onload = async () => {
			const payload: RESTPatchAPICurrentUserJSONBody = {
				// @ts-expect-error broken types or whatever
				avatar: reader.result,
			};
			app.rest
				.patch<RESTPatchAPICurrentUserJSONBody, RESTPatchAPICurrentUserJSONBody>(Routes.user(), payload)
				.then((r) => {
					setSelectedFile(undefined);
					setLoading(false);
				})
				.catch((e) => {
					console.error(e);
					setLoading(false);
				});
		};
		reader.readAsDataURL(selectedFile);
	};

	const handleGenerateBackupCodes = () => {
		// TODO: Implement backup codes generation
		console.log("Generate backup codes clicked");
	};

	const handleAddAuthenticator = () => {
		// TODO: Implement authenticator setup
		console.log("Add authenticator clicked");
	};

	const handleDisableAccount = () => {
		// TODO: Implement account disable
		console.log("Disable account clicked");
	};

	const handleDeleteAccount = () => {
		// TODO: Implement account deletion
		console.log("Delete account clicked");
	};

	useEffect(() => {
		if (selectedFile) {
			setHasUnsavedChanges(true);
		} else {
			setHasUnsavedChanges(false);
		}
	}, [selectedFile]);

	return (
		<div>
			<SectionTitle>My Account</SectionTitle>
			<Content>
				{/* User Information Section */}
				<Section>
					<UserInfoSection>
						<AvatarSection>
							<AvatarContainer onClick={() => fileInputRef.current?.click()}>
								{selectedFile ? (
									<img
										src={URL.createObjectURL(selectedFile)}
										alt="Avatar"
										width="80"
										height="80"
										style={{
											borderRadius: "50%",
											objectFit: "cover",
										}}
									/>
								) : (
									<Avatar user={app.account!} size={80} />
								)}
								<AvatarOverlay>
									<Icon icon="mdiCamera" size="24px" color="white" />
								</AvatarOverlay>
							</AvatarContainer>
							<HiddenInput
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={onAvatarChange}
							/>
						</AvatarSection>
						
						<UserDetails>
							<Username>{app.account?.username}#{app.account?.discriminator}</Username>
							<UserId>
								<Icon icon="mdiHelpCircle" size="16px" />
								{app.account?.id || "Unknown ID"}
							</UserId>
						</UserDetails>
					</UserInfoSection>
				</Section>

				{/* Account Details Section */}
				<Section>
					<SectionHeader>
						<SectionTitle>Account Details</SectionTitle>
					</SectionHeader>
					
					<AccountDetailsSection>
						<DetailItem>
							<DetailLeft>
								<DetailIcon>
									<Icon icon="mdiAt" size="20px" />
								</DetailIcon>
								<DetailInfo>
									<DetailLabel>Username</DetailLabel>
									<DetailValue>{app.account?.username}#{app.account?.discriminator}</DetailValue>
								</DetailInfo>
							</DetailLeft>
							<DetailActions>
								<EditButton>
									<Icon icon="mdiPencil" size="16px" />
								</EditButton>
							</DetailActions>
						</DetailItem>

						<DetailItem>
							<DetailLeft>
								<DetailIcon>
									<Icon icon="mdiEmail" size="20px" />
								</DetailIcon>
								<DetailInfo>
									<DetailLabel>Email</DetailLabel>
									<DetailValue>
										{app.account?.email
											? shouldRedactEmail
												? redactEmail(app.account.email)
												: app.account.email
											: "No email added."}
									</DetailValue>
								</DetailInfo>
							</DetailLeft>
							<DetailActions>
								<RevealButton onClick={() => setShouldRedactEmail(!shouldRedactEmail)}>
									{shouldRedactEmail ? "Reveal" : "Hide"}
								</RevealButton>
								<EditButton>
									<Icon icon="mdiPencil" size="16px" />
								</EditButton>
							</DetailActions>
						</DetailItem>

						<DetailItem>
							<DetailLeft>
								<DetailIcon>
									<Icon icon="mdiKey" size="20px" />
								</DetailIcon>
								<DetailInfo>
									<DetailLabel>Password</DetailLabel>
									<DetailValue>•••••••••</DetailValue>
								</DetailInfo>
							</DetailLeft>
							<DetailActions>
								<EditButton>
									<Icon icon="mdiPencil" size="16px" />
								</EditButton>
							</DetailActions>
						</DetailItem>
					</AccountDetailsSection>
				</Section>

				{/* Two-Factor Authentication Section */}
				<Section>
					<SectionHeader>
						<SectionTitle>Two-Factor Authentication</SectionTitle>
						<SectionSubtitle>Add an extra layer of security by enabling 2FA on your account.</SectionSubtitle>
					</SectionHeader>
					
					<TwoFactorSection>
						<TwoFactorOptions>
							<TwoFactorOption onClick={handleGenerateBackupCodes}>
								<TwoFactorIcon>
									<Icon icon="mdiFormatListBulleted" size="24px" />
								</TwoFactorIcon>
								<TwoFactorContent>
									<TwoFactorTitle>Generate Backup Codes</TwoFactorTitle>
									<TwoFactorDescription>Get ready to use 2FA by setting up a backup method.</TwoFactorDescription>
								</TwoFactorContent>
							</TwoFactorOption>

							<TwoFactorOption onClick={handleAddAuthenticator}>
								<TwoFactorIcon>
									<Icon icon="mdiLock" size="24px" />
								</TwoFactorIcon>
								<TwoFactorContent>
									<TwoFactorTitle>Add Authenticator</TwoFactorTitle>
									<TwoFactorDescription>Set up time-based one-time password.</TwoFactorDescription>
								</TwoFactorContent>
							</TwoFactorOption>
						</TwoFactorOptions>

						<WarningBanner>
							<WarningIcon>i</WarningIcon>
							You haven't enabled two-factor authentication!
						</WarningBanner>
					</TwoFactorSection>
				</Section>

				{/* Account Management Section */}
				<Section>
					<SectionHeader>
						<SectionTitle>Account Management</SectionTitle>
						<SectionSubtitle>Disable or delete your account at any time. This will log you out and fully delete your account, including your chat history and friends.</SectionSubtitle>
					</SectionHeader>
					
					<AccountManagementSection>
						<ManagementOptions>
							<ManagementOption onClick={handleDisableAccount}>
								<ManagementLeft>
									<ManagementIcon>
										<Icon icon="mdiCancel" size="24px" color="var(--error)" />
									</ManagementIcon>
									<ManagementContent>
										<ManagementTitle>Disable Account</ManagementTitle>
										<ManagementDescription>You won't be able to access your account unless you contact support - however, your data will not be deleted.</ManagementDescription>
									</ManagementContent>
								</ManagementLeft>
								<ArrowIcon>
									<Icon icon="mdiChevronRight" size="20px" />
								</ArrowIcon>
							</ManagementOption>

							<ManagementOption onClick={handleDeleteAccount}>
								<ManagementLeft>
									<ManagementIcon>
										<Icon icon="mdiDelete" size="24px" color="var(--error)" />
									</ManagementIcon>
									<ManagementContent>
										<ManagementTitle>Delete Account</ManagementTitle>
										<ManagementDescription>Your account and all of your data (including your messages and friends list) will be queued for deletion. A confirmation email will be sent - you can cancel this within 7 days by contacting support.</ManagementDescription>
									</ManagementContent>
								</ManagementLeft>
								<ArrowIcon>
									<Icon icon="mdiChevronRight" size="20px" />
								</ArrowIcon>
							</ManagementOption>
						</ManagementOptions>
					</AccountManagementSection>
				</Section>

				{/* Unsaved Changes Bar */}
				{hasUnsavedChanges && (
					<div style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						backgroundColor: "var(--background-tertiary)",
						padding: "10px 16px",
						borderRadius: "8px",
						alignItems: "center"
					}}>
						<span style={{
							color: "var(--text-secondary)",
							fontSize: "16px",
							fontWeight: "500"
						}}>
							You have unsaved changes.
						</span>
						<div style={{ display: "flex", gap: "10px" }}>
							<Button palette="link" onClick={discardChanges} disabled={loading}>
								Discard
							</Button>
							<Button palette="primary" disabled={loading} onClick={save}>
								{loading ? "Saving..." : "Save"}
							</Button>
						</div>
					</div>
				)}
			</Content>
		</div>
	);
}

export default observer(AccountSettingsPage);
