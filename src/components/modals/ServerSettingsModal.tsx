import { ModalProps } from "@/controllers/modals";
import Icon from "@components/Icon";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Modal } from "./ModalComponents";

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 2rem;
`;

const Title = styled.h1`
	font-size: 2rem;
	font-weight: bold;
	color: var(--text);
	margin: 0;
`;

const ServerInfo = styled.div`
	background: var(--background-secondary);
	border-radius: 12px;
	padding: 1.5rem;
	margin-bottom: 2rem;
`;

const ServerName = styled.h2`
	font-size: 1.5rem;
	font-weight: bold;
	color: var(--text);
	margin: 0 0 1rem 0;
`;

const ServerDescription = styled.p`
	color: var(--text-muted);
	margin: 0 0 1rem 0;
	line-height: 1.5;
`;

const ServerStats = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 1rem;
	margin-top: 1rem;
`;

const StatItem = styled.div`
	text-align: center;
	padding: 1rem;
	background: var(--background-primary);
	border-radius: 8px;
`;

const StatValue = styled.div`
	font-size: 1.5rem;
	font-weight: bold;
	color: var(--text);
`;

const StatLabel = styled.div`
	font-size: 0.875rem;
	color: var(--text-muted);
	margin-top: 0.25rem;
`;

const SettingsSection = styled.div`
	margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
	font-size: 1.25rem;
	font-weight: bold;
	color: var(--text);
	margin: 0 0 1rem 0;
`;

const SettingItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem;
	background: var(--background-secondary);
	border-radius: 8px;
	margin-bottom: 0.5rem;
`;

const SettingLabel = styled.div`
	color: var(--text);
	font-weight: 500;
`;

const SettingValue = styled.div`
	color: var(--text-muted);
	font-size: 0.875rem;
`;

function ServerSettingsModal(props: ModalProps<"server_settings">) {
	const app = useAppStore();
	const { target: guild } = props;

	return (
		<Modal {...props} title="Server Settings" maxWidth="800px">
			<Header>
				<Title>Server Settings</Title>
			</Header>

			<ServerInfo>
				<ServerName>{guild.name}</ServerName>
				{guild.description && (
					<ServerDescription>{guild.description}</ServerDescription>
				)}
				<ServerStats>
					<StatItem>
						<StatValue>{guild.memberCount || "?"}</StatValue>
						<StatLabel>Members</StatLabel>
					</StatItem>
					<StatItem>
						<StatValue>{guild.channels?.length || "?"}</StatValue>
						<StatLabel>Channels</StatLabel>
					</StatItem>
					<StatItem>
						<StatValue>{guild.roles?.length || "?"}</StatValue>
						<StatLabel>Roles</StatLabel>
					</StatItem>
				</ServerStats>
			</ServerInfo>

			<SettingsSection>
				<SectionTitle>Server Information</SectionTitle>
				<SettingItem>
					<SettingLabel>Server ID</SettingLabel>
					<SettingValue>{guild.id}</SettingValue>
				</SettingItem>
				<SettingItem>
					<SettingLabel>Owner</SettingLabel>
					<SettingValue>{guild.ownerId}</SettingValue>
				</SettingItem>
				<SettingItem>
					<SettingLabel>Created</SettingLabel>
					<SettingValue>
						{new Date(guild.joinedAt).toLocaleDateString()}
					</SettingValue>
				</SettingItem>
			</SettingsSection>

			<SettingsSection>
				<SectionTitle>Features</SectionTitle>
				<SettingItem>
					<SettingLabel>Verification Level</SettingLabel>
					<SettingValue>{guild.verificationLevel || "None"}</SettingValue>
				</SettingItem>
				<SettingItem>
					<SettingLabel>Content Filter</SettingLabel>
					<SettingValue>{guild.explicitContentFilter || "Disabled"}</SettingValue>
				</SettingItem>
			</SettingsSection>

			<div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)" }}>
				<Icon icon="mdiCog" size="24px" style={{ marginBottom: "0.5rem" }} />
				<p>More server settings coming soon!</p>
			</div>
		</Modal>
	);
}

export default observer(ServerSettingsModal);
