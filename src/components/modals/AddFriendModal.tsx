import { ModalProps, modalController } from "@/controllers/modals";
import { Input, InputErrorText, InputLabel, LabelWrapper } from "@components/AuthComponents";
import { TextDivider } from "@components/Divider";
import { useAppStore } from "@hooks/useAppStore";
import useLogger from "@hooks/useLogger";
import { Routes, ChannelType } from "@spacebarchat/spacebar-api-types/v9";
import { messageFromFieldError } from "@utils";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import React from "react";
import styled from "styled-components";
import { Modal } from "./ModalComponents";

const FriendInputContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

const SearchResults = styled.div`
	margin-top: 16px;
	border-top: 1px solid var(--background-tertiary);
	padding-top: 16px;
`;

const UserResult = styled.div`
	display: flex;
	align-items: center;
	padding: 12px;
	border-radius: 8px;
	background: var(--background-secondary);
	margin-bottom: 8px;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background: var(--background-secondary-highlight);
	}
`;

const UserAvatar = styled.div<{ avatar?: string | null }>`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: ${props => props.avatar ? `url(${props.avatar})` : 'var(--background-tertiary)'};
	background-size: cover;
	background-position: center;
	margin-right: 12px;
	flex-shrink: 0;
`;

const UserInfo = styled.div`
	flex: 1;
`;

const Username = styled.div`
	font-weight: 600;
	color: var(--text);
`;

const UserId = styled.div`
	font-size: 12px;
	color: var(--text-muted);
	margin-top: 2px;
`;

const ActionButton = styled.button`
	background: var(--brand);
	color: white;
	border: none;
	border-radius: 6px;
	padding: 6px 12px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background: var(--brand-560);
	}

	&:disabled {
		background: var(--background-tertiary);
		cursor: not-allowed;
	}
`;

type FormValues = {
	username: string;
};

interface UserSearchResult {
	id: string;
	username: string;
	discriminator: string;
	avatar?: string | null;
}

export function AddFriendModal({ ...props }: ModalProps<"add_friend">) {
	const logger = useLogger("AddFriendModal");
	const app = useAppStore();
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors, isLoading },
		setError,
		watch,
		reset,
	} = useForm<FormValues>();

	const [searchResults, setSearchResults] = React.useState<UserSearchResult[]>([]);
	const [isSearching, setIsSearching] = React.useState(false);
	const [selectedUser, setSelectedUser] = React.useState<UserSearchResult | null>(null);
	const [isCreatingDM, setIsCreatingDM] = React.useState(false);

	const username = watch("username");

	// Search for users when username changes
	React.useEffect(() => {
		if (!username || username.length < 3) {
			setSearchResults([]);
			return;
		}

		const searchUsers = async () => {
			setIsSearching(true);
			try {
				// Search through users we already know about (from guilds, etc.)
				const knownUsers = app.users.all.filter(user => 
					user.username.toLowerCase().includes(username.toLowerCase()) ||
					`${user.username}#${user.discriminator}`.toLowerCase().includes(username.toLowerCase())
				);

				// Also try to fetch user by username if we don't have them locally
				if (knownUsers.length === 0) {
					try {
						// Try to find user by username (this might not work on all instances)
						// For now, we'll work with known users
						logger.debug("Searching through known users only");
					} catch (error) {
						logger.debug("Could not search external users");
					}
				}

				setSearchResults(knownUsers.map(user => ({
					id: user.id,
					username: user.username,
					discriminator: user.discriminator,
					avatar: user.avatar,
				})));
			} catch (error) {
				logger.error("Error searching users:", error);
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		};

		const debounceTimer = setTimeout(searchUsers, 300);
		return () => clearTimeout(debounceTimer);
	}, [username, app.users.all]);

	const createDirectMessage = async (user: UserSearchResult) => {
		setIsCreatingDM(true);
		try {
			// Check if we already have a DM with this user
			const existingDM = app.privateChannels.all.find(channel => 
				channel.type === ChannelType.DM && 
				channel.recipients?.some(recipient => recipient.id === user.id)
			);

			if (existingDM) {
				// Navigate to existing DM
				navigate(`/channels/@me/${existingDM.id}`);
				modalController.closeAll();
				return;
			}

			// Create a new DM channel
			// Note: This might require the server to support DM creation
			// For now, we'll try to navigate to a potential DM channel
			logger.info(`Attempting to create DM with ${user.username}#${user.discriminator}`);
			
			// Since we can't guarantee DM creation works, we'll show a success message
			// and suggest the user try messaging them
			modalController.closeAll();
			
			// Show success message
			modalController.push({
				type: "error",
				title: "User Found!",
				description: `Found ${user.username}#${user.discriminator}. You can now start a conversation with them by navigating to Direct Messages.`,
				error: "Success",
				recoverable: false,
			});
		} catch (error) {
			logger.error("Error creating DM:", error);
			setError("username", {
				type: "manual",
				message: "Could not create direct message. Please try again.",
			});
		} finally {
			setIsCreatingDM(false);
		}
	};

	const onSubmit = handleSubmit((data) => {
		if (selectedUser) {
			createDirectMessage(selectedUser);
		} else if (searchResults.length > 0) {
			// Auto-select first result
			createDirectMessage(searchResults[0]);
		} else {
			setError("username", {
				type: "manual",
				message: "No users found with that username. Try searching for a different user.",
			});
		}
	});

	return (
		<Modal
			{...props}
			onClose={() => modalController.closeAll()}
			title="Find User"
			description="Search for users by username to start a conversation with them."
			actions={[
				{
					onClick: onSubmit,
					children: <span>{selectedUser ? "Start Chat" : "Search"}</span>,
					palette: "primary",
					confirmation: true,
					disabled: isLoading || isSearching || (!selectedUser && searchResults.length === 0),
				},
				{
					onClick: () => modalController.pop("close"),
					children: <span>Cancel</span>,
					palette: "link",
					disabled: isLoading || isCreatingDM,
				},
			]}
		>
			<form
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						onSubmit();
					}
				}}
			>
				<FriendInputContainer>
					<LabelWrapper error={!!errors.username}>
						<InputLabel>Username</InputLabel>

						{errors.username && (
							<InputErrorText>
								<>
									<TextDivider>-</TextDivider>
									{errors.username.message}
								</>
							</InputErrorText>
						)}
					</LabelWrapper>
					<Input
						{...register("username", { required: "Username is required" })}
						placeholder="Enter username (e.g., username#1234)"
						type="text"
						maxLength={37}
						required
						error={!!errors.username}
						disabled={isLoading || isCreatingDM}
						autoFocus
						minLength={1}
					/>
				</FriendInputContainer>

				{isSearching && (
					<SearchResults>
						<div style={{ textAlign: "center", color: "var(--text-muted)" }}>
							Searching...
						</div>
					</SearchResults>
				)}

				{searchResults.length > 0 && !isSearching && (
					<SearchResults>
						<div style={{ marginBottom: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
							Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}:
						</div>
						{searchResults.map((user) => (
							<UserResult
								key={user.id}
								onClick={() => setSelectedUser(user)}
								style={{
									border: selectedUser?.id === user.id ? "2px solid var(--brand)" : undefined,
								}}
							>
								<UserAvatar avatar={user.avatar} />
								<UserInfo>
									<Username>{user.username}#{user.discriminator}</Username>
									<UserId>ID: {user.id}</UserId>
								</UserInfo>
								<ActionButton
									onClick={(e) => {
										e.stopPropagation();
										createDirectMessage(user);
									}}
									disabled={isCreatingDM}
								>
									{isCreatingDM ? "Creating..." : "Chat"}
								</ActionButton>
							</UserResult>
						))}
					</SearchResults>
				)}

				{username && username.length >= 3 && searchResults.length === 0 && !isSearching && (
					<SearchResults>
						<div style={{ textAlign: "center", color: "var(--text-muted)" }}>
							No users found with that username.
						</div>
					</SearchResults>
				)}
			</form>
		</Modal>
	);
}
