import Avatar from "@components/Avatar";
import Button from "@components/Button";
import SectionTitle from "@components/SectionTitle";
import { useAppStore } from "@hooks/useAppStore";
import { RESTPatchAPICurrentUserJSONBody, Routes } from "@spacebarchat/spacebar-api-types/v9";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import styled from "styled-components";
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

const SectionTitleStyled = styled.h3`
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

const PreviewSection = styled.div`
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 8px;
	padding: 20px;
	position: relative;
`;

const PreviewHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 16px;
`;

const PreviewTitle = styled.h4`
	color: var(--text);
	font-size: 18px;
	font-weight: 600;
	margin: 0;
`;

const FlagIcon = styled.div`
	color: var(--text-secondary);
	font-size: 16px;
`;

const ProfileCard = styled.div`
	display: flex;
	gap: 16px;
	align-items: flex-start;
`;

const AvatarContainer = styled.div`
	position: relative;
	flex-shrink: 0;
`;

const StatusIndicator = styled.div`
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 16px;
	height: 16px;
	background: var(--success);
	border: 3px solid var(--background-secondary);
	border-radius: 50%;
`;

const ProfileInfo = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const Username = styled.div`
	color: var(--text);
	font-size: 18px;
	font-weight: 600;
`;

const Discriminator = styled.div`
	color: var(--text-secondary);
	font-size: 14px;
`;

const Status = styled.div`
	color: var(--text-secondary);
	font-size: 14px;
`;

const ProfileTab = styled.div`
	color: var(--text-link);
	font-size: 12px;
	text-decoration: underline;
	margin-top: 4px;
`;

const InformationSection = styled.div`
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid var(--background-tertiary);
`;

const InformationTitle = styled.div`
	color: var(--text-secondary);
	font-size: 12px;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 8px;
`;

const InformationText = styled.div`
	color: var(--text);
	font-size: 14px;
	line-height: 1.4;
`;

const FormSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

const FieldGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const FieldHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const FieldTitle = styled.h4`
	color: var(--text);
	font-size: 14px;
	font-weight: 600;
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const NewTag = styled.span`
	background: var(--error);
	color: white;
	font-size: 10px;
	font-weight: 600;
	padding: 2px 6px;
	border-radius: 4px;
	text-transform: uppercase;
`;

const FieldDescription = styled.p`
	color: var(--text-secondary);
	font-size: 12px;
	margin: 0;
	line-height: 1.4;
`;

const ProfilePictureSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const CurrentAvatar = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const AvatarImage = styled.div`
	position: relative;
	cursor: pointer;
`;

const RemoveButton = styled.button`
	color: var(--text);
	background: none;
	border: none;
	font-size: 14px;
	cursor: pointer;
	text-decoration: underline;
	
	&:hover {
		color: var(--text-link);
	}
`;

const FileSizeInfo = styled.span`
	color: var(--text-secondary);
	font-size: 12px;
`;

const BackgroundUpload = styled.div`
	width: 100%;
	height: 120px;
	background: var(--background-secondary);
	border: 2px dashed var(--background-tertiary);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	
	&:hover {
		border-color: var(--background-secondary-highlight);
		background: var(--background-secondary-highlight);
	}
`;

const UploadText = styled.span`
	color: var(--text-link);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
`;

const TextArea = styled.textarea`
	width: 100%;
	min-height: 100px;
	padding: 12px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 6px;
	color: var(--text);
	font-size: 14px;
	font-family: inherit;
	resize: vertical;
	
	&:focus {
		outline: none;
		border-color: var(--primary);
	}
	
	&:placeholder {
		color: var(--text-muted);
	}
`;

const MarkdownInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--text-secondary);
	font-size: 12px;
	margin-top: 8px;
`;

const MarkdownLink = styled.a`
	color: var(--error);
	text-decoration: none;
	cursor: pointer;
	
	&:hover {
		text-decoration: underline;
	}
`;

const SaveButton = styled(Button)`
	width: 100%;
	margin-top: 8px;
`;

const NoticeBar = styled.div`
	background: var(--background-tertiary);
	padding: 16px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	gap: 12px;
	margin-top: 24px;
`;

const NoticeIcon = styled.div`
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text);
	font-weight: bold;
`;

const NoticeText = styled.span`
	color: var(--text);
	font-size: 14px;
`;

const NoticeLink = styled.a`
	color: var(--error);
	text-decoration: none;
	cursor: pointer;
	
	&:hover {
		text-decoration: underline;
	}
`;

const HiddenInput = styled.input`
	display: none;
`;

function ProfileSettingsPage() {
	const app = useAppStore();
	const [displayName, setDisplayName] = useState(app.account?.display_name || "");
	const [bio, setBio] = useState(app.account?.bio || "");
	const [selectedAvatar, setSelectedAvatar] = useState<File>();
	const [selectedBackground, setSelectedBackground] = useState<File>();
	const [removeBackground, setRemoveBackground] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saved, setSaved] = useState(false);
	
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const backgroundInputRef = useRef<HTMLInputElement>(null);

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		setSelectedAvatar(event.target.files[0]);
	};

	const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		setSelectedBackground(event.target.files[0]);
	};

	const handleRemoveAvatar = () => {
		setSelectedAvatar(undefined);
		// TODO: Implement actual avatar removal
	};

	const handleRemoveBackground = () => {
		setRemoveBackground(true);
		setSelectedBackground(undefined);
		// TODO: Implement actual background removal
	};

	const handleSave = async () => {
		setLoading(true);
		
		try {
			const payload: RESTPatchAPICurrentUserJSONBody = {};
			
			// Update display name if changed
			if (displayName !== app.account?.display_name) {
				payload.display_name = displayName;
			}
			
			// Update bio if changed
			if (bio !== app.account?.bio) {
				payload.bio = bio;
			}
			
			// Update avatar if changed
			if (selectedAvatar) {
				const reader = new FileReader();
				reader.onload = async () => {
					payload.avatar = reader.result as string;
					await saveProfile(payload);
				};
				reader.readAsDataURL(selectedAvatar);
				return; // Exit early, will be called again after avatar processing
			}
			
			// Update background if changed
			if (selectedBackground) {
				const reader = new FileReader();
				reader.onload = async () => {
					payload.banner = reader.result as string;
					await saveProfile(payload);
				};
				reader.readAsDataURL(selectedBackground);
				return; // Exit early, will be called again after background processing
			}
			
			// Handle background removal
			if (removeBackground && app.account?.banner) {
				payload.banner = null;
			}
			
			await saveProfile(payload);
		} catch (error) {
			console.error("Error saving profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const saveProfile = async (payload: RESTPatchAPICurrentUserJSONBody) => {
		try {
			await app.rest.patch(Routes.user(), payload);
			
			// Update local state
			if (payload.display_name !== undefined) {
				app.account!.display_name = payload.display_name;
			}
			if (payload.bio !== undefined) {
				app.account!.bio = payload.bio;
			}
			if (payload.avatar !== undefined) {
				app.account!.avatar = payload.avatar;
			}
			if (payload.banner !== undefined) {
				app.account!.banner = payload.banner;
			}
			
			// Show success feedback
			console.log("Profile updated successfully!");
			setSaved(true);
			setTimeout(() => setSaved(false), 3000); // Hide after 3 seconds
		} catch (error) {
			console.error("Error updating profile:", error);
			throw error;
		}
	};

	return (
		<div>
			<SectionTitle>Profile</SectionTitle>
			<Content>
				{/* Profile Preview Section */}
				<Section>
					<SectionHeader>
						<SectionTitleStyled>Profile Preview</SectionTitleStyled>
						<SectionSubtitle>See how your profile will appear to others</SectionSubtitle>
					</SectionHeader>
					
					<PreviewSection>
						<PreviewHeader>
							<PreviewTitle>PREVIEW</PreviewTitle>
							<FlagIcon>🏁</FlagIcon>
						</PreviewHeader>
						
						{/* Banner Preview */}
						{(selectedBackground || app.account?.banner) && (
							<div style={{
								width: "100%",
								height: "120px",
								backgroundImage: `url(${selectedBackground ? URL.createObjectURL(selectedBackground) : app.account?.banner})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								borderRadius: "8px",
								marginBottom: "16px"
							}} />
						)}
						
						<ProfileCard>
							<AvatarContainer>
								<Avatar 
									user={{
										...app.account!,
										avatar: selectedAvatar ? URL.createObjectURL(selectedAvatar) : app.account?.avatar
									}} 
									size={64} 
								/>
								<StatusIndicator />
							</AvatarContainer>
							
							<ProfileInfo>
								<Username>{displayName || app.account?.display_name || app.account?.username}</Username>
								<Discriminator>{app.account?.username}#{app.account?.discriminator}</Discriminator>
								<Status>Hey!</Status>
								<ProfileTab>Profile</ProfileTab>
							</ProfileInfo>
						</ProfileCard>
						
						<InformationSection>
							<InformationTitle>INFORMATION</InformationTitle>
							<InformationText>{bio || app.account?.bio || "Just a normal person lol."}</InformationText>
						</InformationSection>
					</PreviewSection>
				</Section>

				{/* Form Sections */}
				<Section>
					<SectionHeader>
						<SectionTitleStyled>Edit Profile</SectionTitleStyled>
						<SectionSubtitle>Customize your profile information and appearance</SectionSubtitle>
					</SectionHeader>
					
					<FormSection>
						{/* Display Name */}
						<FieldGroup>
							<FieldHeader>
								<FieldTitle>Display Name</FieldTitle>
								<NewTag>NEW</NewTag>
							</FieldHeader>
							<FieldDescription>Change your display name to whatever you like</FieldDescription>
							<TextArea
								placeholder="Enter your display name..."
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								maxLength={32}
								style={{ minHeight: "48px", resize: "none" }}
							/>
						</FieldGroup>

						{/* Profile Picture */}
						<FieldGroup>
							<FieldTitle>Profile Picture</FieldTitle>
							<ProfilePictureSection>
								<CurrentAvatar>
									<AvatarImage onClick={() => avatarInputRef.current?.click()}>
										<Avatar 
											user={{
												...app.account!,
												avatar: selectedAvatar ? URL.createObjectURL(selectedAvatar) : app.account?.avatar
											}} 
											size={48} 
										/>
									</AvatarImage>
									<div>
										<RemoveButton onClick={handleRemoveAvatar}>
											Remove
										</RemoveButton>
										<FileSizeInfo>(max 4.00 MB)</FileSizeInfo>
									</div>
								</CurrentAvatar>
								<HiddenInput
									ref={avatarInputRef}
									type="file"
									accept="image/*"
									onChange={handleAvatarChange}
								/>
							</ProfilePictureSection>
						</FieldGroup>

						{/* Custom Background */}
						<FieldGroup>
							<FieldTitle>Custom Background</FieldTitle>
							<ProfilePictureSection>
								{(app.account?.banner || selectedBackground) && (
									<div style={{ marginBottom: "12px" }}>
										<div style={{
											width: "100%",
											height: "120px",
											backgroundImage: `url(${selectedBackground ? URL.createObjectURL(selectedBackground) : app.account?.banner})`,
											backgroundSize: "cover",
											backgroundPosition: "center",
											borderRadius: "8px",
											marginBottom: "8px"
										}} />
										<RemoveButton onClick={handleRemoveBackground}>
											Remove Background
										</RemoveButton>
									</div>
								)}
								<BackgroundUpload onClick={() => backgroundInputRef.current?.click()}>
									<UploadText>Upload</UploadText>
									<FileSizeInfo>(max 6.00 MB)</FileSizeInfo>
								</BackgroundUpload>
								<HiddenInput
									ref={backgroundInputRef}
									type="file"
									accept="image/*"
									onChange={handleBackgroundChange}
								/>
							</ProfilePictureSection>
						</FieldGroup>

						{/* Information/Bio */}
						<FieldGroup>
							<FieldTitle>Information</FieldTitle>
							<TextArea
								placeholder="Tell us a bit about yourself..."
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								maxLength={500}
							/>
							<MarkdownInfo>
								<Icon icon="mdiLanguageMarkdown" size="16px" />
								Descriptions support Markdown formatting,{" "}
								<MarkdownLink href="#" onClick={(e) => e.preventDefault()}>
									learn more here
								</MarkdownLink>
							</MarkdownInfo>
						</FieldGroup>
					</FormSection>
				</Section>

				{/* Save Button */}
				<SaveButton 
					palette="primary" 
					onClick={handleSave}
					disabled={loading}
				>
					{loading ? "Saving..." : "Save Changes"}
				</SaveButton>

				{/* Success Message */}
				{saved && (
					<div style={{
						background: "var(--success)",
						color: "white",
						padding: "12px 16px",
						borderRadius: "6px",
						textAlign: "center",
						fontWeight: "500"
					}}>
						Profile updated successfully! ✨
					</div>
				)}

				{/* Notice Bar */}
				<NoticeBar>
					<NoticeIcon>ℹ️</NoticeIcon>
					<NoticeText>
						Want to change your username?{" "}
						<NoticeLink href="#" onClick={(e) => e.preventDefault()}>
							Head over to your account settings.
						</NoticeLink>
					</NoticeText>
				</NoticeBar>
			</Content>
		</div>
	);
}

export default observer(ProfileSettingsPage);
