import React from "react";
import styled from "styled-components";
import { useAppStore } from "@hooks/useAppStore";
import { modalController } from "@/controllers/modals";
import { CDNRoutes, ImageFormat } from "@spacebarchat/spacebar-api-types/v9";
import { REST } from "@utils";
import Icon from "./Icon";

const FriendsContainer = styled.div`
	padding: 16px;
`;

const FriendsHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
`;

const FriendsTitle = styled.h3`
	font-size: 16px;
	font-weight: 600;
	color: var(--text);
	margin: 0;
`;

const AddFriendButton = styled.button`
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 6px;
	padding: 8px 16px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 8px;

	&:hover {
		background: var(--primary-hover);
	}
`;

const FriendsListContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const FriendItem = styled.div`
	display: flex;
	align-items: center;
	padding: 12px;
	border-radius: 8px;
	background: var(--background-secondary);
	border: 1px solid var(--background-tertiary);
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-secondary-highlight);
		border-color: var(--background-primary);
	}
`;

const FriendAvatar = styled.div<{ hasAvatar?: boolean }>`
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
	flex-shrink: 0;
	
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

const FriendInfo = styled.div`
	flex: 1;
`;

const FriendName = styled.div`
	font-weight: 500;
	color: var(--text);
	font-size: 14px;
`;

const FriendStatus = styled.div`
	font-size: 12px;
	color: var(--text-muted);
	margin-top: 2px;
`;

const FriendActions = styled.div`
	display: flex;
	gap: 8px;
	opacity: 0;
	transition: opacity 0.2s ease;

	${FriendItem}:hover & {
		opacity: 1;
	}
`;

const ActionButton = styled.button<{ variant: 'message' | 'remove' | 'block' }>`
	background: ${props => {
		switch (props.variant) {
			case 'message': return 'var(--primary)';
			case 'remove': return 'var(--background-tertiary)';
			case 'block': return 'var(--error)';
			default: return 'var(--background-tertiary)';
		}
	}};
	color: white;
	border: none;
	border-radius: 4px;
	padding: 6px 12px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: ${props => {
			switch (props.variant) {
				case 'message': return 'var(--primary-hover)';
				case 'remove': return 'var(--background-primary)';
				case 'block': return 'var(--error-hover)';
				default: return 'var(--background-primary)';
			}
		}};
	}
`;

const EmptyState = styled.div`
	text-align: center;
	padding: 40px 20px;
	color: var(--text-muted);
`;

const EmptyStateIcon = styled.div`
	font-size: 48px;
	margin-bottom: 16px;
	opacity: 0.5;
`;

const EmptyStateTitle = styled.div`
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 8px;
	color: var(--text);
`;

const EmptyStateDescription = styled.div`
	font-size: 14px;
	line-height: 1.4;
`;

const PendingRequestsBadge = styled.div`
	background: var(--warning);
	color: white;
	border-radius: 12px;
	padding: 4px 8px;
	font-size: 12px;
	font-weight: 500;
	margin-left: 8px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: var(--warning-hover);
	}
`;

export function FriendsList() {
	const app = useAppStore();
	const friends = app.relationships.friends;
	const incomingRequestsCount = app.relationships.incomingRequestsCount;

	const handleAddFriend = () => {
		modalController.push({
			type: "add_friend",
		});
	};

	const handleViewPendingRequests = () => {
		modalController.push({
			type: "pending_friend_requests",
		});
	};

	const handleMessageFriend = (friendId: string) => {
		// TODO: Navigate to DM with friend
		console.log("Message friend:", friendId);
	};

	const handleRemoveFriend = async (friendId: string) => {
		try {
			await app.relationships.removeFriend(friendId);
		} catch (error) {
			console.error("Failed to remove friend:", error);
		}
	};

	const handleBlockFriend = async (friendId: string) => {
		try {
			await app.relationships.blockUser(friendId);
		} catch (error) {
			console.error("Failed to block friend:", error);
		}
	};

	return (
		<FriendsContainer>
			<FriendsHeader>
				<FriendsTitle>
					Friends
					{incomingRequestsCount > 0 && (
						<PendingRequestsBadge onClick={handleViewPendingRequests}>
							{incomingRequestsCount} pending
						</PendingRequestsBadge>
					)}
				</FriendsTitle>
				<AddFriendButton onClick={handleAddFriend}>
					<Icon icon="mdiPlus" size="16px" />
					Add Friend
				</AddFriendButton>
			</FriendsHeader>

			{friends.length > 0 ? (
				<FriendsListContainer>
					{friends.map((friend) => (
						<FriendItem key={friend.id}>
							<FriendAvatar hasAvatar={!!friend.user.avatar}>
								{friend.user.avatar ? (
									<img 
										src={REST.makeCDNUrl(CDNRoutes.userAvatar(friend.user.id, friend.user.avatar, ImageFormat.PNG))}
										alt={friend.user.username}
										onError={(e) => {
											// Fallback to initials if avatar fails to load
											const target = e.target as HTMLImageElement;
											target.style.display = 'none';
											const parent = target.parentElement;
											if (parent) {
												parent.textContent = friend.user.username.charAt(0).toUpperCase();
											}
										}}
									/>
								) : (
									friend.user.username.charAt(0).toUpperCase()
								)}
							</FriendAvatar>
							<FriendInfo>
								<FriendName>{friend.user.username}#{friend.user.discriminator}</FriendName>
								<FriendStatus>Online</FriendStatus>
							</FriendInfo>
							<FriendActions>
								<ActionButton
									variant="message"
									onClick={() => handleMessageFriend(friend.user.id)}
									title="Send Message"
								>
									Message
								</ActionButton>
								<ActionButton
									variant="remove"
									onClick={() => handleRemoveFriend(friend.user.id)}
									title="Remove Friend"
								>
									Remove
								</ActionButton>
								<ActionButton
									variant="block"
									onClick={() => handleBlockFriend(friend.user.id)}
									title="Block User"
								>
									Block
								</ActionButton>
							</FriendActions>
						</FriendItem>
					))}
				</FriendsListContainer>
			) : (
				<EmptyState>
					<EmptyStateIcon>👥</EmptyStateIcon>
					<EmptyStateTitle>No Friends Yet</EmptyStateTitle>
					<EmptyStateDescription>
						You haven't added any friends yet.
						<br />
						Click "Add Friend" to start building your friend list!
					</EmptyStateDescription>
				</EmptyState>
			)}
		</FriendsContainer>
	);
}
