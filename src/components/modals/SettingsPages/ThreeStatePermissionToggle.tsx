import React from "react";
import styled from "styled-components";
import Icon from "@components/Icon";

const ToggleContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	user-select: none;
`;

const ToggleButton = styled.div<{ state: 'allow' | 'deny' | 'neutral' }>`
	width: 24px;
	height: 24px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.15s ease;

	${props => props.state === 'allow' && `
		background-color: var(--success);
		color: white;
	`}

	${props => props.state === 'deny' && `
		background-color: var(--error);
		color: white;
	`}

	${props => props.state === 'neutral' && `
		background-color: var(--background-tertiary);
		color: var(--text-secondary);
	`}
`;

interface ThreeStatePermissionToggleProps {
	permissionName: string;
	currentState: 'allow' | 'deny' | 'neutral';
	onToggle: (newState: 'allow' | 'deny' | 'neutral') => void;
}

function ThreeStatePermissionToggle({
	permissionName,
	currentState,
	onToggle,
}: ThreeStatePermissionToggleProps) {
	const handleClick = () => {
		let newState: 'allow' | 'deny' | 'neutral';
		switch (currentState) {
			case 'neutral':
				newState = 'allow';
				break;
			case 'allow':
				newState = 'deny';
				break;
			case 'deny':
				newState = 'neutral';
				break;
		}
		onToggle(newState);
	};

	const getIcon = () => {
		switch (currentState) {
			case 'allow':
				return "mdiCheck";
			case 'deny':
				return "mdiClose";
			case 'neutral':
				return "mdiMinus";
		}
	};

	return (
		<ToggleContainer onClick={handleClick}>
			<ToggleButton state={currentState}>
				<Icon icon={getIcon()} size="16px" />
			</ToggleButton>
			<span>{permissionName}</span>
		</ToggleContainer>
	);
}

export default ThreeStatePermissionToggle;
