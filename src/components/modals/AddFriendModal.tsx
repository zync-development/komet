import { ModalProps, modalController } from "@/controllers/modals";
import { Input, InputErrorText, InputLabel, LabelWrapper } from "@components/AuthComponents";
import { TextDivider } from "@components/Divider";
import { useAppStore } from "@hooks/useAppStore";
import useLogger from "@hooks/useLogger";
import { Routes, ChannelType, APIRelationshipType } from "@spacebarchat/spacebar-api-types/v9";
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

const StatusBadge = styled.div<{ type: 'success' | 'warning' | 'error' }>`
	background: ${props => {
		switch (props.type) {
			case 'success': return 'var(--success)';
			case 'warning': return 'var(--warning)';
			case 'error': return 'var(--error)';
			default: return 'var(--background-tertiary)';
		}
	}};
	color: white;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 11px;
	font-weight: 500;
	margin-left: 8px;
`;

type FormValues = {
	username: string;
	discriminator: string;
};

interface UserSearchResult {
	id: string;
	username: string;
	discriminator: string;
	avatar?: string | null;
}

interface UserSearchResponse {
	users: Array<{
		id: string;
		username: string;
		discriminator: string;
		avatar?: string | null;
	}>;
	total_results: number;
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
	const [isSendingRequest, setIsSendingRequest] = React.useState(false);
	const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

	const username = watch("username");
	const discriminator = watch("discriminator");

	// Search for users when username changes
	React.useEffect(() => {
		if (!username || username.length < 3) {
			setSearchResults([]);
			return;
		}

		const searchUsers = async () => {
			setIsSearching(true);
			try {
				// First, search through users we already know about (from guilds, etc.)
				const knownUsers = app.users.all.filter(user => 
					user.username.toLowerCase().includes(username.toLowerCase()) ||
					`${user.username}#${user.discriminator}`.toLowerCase().includes(username.toLowerCase())
				);

				// If no known users found, try to search the backend API
				if (knownUsers.length === 0) {
					try {
						logger.debug("Searching backend API for users");
						const apiResponse = await app.rest.get<UserSearchResponse>(`/api/v9/users/search?q=${encodeURIComponent(username)}&limit=20`);
						
						if (apiResponse && apiResponse.users) {
							// Filter results to match the username more closely
							const apiUsers = apiResponse.users.filter(user => 
								user.username.toLowerCase().includes(username.toLowerCase()) ||
								`${user.username}#${user.discriminator}`.toLowerCase().includes(username.toLowerCase())
							);
							
							// Add API users to local store if they don't exist
							apiUsers.forEach(user => {
								if (!app.users.has(user.id)) {
									app.users.add({
										...user,
										avatar: user.avatar || null
									});
								}
							});
							
							// Use API results
							setSearchResults(apiUsers.map(user => ({
								id: user.id,
								username: user.username,
								discriminator: user.discriminator,
								avatar: user.avatar,
							})));
							return;
						}
					} catch (error) {
						logger.debug("Backend search failed, falling back to known users only:", error);
					}
				}

				// Fallback to known users
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
	}, [username, app.users.count]);

	const sendFriendRequest = async (user: UserSearchResult) => {
		setIsSendingRequest(true);
		try {
			await app.relationships.sendFriendRequest(user.username, user.discriminator);
			setSuccessMessage(`Friend request sent to ${user.username}#${user.discriminator}!`);
			
			// Reset form after successful request
			reset();
			setSelectedUser(null);
			setSearchResults([]);
			
			// Auto-close after 2 seconds
			setTimeout(() => {
				modalController.closeAll();
			}, 2000);
		} catch (error: any) {
			logger.error("Error sending friend request:", error);
			
			// Handle specific error cases
			if (error.message?.includes("already friends")) {
				setError("username", {
					type: "manual",
					message: "You are already friends with this user.",
				});
			} else if (error.message?.includes("already sent")) {
				setError("username", {
					type: "manual",
					message: "You already sent a friend request to this user.",
				});
			} else if (error.message?.includes("blocked")) {
				setError("username", {
					type: "manual",
					message: "This user has blocked you.",
				});
			} else if (error.message?.includes("not found")) {
				setError("username", {
					type: "manual",
					message: "User not found. Please check the username and discriminator.",
				});
			} else {
				setError("username", {
					type: "manual",
					message: "Failed to send friend request. Please try again.",
				});
			}
		} finally {
			setIsSendingRequest(false);
		}
	};

	const onSubmit = handleSubmit((data) => {
		if (selectedUser) {
			sendFriendRequest(selectedUser);
		} else if (searchResults.length > 0) {
			// Auto-select first result
			sendFriendRequest(searchResults[0]);
		} else if (data.username && data.discriminator) {
			// Try to send request to username#discriminator format
			sendFriendRequest({
				id: '', // Will be set by the server
				username: data.username,
				discriminator: data.discriminator,
			});
		} else {
			setError("username", {
				type: "manual",
				message: "Please enter a username and discriminator.",
			});
		}
	});

	const getRelationshipStatus = (user: UserSearchResult) => {
		if (app.relationships.isFriend(user.id)) {
			return { type: 'success' as const, text: 'Friends' };
		} else if (app.relationships.hasIncomingRequest(user.id)) {
			return { type: 'warning' as const, text: 'Incoming Request' };
		} else if (app.relationships.hasOutgoingRequest(user.id)) {
			return { type: 'warning' as const, text: 'Request Sent' };
		} else if (app.relationships.isBlocked(user.id)) {
			return { type: 'error' as const, text: 'Blocked' };
		}
		return null;
	};

	return (
		<Modal
			{...props}
			onClose={() => modalController.closeAll()}
			title="Add Friend"
			description="Search for users by username to send them a friend request."
			actions={[
				{
					onClick: onSubmit,
					children: <span>{selectedUser ? "Send Request" : "Send Request"}</span>,
					palette: "primary",
					confirmation: true,
					disabled: isLoading || isSearching || isSendingRequest || (!selectedUser && searchResults.length === 0 && (!username || !discriminator)),
				},
				{
					onClick: () => modalController.pop("close"),
					children: <span>Cancel</span>,
					palette: "link",
					disabled: isLoading || isSendingRequest,
				},
			]}
		>
			{successMessage && (
				<div style={{ 
					background: 'var(--success)', 
					color: 'white', 
					padding: '12px', 
					borderRadius: '6px', 
					marginBottom: '16px',
					textAlign: 'center'
				}}>
					{successMessage}
				</div>
			)}

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
						placeholder="Enter username"
						type="text"
						maxLength={32}
						required
						error={!!errors.username}
						disabled={isLoading || isSendingRequest}
						autoFocus
					/>
				</FriendInputContainer>

				<FriendInputContainer style={{ marginTop: '16px' }}>
					<LabelWrapper error={!!errors.discriminator}>
						<InputLabel>Discriminator</InputLabel>
						{errors.discriminator && (
							<InputErrorText>
								<>
									<TextDivider>-</TextDivider>
									{errors.discriminator.message}
								</>
							</InputErrorText>
						)}
					</LabelWrapper>
					<Input
						{...register("discriminator", { 
							required: "Discriminator is required",
							pattern: {
								value: /^\d{4}$/,
								message: "Discriminator must be 4 digits"
							}
						})}
						placeholder="0000"
						type="text"
						maxLength={4}
						required
						error={!!errors.discriminator}
						disabled={isLoading || isSendingRequest}
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
						{searchResults.map((user) => {
							const status = getRelationshipStatus(user);
							return (
								<UserResult
									key={user.id}
									onClick={() => setSelectedUser(user)}
									style={{
										border: selectedUser?.id === user.id ? "2px solid var(--brand)" : undefined,
									}}
								>
									<UserAvatar avatar={user.avatar} />
									<UserInfo>
										<Username>
											{user.username}#{user.discriminator}
											{status && (
												<StatusBadge type={status.type}>
													{status.text}
												</StatusBadge>
											)}
										</Username>
										<UserId>ID: {user.id}</UserId>
									</UserInfo>
									<ActionButton
										onClick={(e) => {
											e.stopPropagation();
											sendFriendRequest(user);
										}}
										disabled={isSendingRequest || status?.type === 'success' || status?.type === 'warning'}
									>
										{isSendingRequest ? "Sending..." : 
										 status?.type === 'success' ? "Friends" :
										 status?.type === 'warning' ? "Request Sent" :
										 "Add Friend"}
									</ActionButton>
								</UserResult>
							);
						})}
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
