import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@hooks/useAppStore';
import { useMobile } from '@/contexts/MobileContext';
import Icon from '@components/Icon';

const NavigationContainer = styled.nav`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: var(--background-secondary);
	border-top: 1px solid var(--background-tertiary);
	z-index: 1000;
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 8px 0;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

	@media (min-width: 768px) {
		display: none;
	}
`;

const NavItem = styled.button<{ $active: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	color: ${props => props.$active ? 'var(--text-normal)' : 'var(--text-muted)'};
	padding: 8px;
	border-radius: 8px;
	min-width: 60px;
	transition: all 0.2s ease;
	cursor: pointer;

	&:hover {
		background: var(--background-tertiary);
		color: var(--text-normal);
	}

	&:active {
		transform: scale(0.95);
	}
`;

const NavIcon = styled.div`
	font-size: 20px;
	margin-bottom: 4px;
`;

const NavLabel = styled.span`
	font-size: 10px;
	font-weight: 500;
	text-align: center;
`;

const MobileNavigation: React.FC = () => {
	const { isMobile } = useMobile();
	const navigate = useNavigate();
	const location = useLocation();
	const app = useAppStore();

	if (!isMobile) return null;

	const navItems = [
		{
			label: 'Home',
			icon: 'mdiHome',
			path: '/channels/@me',
			active: location.pathname === '/channels/@me'
		},
		{
			label: 'Discovery',
			icon: 'mdiCompass',
			path: '/discovery',
			active: location.pathname === '/discovery'
		},
		{
			label: 'Friends',
			icon: 'mdiAccountGroup',
			path: '/friends',
			active: location.pathname.startsWith('/friends')
		},
		{
			label: 'Settings',
			icon: 'mdiCog',
			path: '/settings',
			active: location.pathname.startsWith('/settings')
		}
	];

	return (
		<NavigationContainer>
			{navItems.map((item) => (
				<NavItem
					key={item.path}
					$active={item.active}
					onClick={() => navigate(item.path)}
				>
					<NavIcon>
						<Icon icon={item.icon} />
					</NavIcon>
					<NavLabel>{item.label}</NavLabel>
				</NavItem>
			))}
		</NavigationContainer>
	);
};

export default MobileNavigation;
