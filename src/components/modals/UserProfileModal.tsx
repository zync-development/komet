import Avatar from "@components/Avatar";
import { HorizontalDivider } from "@components/Divider";
import useLogger from "@hooks/useLogger";
import { GuildMember, User } from "@structures";
import { REST, Snowflake } from "@utils";
import styled from "styled-components";
import { useAppStore } from "@hooks/useAppStore";
import { CDNRoutes, ImageFormat } from "@spacebarchat/spacebar-api-types/v9";
import dayjs from "dayjs";
import { modalController } from "@/controllers/modals";
import Button from "@components/Button";
import Icon from "@components/Icon";

const Backdrop = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 999;
`;

const Container = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: var(--background-secondary);
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	width: 400px;
	max-height: 600px;
	overflow: hidden;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	color: var(--text);
	z-index: 1000;
`;

const Top = styled.div`
	display: flex;
	flex-direction: column;
	position: relative;
	padding: 20px 20px 0 20px;
`;

const Banner = styled.div<{ hasBanner?: boolean }>`
	height: 120px;
	background: ${props => props.hasBanner 
		? `url(${props.hasBanner}) center/cover` 
		: 'var(--background-tertiary)'
	};
	border-radius: 8px 8px 0 0;
	margin: -20px -20px 0 -20px;
`;

const AvatarSection = styled.div`
	display: flex;
	align-items: flex-end;
	margin-top: -40px;
	position: relative;
	z-index: 1;
`;

const AvatarContainer = styled.div`
	position: relative;
	margin-right: 16px;
`;

const CrownIndicator = styled.div`
	position: absolute;
	top: -4px;
	right: -4px;
	width: 24px;
	height: 24px;
	background: linear-gradient(135deg, #ffd700, #ffed4e);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3px solid var(--background-secondary);
	box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
	z-index: 10;
`;

const UserInfo = styled.div`
	flex: 1;
	margin-bottom: 20px;
`;

const Username = styled.div`
	font-size: 24px;
	font-weight: 700;
	color: var(--text);
	margin-bottom: 4px;
`;

const UserTag = styled.div`
	font-size: 14px;
	color: var(--text-muted);
	margin-bottom: 8px;
`;

const Status = styled.div`
	font-size: 14px;
	color: var(--text-muted);
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 8px;
	margin-left: auto;
`;

const ActionButton = styled.button`
	width: 32px;
	height: 32px;
	border-radius: 4px;
	background: var(--background-tertiary);
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s ease;

	&:hover {
		background: var(--background-primary);
		color: var(--text);
	}
`;

const Content = styled.div`
	padding: 0 20px 20px 20px;
`;

const TabContainer = styled.div`
	display: flex;
	border-bottom: 1px solid var(--background-tertiary);
	margin-bottom: 20px;
`;

const Tab = styled.div<{ active?: boolean }>`
	padding: 12px 16px;
	color: ${props => props.active ? 'var(--text)' : 'var(--text-muted)'};
	font-weight: ${props => props.active ? '600' : '400'};
	cursor: pointer;
	border-bottom: 2px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
	transition: all 0.15s ease;

	&:hover {
		color: var(--text);
	}
`;

const InfoSection = styled.div`
	margin-bottom: 24px;
`;

const InfoHeader = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 8px;
`;

const InfoText = styled.div`
	font-size: 14px;
	color: var(--text);
	line-height: 1.4;
`;

interface Props {
	user: User;
	member?: GuildMember;
	onClose: () => void;
}

function UserProfileModal({ user, member, onClose }: Props) {
	const app = useAppStore();
	const logger = useLogger("UserProfileModal");

	const id = user.id;
	const { timestamp: createdAt } = Snowflake.deconstruct(id);
	const presence = app.presences.get(user.id);
	
	// Check if this user is the server owner
	const isOwner = member?.guild.ownerId === user.id;
	
	// Check if this is the current user's profile
	const isOwnProfile = app.account?.id === user.id;

	// Get banner from raw API data if available
	const banner = (user as any).raw?.banner;

	const handleAddFriend = () => {
		modalController.push({
			type: "add_friend",
		});
	};

	const handleEditProfile = () => {
		// TODO: Implement edit profile functionality
		logger.debug("Edit profile clicked");
	};

	const handleReportUser = () => {
		// TODO: Implement report user functionality
		logger.debug("Report user clicked");
	};

	return (
		<Backdrop onClick={onClose}>
			<Container onClick={(e) => e.stopPropagation()}>
				<Top>
					<Banner hasBanner={banner} />
					<AvatarSection>
						<AvatarContainer>
							<Avatar 
								user={user} 
								size={80} 
								presence={presence} 
								showPresence 
								onClick={null}
							/>
							{isOwner && (
								<CrownIndicator>
									<Icon icon="mdiCrown" size={14} color="#8B6914" />
								</CrownIndicator>
							)}
						</AvatarContainer>
						<UserInfo>
							<Username>{member?.nick ?? user.username}</Username>
							<UserTag>{user.username}#{user.discriminator}</UserTag>
							<Status>Hey!</Status>
						</UserInfo>
						<ActionButtons>
							<ActionButton onClick={handleEditProfile} title="Edit Profile">
								<Icon icon="mdiPencil" size={16} />
							</ActionButton>
							<ActionButton onClick={handleReportUser} title="Report User">
								<Icon icon="mdiFlag" size={16} />
							</ActionButton>
						</ActionButtons>
					</AvatarSection>
				</Top>
				
				<Content>
					<TabContainer>
						<Tab active>Profile</Tab>
					</TabContainer>
					
					<InfoSection>
						<InfoHeader>Information</InfoHeader>
						<InfoText>Just a normal person lol.</InfoText>
					</InfoSection>
				</Content>
			</Container>
		</Backdrop>
	);
}

export default UserProfileModal;
