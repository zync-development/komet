import PermissionsSettingsPage from "./SettingsPages/PermissionsSettingsPage";
import { ModalProps } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import styled from "styled-components";
import { Modal } from "./ModalComponents";

const Container = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
	background: var(--background-primary);
`;

const Sidebar = styled.div`
	width: 280px;
	background: var(--background-secondary);
	border-right: 1px solid rgba(255, 255, 255, 0.06);
	display: flex;
	flex-direction: column;
`;

const ChannelName = styled.div`
	padding: 24px 20px 20px 20px;
	font-size: 18px;
	font-weight: 700;
	color: var(--text);
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
`;

const NavSection = styled.div`
	margin-top: 16px;
`;

const NavSectionHeader = styled.div`
	padding: 12px 20px 8px 20px;
	font-size: 11px;
	font-weight: 700;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 1px;
`;

const NavItem = styled.div<{ active?: boolean }>`
	display: flex;
	align-items: center;
	padding: 12px 20px;
	margin: 4px 12px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.15s ease;
	color: var(--text);
	background: ${props => props.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
	font-weight: ${props => props.active ? '600' : '500'};

	&:hover {
		background: ${props => props.active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
		transform: translateX(2px);
	}
`;

const Content = styled.div`
	flex: 1;
	background: var(--background-primary);
	overflow-y: auto;
	padding: 32px;
`;

const ContentHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 32px;
	padding-bottom: 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const ContentTitle = styled.h1`
	margin: 0;
	font-size: 28px;
	font-weight: 700;
	color: var(--text);
`;

const ContentDescription = styled.p`
	margin: 8px 0 0 0;
	font-size: 16px;
	color: var(--text-secondary);
	line-height: 1.5;
`;

type SettingsSection = 'overview' | 'permissions';

interface ChannelSettingsModalProps extends ModalProps<"channel_settings"> {

}

function ChannelSettingsModal(props: ChannelSettingsModalProps) {
	const app = useAppStore();
	const { target: channel } = props;
	const [activeSection, setActiveSection] = useState<SettingsSection>('overview');

	if (!channel) return null;

	const renderOverview = () => (
		<>
			<ContentHeader>
				<div>
					<ContentTitle>Overview</ContentTitle>
					<ContentDescription>General settings for this channel.</ContentDescription>
				</div>
			</ContentHeader>
			<div>
				{/* Channel settings form will go here */}
				Overview content for {channel.name}
			</div>
		</>
	);

	const renderPermissions = () => <PermissionsSettingsPage channel={channel} />;

	return (
		<Modal title={`Channel Settings - ${channel.name}`} onClose={props.onClose}>
			<Container>
				<Sidebar>
					<ChannelName>{channel.name}</ChannelName>
					<NavSection>
						<NavSectionHeader>Channel Settings</NavSectionHeader>
						<NavItem
							active={activeSection === 'overview'}
							onClick={() => setActiveSection('overview')}
						>
							Overview
						</NavItem>
						<NavItem
							active={activeSection === 'permissions'}
							onClick={() => setActiveSection('permissions')}
						>
							Permissions
						</NavItem>
					</NavSection>
				</Sidebar>
				<Content>
					{activeSection === 'overview' && renderOverview()}
					{activeSection === 'permissions' && renderPermissions()}
				</Content>
			</Container>
		</Modal>
	);
}

export default observer(ChannelSettingsModal);
