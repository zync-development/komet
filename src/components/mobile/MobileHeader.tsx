import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@hooks/useAppStore';
import { useMobile } from '@/contexts/MobileContext';
import Icon from '@components/Icon';
import Button from '@components/Button';

const HeaderContainer = styled.header`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	background: var(--background-primary);
	border-bottom: 1px solid var(--background-tertiary);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

	@media (min-width: 768px) {
		display: none;
	}
`;

const LeftSection = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const RightSection = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const BackButton = styled.button`
	background: none;
	border: none;
	color: var(--text-normal);
	padding: 8px;
	border-radius: 6px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s ease;

	&:hover {
		background: var(--background-secondary);
	}

	&:active {
		transform: scale(0.95);
	}
`;

const Title = styled.h1`
	font-size: 18px;
	font-weight: 600;
	color: var(--text-normal);
	margin: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 200px;
`;

const ActionButton = styled.button`
	background: none;
	border: none;
	color: var(--text-normal);
	padding: 8px;
	border-radius: 6px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s ease;

	&:hover {
		background: var(--background-secondary);
	}

	&:active {
		transform: scale(0.95);
	}
`;

const MobileHeader: React.FC = () => {
	const { isMobile } = useMobile();
	const navigate = useNavigate();
	const location = useLocation();
	const app = useAppStore();

	if (!isMobile) return null;

	const getTitle = () => {
		if (location.pathname === '/channels/@me') return 'Home';
		if (location.pathname.startsWith('/channels/')) {
			const guildId = location.pathname.split('/')[2];
			if (guildId === '@me') return 'Direct Messages';
			const guild = app.guilds.get(guildId);
			return guild?.name || 'Server';
		}
		if (location.pathname.startsWith('/settings')) return 'Settings';
		if (location.pathname.startsWith('/friends')) return 'Friends';
		return 'Komet';
	};

	const canGoBack = () => {
		return location.pathname !== '/channels/@me';
	};

	const handleBack = () => {
		if (canGoBack()) {
			navigate('/channels/@me');
		}
	};

	return (
		<HeaderContainer>
			<LeftSection>
				{canGoBack() && (
					<BackButton onClick={handleBack}>
						<Icon icon="mdiArrowLeft" size="20px" />
					</BackButton>
				)}
				<Title>{getTitle()}</Title>
			</LeftSection>
			<RightSection>
				<ActionButton onClick={() => navigate('/settings')}>
					<Icon icon="mdiCog" size="20px" />
				</ActionButton>
			</RightSection>
		</HeaderContainer>
	);
};

export default MobileHeader;
