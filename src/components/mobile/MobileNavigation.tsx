import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobile } from '@contexts/MobileContext';
import { useAppStore } from '@hooks/useAppStore';
import Icon from '@components/Icon';
import type { IconType } from '@components/Icon';

const NavigationContainer = styled.nav`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: var(--background-primary);
	border-top: 1px solid var(--background-tertiary);
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 12px 0 8px 0;
	z-index: 1000;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);

	@media (min-width: 768px) {
		display: none;
	}

	/* Mobile-specific adjustments */
	@media (max-width: 480px) {
		padding: 10px 0 6px 0;
	}
`;

const NavItem = styled.button<{ $active: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	color: ${props => props.$active ? 'var(--primary)' : 'var(--text-muted)'};
	padding: 8px 12px;
	border-radius: 12px;
	min-width: 64px;
	transition: all 0.2s ease;
	cursor: pointer;
	position: relative;
	flex: 1;
	max-width: 80px;

	&:hover {
		background: var(--background-secondary);
		color: ${props => props.$active ? 'var(--primary)' : 'var(--text-normal)'};
	}

	&:active {
		transform: scale(0.95);
		background: var(--background-tertiary);
	}

	${props => props.$active && `
		&::after {
			content: '';
			position: absolute;
			top: -6px;
			left: 50%;
			transform: translateX(-50%);
			width: 4px;
			height: 4px;
			background: var(--primary);
			border-radius: 50%;
		}
	`}

	/* Mobile touch feedback */
	@media (max-width: 480px) {
		padding: 6px 8px;
		min-width: 56px;
		max-width: 72px;
	}
`;

const NavIcon = styled.div`
	font-size: 20px;
	margin-bottom: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s ease;

	${NavItem}:active & {
		transform: scale(0.9);
	}

	@media (max-width: 480px) {
		font-size: 18px;
		margin-bottom: 3px;
	}
`;

const NavLabel = styled.span`
	font-size: 10px;
	font-weight: 500;
	text-align: center;
	line-height: 1.2;
	letter-spacing: 0.2px;
	transition: color 0.2s ease;

	@media (max-width: 480px) {
		font-size: 9px;
		font-weight: 400;
	}
`;

interface NavItem {
	label: string;
	icon: IconType;
	path: string;
	active: boolean;
}

const MobileNavigation: React.FC = () => {
	const { isMobile } = useMobile();
	const navigate = useNavigate();
	const location = useLocation();
	const app = useAppStore();

	if (!isMobile) return null;

	const navItems: NavItem[] = [
		{
			label: 'Servers',
			icon: 'mdiViewGrid',
			path: '/channels/@me',
			active: location.pathname === '/channels/@me'
		},
		{
			label: 'Friends',
			icon: 'mdiAccountGroup',
			path: '/friends',
			active: location.pathname.startsWith('/friends')
		},
		{
			label: 'Discover',
			icon: 'mdiCompass',
			path: '/discovery',
			active: location.pathname === '/discovery'
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
						<Icon icon={item.icon} size={20} />
					</NavIcon>
					<NavLabel>{item.label}</NavLabel>
				</NavItem>
			))}
		</NavigationContainer>
	);
};

export default MobileNavigation;
