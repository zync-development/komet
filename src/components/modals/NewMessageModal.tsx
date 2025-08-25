import { useState } from "react";
import styled from "styled-components";
import { useAppStore } from "@hooks/useAppStore";
import { modalController } from "@/controllers/modals";
import Icon from "@components/Icon";
import { ChannelType, CDNRoutes, ImageFormat, type APIUser, type APIChannel } from "@spacebarchat/spacebar-api-types/v9";
import { REST } from "@utils";

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const ModalContainer = styled.div`
	background: var(--background-primary);
	border-radius: 12px;
	padding: 24px;
	width: 90%;
	max-width: 480px;
	max-height: 80vh;
	overflow-y: auto;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	border: 1px solid var(--background-tertiary);
`;

const ModalHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
	font-size: 20px;
	font-weight: 600;
	color: var(--text);
	margin: 0;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	padding: 8px;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-secondary);
		color: var(--text);
	}
`;

const SearchContainer = styled.div`
	margin-bottom: 24px;
`;

const SearchInput = styled.input`
	width: 100%;
	padding: 12px 16px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	border-radius: 8px;
	color: var(--text);
	font-size: 14px;
	outline: none;
	transition: all 0.2s ease;

	&::placeholder {
		color: var(--text-muted);
	}

	&:focus {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
	}
`;

const UserList = styled.div`
	max-height: 300px;
	overflow-y: auto;
`;

const UserItem = styled.div`
	display: flex;
	align-items: center;
	padding: 12px;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
	margin-bottom: 4px;

	&:hover {
		background: var(--background-secondary);
	}
`;

const UserAvatar = styled.div<{ hasAvatar?: boolean }>`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: ${props => props.hasAvatar ? 'transparent' : 'var(--primary)'};
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
	color: white;
	font-weight: 600;
	font-size: 14px;
	overflow: hidden;
	
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

const UserInfo = styled.div`
	flex: 1;
`;

const Username = styled.div`
	font-weight: 500;
	color: var(--text);
	font-size: 14px;
`;

const UserStatus = styled.div`
	font-size: 12px;
	color: var(--text-muted);
	margin-top: 2px;
`;

const GuildName = styled.div`
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 1px;
	opacity: 0.8;
`;

const MessageButton = styled.button`
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 6px;
	padding: 8px 16px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;

	&:hover {
		background: var(--primary-hover);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
	}
`;

const NoResults = styled.div`
	text-align: center;
	padding: 24px;
	color: var(--text-muted);
	font-size: 14px;
`;

const LoadingSpinner = styled.div`
	text-align: center;
	padding: 24px;
	color: var(--text-muted);
	font-size: 14px;
`;

interface Props {
	onClose: () => void;
}

function NewMessageModal({ onClose }: Props) {
	const app = useAppStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Real user search function that searches through API and local stores
	const searchUsers = async (query: string) => {
		if (!query.trim()) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		
		// Small delay to prevent excessive searching while typing
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const searchQuery = query.toLowerCase();
		const results: any[] = [];
		
		try {
			// First, try to search via API for users not in local stores
			const apiResponse = await app.rest.get<{users: APIUser[], total_results: number}>(`/api/v9/users/search?q=${encodeURIComponent(query)}&limit=20`);
			if (apiResponse && apiResponse.users) {
				apiResponse.users.forEach((user: APIUser) => {
					// Add API results to local store for future use
					if (app.users && !app.users.has(user.id)) {
						app.users.add(user);
					}
					
					results.push({
						id: user.id,
						username: user.username,
						nickname: undefined, // API users don't have nicknames
						status: "Online",
						avatar: user.avatar,
						discriminator: user.discriminator
					});
				});
			}
		} catch (error) {
			console.log("API search failed, falling back to local search:", error);
		}
		
		// Also search through local stores for users already loaded
		if (app.users && app.users.all) {
			app.users.all.forEach(user => {
				if ((user.username.toLowerCase().includes(searchQuery) || 
					 user.discriminator.includes(searchQuery)) && 
					user.id !== app.account?.id &&
					!results.some(r => r.id === user.id)) {
					results.push({
						id: user.id,
						username: user.username,
						nickname: undefined,
						status: "Online",
						avatar: user.avatar,
						discriminator: user.discriminator
					});
				}
			});
		}
		
		// Search through guild members for nicknames and guild context
		if (app.guilds && app.guilds.all) {
			app.guilds.all.forEach(guild => {
				if (guild && guild.members && guild.members.asList) {
					const guildMembers = guild.members.asList();
					guildMembers.forEach((member: any) => {
						if (member.user && 
							(member.user.username.toLowerCase().includes(searchQuery) || 
							 member.user.discriminator.includes(searchQuery) ||
							 (member.nick && member.nick.toLowerCase().includes(searchQuery))) && 
							member.user.id !== app.account?.id &&
							!results.some(r => r.id === member.user.id)) {
							results.push({
								id: member.user.id,
								username: member.user.username,
								nickname: member.nick,
								status: "Online",
								avatar: member.user.avatar,
								discriminator: member.user.discriminator,
								guildName: guild.name
							});
						}
					});
				}
			});
		}
		
		// Limit results to prevent overwhelming the UI
		const limitedResults = results.slice(0, 20);
		
		setSearchResults(limitedResults);
		setIsSearching(false);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		searchUsers(query);
	};

	const startDM = async (userId: string) => {
		try {
			// Create DM channel via API
			const response = await app.rest.post<{recipients: string[]}, APIChannel>("/api/v9/users/@me/channels", {
				recipients: [userId]
			});
			
			if (response && response.id) {
				// Add the new DM channel to the private channels store
				if (app.privateChannels) {
					app.privateChannels.add(response);
				}
				
				// Close the modal
				onClose();
				
				// TODO: Navigate to the new DM channel
				console.log("Created DM channel:", response);
			}
		} catch (error) {
			console.error("Failed to start DM:", error);
			// TODO: Show error message to user
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && searchQuery.trim()) {
			searchUsers(searchQuery);
		}
	};

	return (
		<ModalOverlay onClick={onClose}>
			<ModalContainer onClick={(e) => e.stopPropagation()}>
				<ModalHeader>
					<ModalTitle>New Message</ModalTitle>
					<CloseButton onClick={onClose}>
						<Icon icon="mdiClose" size="20px" />
					</CloseButton>
				</ModalHeader>

				<SearchContainer>
					<SearchInput
						type="text"
						placeholder="Search for a user..."
						value={searchQuery}
						onChange={handleSearchChange}
						onKeyPress={handleKeyPress}
						autoFocus
					/>
				</SearchContainer>

				<UserList>
					{isSearching ? (
						<LoadingSpinner>Searching...</LoadingSpinner>
					) : searchResults.length > 0 ? (
						searchResults.map((user) => (
							<UserItem key={user.id}>
								<UserAvatar hasAvatar={!!user.avatar}>
									{user.avatar ? (
										<img 
											src={REST.makeCDNUrl(CDNRoutes.userAvatar(user.id, user.avatar, ImageFormat.PNG))}
											alt={user.username}
											onError={(e) => {
												// Fallback to initials if avatar fails to load
												const target = e.target as HTMLImageElement;
												target.style.display = 'none';
												const parent = target.parentElement;
												if (parent) {
													parent.textContent = user.username.charAt(0).toUpperCase();
												}
											}}
										/>
									) : (
										user.username.charAt(0).toUpperCase()
									)}
								</UserAvatar>
								<UserInfo>
									<Username>
										{user.nickname ? (
											<>
												{user.nickname} <span style={{ opacity: 0.7 }}>({user.username}#{user.discriminator})</span>
											</>
										) : (
											`${user.username}#${user.discriminator}`
										)}
									</Username>
									<UserStatus>{user.status}</UserStatus>
									{user.guildName && <GuildName>in {user.guildName}</GuildName>}
								</UserInfo>
								<MessageButton onClick={() => startDM(user.id)}>
									Message
								</MessageButton>
							</UserItem>
						))
					) : searchQuery.trim() ? (
						<NoResults>
							No users found matching "{searchQuery}"
							<br />
							<small style={{ opacity: 0.7 }}>
								Try searching for a different username or check if the user is in your current server
							</small>
						</NoResults>
					) : (
						<NoResults>
							Search for a user to start a conversation
							<br />
							<small style={{ opacity: 0.7 }}>
								You can search for users by their username
							</small>
						</NoResults>
					)}
				</UserList>
			</ModalContainer>
		</ModalOverlay>
	);
}

export default NewMessageModal;
