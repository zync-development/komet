import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Icon from "@components/Icon";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 2rem;
	background: var(--background-primary);
	color: white;
	position: relative;
`;

const BackButton = styled.button`
	position: absolute;
	top: 2rem;
	left: 2rem;
	background: var(--background-secondary);
	border: 1px solid var(--background-secondary-alt);
	border-radius: 8px;
	padding: 12px 16px;
	color: white;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;

	&:hover {
		background: var(--background-secondary-highlight);
		border-color: var(--background-secondary-highlight);
	}

	&:active {
		background: var(--background-secondary-alt);
	}
`;

const Header = styled.h1`
	font-size: 2.5rem;
	font-weight: bold;
	margin: 0 0 1rem 0;
	color: var(--text);
	text-align: center;
`;

const Instructions = styled.p`
	font-size: 1.1rem;
	color: var(--text-secondary);
	margin: 0 0 2rem 0;
	text-align: center;
	max-width: 500px;
	line-height: 1.5;
`;

const InputContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	max-width: 600px;
	width: 100%;
	margin-bottom: 2rem;
`;

const Input = styled.input`
	flex: 1;
	background: var(--background-secondary);
	border: 1px solid var(--primary);
	border-radius: 8px;
	padding: 16px 20px;
	font-size: 16px;
	color: white;
	outline: none;
	transition: all 0.2s ease;

	&::placeholder {
		color: var(--text-muted);
	}

	&:focus {
		border-color: var(--primary-light);
		box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
	}
`;

const SendButton = styled.button`
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 8px;
	padding: 16px 24px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;

	&:hover {
		background: var(--primary-light);
		transform: translateY(-1px);
	}

	&:active {
		background: var(--primary-dark);
		transform: translateY(0);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
		transform: none;
	}
`;

const CharacterContainer = styled.div`
	position: absolute;
	top: 2rem;
	right: 2rem;
	width: 120px;
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Character = styled.div`
	width: 100px;
	height: 100px;
	background: var(--primary);
	border-radius: 50%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	
	&::before {
		content: '';
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 20px;
		height: 20px;
		background: var(--success);
		border-radius: 50%;
	}
	
	&::after {
		content: '👋';
		font-size: 40px;
	}
`;

function FriendsPage() {
	const [username, setUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("/channels/@me");
	};

	const handleSendRequest = async () => {
		if (!username.trim()) return;
		
		setIsLoading(true);
		
		// TODO: Implement actual friend request logic
		console.log("Sending friend request to:", username);
		
		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			setUsername("");
			// TODO: Show success/error message
		}, 1000);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && username.trim() && !isLoading) {
			handleSendRequest();
		}
	};

	return (
		<Container>
			<BackButton onClick={handleBack}>
				<Icon icon="mdiArrowLeft" size="16px" />
				Back
			</BackButton>
			
			<CharacterContainer>
				<Character />
			</CharacterContainer>
			
			<Header>Add Friend</Header>
			<Instructions>
				You can add friends with their Discord username.
			</Instructions>
			
			<InputContainer>
				<Input
					type="text"
					placeholder="You can add friends with their Discord username."
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					onKeyPress={handleKeyPress}
					disabled={isLoading}
				/>
				<SendButton
					onClick={handleSendRequest}
					disabled={!username.trim() || isLoading}
				>
					{isLoading ? "Sending..." : "Send Friend Request"}
				</SendButton>
			</InputContainer>
		</Container>
	);
}

export default FriendsPage;
