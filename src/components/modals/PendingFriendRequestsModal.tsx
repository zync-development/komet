import { ModalProps, modalController } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import useLogger from "@hooks/useLogger";
import { CDNRoutes, ImageFormat } from "@spacebarchat/spacebar-api-types/v9";
import { REST } from "@utils";
import React from "react";
import styled from "styled-components";
import { Modal } from "./ModalComponents";

const RequestList = styled.div`
	max-height: 400px;
	overflow-y: auto;
`;

const RequestItem = styled.div`
	display: flex;
	align-items: center;
	padding: 16px;
	border-radius: 8px;
	background: var(--background-secondary);
	margin-bottom: 8px;
	border: 1px solid var(--background-tertiary);
`;

const UserAvatar = styled.div<{ hasAvatar?: boolean }>`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: ${props => props.hasAvatar ? 'transparent' : 'var(--primary)'};
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16px;
	color: white;
	font-weight: 600;
	font-size: 16px;
	overflow: hidden;
	flex-shrink: 0;
	
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
	font-weight: 600;
	color: var(--text);
	font-size: 16px;
	margin-bottom: 4px;
`;

const RequestInfo = styled.div`
	font-size: 14px;
	color: var(--text-muted);
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 8px;
	flex-shrink: 0;
`;

const ActionButton = styled.button<{ variant: 'accept' | 'decline' | 'block' }>`
	background: ${props => {
		switch (props.variant) {
			case 'accept': return 'var(--success)';
			case 'decline': return 'var(--background-tertiary)';
			case 'block': return 'var(--error)';
			default: return 'var(--background-tertiary)';
		}
	}};
	color: white;
	border: none;
	border-radius: 6px;
	padding: 8px 16px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: ${props => {
			switch (props.variant) {
				case 'accept': return 'var(--success-hover)';
				case 'decline': return 'var(--background-primary)';
				case 'block': return 'var(--error-hover)';
				default: return 'var(--background-primary)';
			}
		}};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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

export function PendingFriendRequestsModal({ ...props }: ModalProps<"pending_friend_requests">) {
	const logger = useLogger("PendingFriendRequestsModal");
	const app = useAppStore();

	const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

	const handleAcceptRequest = async (userId: string) => {
		setIsProcessing(userId);
		try {
			await app.relationships.acceptFriendRequest(userId);
			logger.info(`Accepted friend request from ${userId}`);
		} catch (error) {
			logger.error("Failed to accept friend request:", error);
			// Show error message
			modalController.push({
				type: "error",
				title: "Error",
				description: "Failed to accept friend request. Please try again.",
				error: "Failed to accept friend request",
				recoverable: true,
			});
		} finally {
			setIsProcessing(null);
		}
	};

	const handleDeclineRequest = async (userId: string) => {
		setIsProcessing(userId);
		try {
			await app.relationships.removeFriend(userId);
			logger.info(`Declined friend request from ${userId}`);
		} catch (error) {
			logger.error("Failed to decline friend request:", error);
			// Show error message
			modalController.push({
				type: "error",
				title: "Error",
				description: "Failed to decline friend request. Please try again.",
				error: "Failed to decline friend request",
				recoverable: true,
			});
		} finally {
			setIsProcessing(null);
		}
	};

	const handleBlockUser = async (userId: string) => {
		setIsProcessing(userId);
		try {
			await app.relationships.blockUser(userId);
			logger.info(`Blocked user ${userId}`);
		} catch (error) {
			logger.error("Failed to block user:", error);
			// Show error message
			modalController.push({
				type: "error",
				title: "Error",
				description: "Failed to block user. Please try again.",
				error: "Failed to block user",
				recoverable: true,
			});
		} finally {
			setIsProcessing(null);
		}
	};

	const incomingRequests = app.relationships.incomingRequests;

	return (
		<Modal
			{...props}
			onClose={() => modalController.closeAll()}
			title="Friend Requests"
			description={`You have ${incomingRequests.length} pending friend request${incomingRequests.length !== 1 ? 's' : ''}`}
			actions={[
				{
					onClick: () => modalController.closeAll(),
					children: <span>Close</span>,
					palette: "link",
				},
			]}
		>
			{incomingRequests.length > 0 ? (
				<RequestList>
					{incomingRequests.map((request) => (
						<RequestItem key={request.id}>
							<UserAvatar hasAvatar={!!request.user.avatar}>
								{request.user.avatar ? (
									<img 
										src={REST.makeCDNUrl(CDNRoutes.userAvatar(request.user.id, request.user.avatar, ImageFormat.PNG))}
										alt={request.user.username}
										onError={(e) => {
											// Fallback to initials if avatar fails to load
											const target = e.target as HTMLImageElement;
											target.style.display = 'none';
											const parent = target.parentElement;
											if (parent) {
												parent.textContent = request.user.username.charAt(0).toUpperCase();
											}
										}}
									/>
								) : (
									request.user.username.charAt(0).toUpperCase()
								)}
							</UserAvatar>
							<UserInfo>
								<Username>{request.user.username}#{request.user.discriminator}</Username>
								<RequestInfo>Wants to be your friend</RequestInfo>
							</UserInfo>
							<ActionButtons>
								<ActionButton
									variant="accept"
									onClick={() => handleAcceptRequest(request.user.id)}
									disabled={isProcessing === request.user.id}
								>
									{isProcessing === request.user.id ? "Accepting..." : "Accept"}
								</ActionButton>
								<ActionButton
									variant="decline"
									onClick={() => handleDeclineRequest(request.user.id)}
									disabled={isProcessing === request.user.id}
								>
									{isProcessing === request.user.id ? "Declining..." : "Decline"}
								</ActionButton>
								<ActionButton
									variant="block"
									onClick={() => handleBlockUser(request.user.id)}
									disabled={isProcessing === request.user.id}
								>
									{isProcessing === request.user.id ? "Blocking..." : "Block"}
								</ActionButton>
							</ActionButtons>
						</RequestItem>
					))}
				</RequestList>
			) : (
				<EmptyState>
					<EmptyStateIcon>👥</EmptyStateIcon>
					<EmptyStateTitle>No Pending Requests</EmptyStateTitle>
					<EmptyStateDescription>
						You don't have any pending friend requests right now.
						<br />
						When someone sends you a friend request, it will appear here.
					</EmptyStateDescription>
				</EmptyState>
			)}
		</Modal>
	);
}
