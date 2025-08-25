import { modalController } from "@/controllers/modals";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import styled from "styled-components";
import GuildItem, { GuildSidebarListItem } from "./GuildItem";
import SidebarAction from "./SidebarAction";
import { useMobile } from "@/contexts/MobileContext";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { Floating, FloatingTrigger } from "@components/floating";
import { useState } from "react";
import { PresenceUpdateStatus } from "@spacebarchat/spacebar-api-types/v9";

const Container = styled.div`
	display: flex;
	flex: 0 0 80px;
	height: 100%;
	position: relative;
	background: var(--background-secondary);
	border-right: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 0 16px 16px 0;
	padding: 12px 0;

	@media (max-width: 767px) {
		flex: 0 0 68px;
		height: 100%;
		background: var(--background-primary);
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0 12px 12px 0;
		padding: 8px 0;
	}

	.ReactVirtualized__List {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */

		&::-webkit-scrollbar {
			width: 0;
			height: 0;
		}
	}
`;



const MobileTouchIndicator = styled.div`
	position: absolute;
	top: 50%;
	right: -2px;
	transform: translateY(-50%);
	width: 4px;
	height: 40px;
	background: var(--primary);
	border-radius: 2px;
	opacity: 0.8;
	z-index: 15;
	pointer-events: none;
	display: none;

	@media (max-width: 767px) {
		display: block;
	}
`;

const Divider = styled.div`
	height: 2px;
	width: 32px;
	border-radius: 1px;
	background-color: rgba(255, 255, 255, 0.08);
	margin: 8px auto;
`;

const ContextMenu = styled.div`
	background: var(--background-primary);
	border: 1px solid var(--background-tertiary);
	border-radius: 6px;
	padding: 4px 0;
	min-width: 160px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	z-index: 1000;
`;

const MenuItem = styled.div<{ disabled?: boolean }>`
	padding: 4px 12px;
	cursor: ${props => props.disabled ? 'default' : 'pointer'};
	color: var(--text);
	font-size: 12px;
	display: flex;
	align-items: center;
	gap: 6px;
	opacity: ${props => props.disabled ? 0.5 : 1};

	&:hover {
		background: ${props => props.disabled ? 'transparent' : 'var(--background-secondary)'};
	}
`;

const StatusDot = styled.div<{ color: string }>`
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background-color: ${props => props.color};
`;

const UserInfo = styled.div`
	padding: 4px 12px;
	border-bottom: 1px solid var(--background-tertiary);
	margin-bottom: 4px;
`;

const Username = styled.div`
	font-weight: bold;
	font-size: 13px;
	color: var(--text);
	margin-bottom: 1px;
`;

const UserTag = styled.div`
	font-size: 10px;
	color: var(--text-muted);
`;

const CustomStatusSection = styled.div`
	padding: 4px 12px;
	border-top: 1px solid var(--background-tertiary);
	margin-top: 4px;
`;

function GuildSidebar() {
	const app = useAppStore();
	const { isMobile } = useMobile();
	const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
		visible: false,
		x: 0,
		y: 0
	});

	const navigate = useNavigate();
	const { all } = app.guilds;
	const itemCount = all.length + 4; // add the home button, divider, discovery button, and add server button

	const handleProfileContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setContextMenu({
			visible: true,
			x: e.clientX,
			y: e.clientY
		});
	};

	const closeContextMenu = () => {
		setContextMenu({ visible: false, x: 0, y: 0 });
	};

	const handleStatusChange = (status: PresenceUpdateStatus) => {
		// Update user status - for now just close menu
		// TODO: Implement status update when gateway supports it
		closeContextMenu();
	};

	const handleCustomStatus = () => {
		// Open custom status modal - for now just close menu
		// TODO: Implement custom status when modal is available
		closeContextMenu();
	};

	const handleProfileSettings = () => {
		// Open profile settings modal
		modalController.push({
			type: "settings",
		});
		closeContextMenu();
	};

	// Close context menu when clicking outside
	React.useEffect(() => {
		const handleClickOutside = () => {
			if (contextMenu.visible) {
				closeContextMenu();
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [contextMenu.visible]);

	const rowRenderer = ({ index, key, style }: ListRowProps) => {
		let element: React.ReactNode;
		if (index === 0) {
			// profile button (works as home button)
			element = (
				<GuildSidebarListItem>
					<Floating
						placement="right"
						type="tooltip"
						offset={20}
						props={{
							content: (
								<div style={{
									padding: "2px 4px",
									color: "var(--text)",
									fontSize: "12px",
									lineHeight: "1.1"
								}}>
									<div style={{ fontWeight: "bold", marginBottom: "1px" }}>
										{app.account?.username || "User"}
									</div>
									<div style={{ color: "var(--text-muted)", fontSize: "10px" }}>
										{app.account ? `${app.account.username}#${app.account.discriminator}` : "User#0000"}
									</div>
								</div>
							),
						}}
					>
						<FloatingTrigger>
							<div
								style={{
									width: "45px",
									height: "43px",
									borderRadius: window.location.pathname === "/channels/@me" ? "12px" : "10px",
									overflow: "hidden",
									transition: "all 0.15s ease",
									border: "1px solid rgba(255, 255, 255, 0.06)",
									cursor: "pointer",
									margin: "6px auto 0 auto",
									position: "relative",
									display: "flex",
									alignItems: "center",
									justifyContent: "center"
								}}
								onClick={() => navigate("/channels/@me")}
								onContextMenu={handleProfileContextMenu}
							>
								{app.account ? (
									<div style={{ 
										width: "100%", 
										height: "100%", 
										position: "relative",
										overflow: "hidden"
									}}>
										<img 
											src={app.account.avatarUrl}
											alt={app.account.username}
											style={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
												borderRadius: "inherit"
											}}
										/>
										{/* Status indicator */}
										<div style={{
											position: "absolute",
											bottom: "1px",
											right: "1px",
											width: "8px",
											height: "8px",
											backgroundColor: "#43b581",
											borderRadius: "50%",
											border: "1px solid var(--background-secondary)"
										}} />
									</div>
								) : (
									<div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--background-secondary)" }} />
								)}
							</div>
						</FloatingTrigger>
					</Floating>
				</GuildSidebarListItem>
			);
		} else if (index === 1) {
			// divider
			element = (
				<GuildSidebarListItem>
					<Divider key="divider" />
				</GuildSidebarListItem>
			);
		} else if (index === 2) {
			// discovery button
			element = (
				<SidebarAction
					key="discovery"
					tooltip="Server Discovery"
					icon={{
						icon: "mdiCompass",
						size: "24px",
						color: "var(--primary)",
					}}
					action={() => navigate("/discovery")}
					margin={false}
					active={window.location.pathname === "/discovery"}
				/>
			);
		} else if (index === itemCount - 2) {
			// add server button
			element = (
				<SidebarAction
					key="add-server"
					tooltip="Add Server"
					icon={{
						icon: "mdiPlus",
						size: "24px",
						color: "var(--success)",
					}}
					action={() => {
						modalController.push({
							type: "add_server",
						});
					}}
					margin={false}
					disablePill
					useGreenColorScheme
				/>
			);
		} else if (index >= 3 && index < 3 + all.length) {
			// regular guild item
			const guild = all[index - 3];
			element = <GuildItem key={key} guild={guild} />;
		} else {
			// This shouldn't happen, but let's handle it gracefully
			element = <div key={key} />;
		}

		return <div key={key} style={style}>{element}</div>;
	};

	return (
		<Container>
			<AutoSizer>
				{({ width, height }) => (
					<List
						height={height - 80}
						overscanRowCount={2}
						rowCount={itemCount}
						rowHeight={({ index }) => {
							if (index === 1) return 16; // divider: 2px height + 8px margin + 6px extra
							return 60; // item: 52px height + 8px margin
						}}
						rowRenderer={rowRenderer}
						width={width}
					/>
				)}
			</AutoSizer>
			
			{/* Profile Settings Button at Bottom */}
			<div style={{
				position: "absolute",
				bottom: "12px",
				left: "0",
				right: "0",
				display: "flex",
				justifyContent: "center",
				padding: "0 12px"
			}}>
				<Floating
					placement="right"
					type="tooltip"
					offset={20}
					props={{
						content: <span>Profile Settings</span>,
					}}
				>
					<FloatingTrigger>
						<div
							style={{
								width: "52px",
								height: "52px",
								borderRadius: "14px",
								backgroundColor: "var(--background-tertiary)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transition: "all 0.15s ease",
								border: "1px solid rgba(255, 255, 255, 0.06)",
								cursor: "pointer"
							}}
							onClick={() => {
								// Open profile settings modal
								modalController.push({
									type: "settings",
								});
							}}
						>
							<Icon icon="mdiCog" size="24px" color="var(--text-muted)" />
						</div>
					</FloatingTrigger>
				</Floating>
			</div>

			{/* Profile Context Menu */}
			{contextMenu.visible && (
				<div
					style={{
						position: "fixed",
						top: contextMenu.y,
						left: contextMenu.x,
						zIndex: 1000,
					}}
					onClick={closeContextMenu}
				>
					<ContextMenu onClick={(e) => e.stopPropagation()}>
						<UserInfo>
							<Username>{app.account?.username || "User"}</Username>
							<UserTag>{app.account ? `${app.account.username}#${app.account.discriminator}` : "User#0000"}</UserTag>
						</UserInfo>
						
						<MenuItem onClick={() => handleStatusChange(PresenceUpdateStatus.Online)}>
							<StatusDot color="#43b581" />
							Online
						</MenuItem>
						<MenuItem onClick={() => handleStatusChange(PresenceUpdateStatus.Idle)}>
							<StatusDot color="#faa61a" />
							Idle
						</MenuItem>
						<MenuItem onClick={() => handleStatusChange(PresenceUpdateStatus.DoNotDisturb)}>
							<StatusDot color="#f04747" />
							Do Not Disturb
						</MenuItem>
						<MenuItem onClick={() => handleStatusChange(PresenceUpdateStatus.Invisible)}>
							<StatusDot color="#747f8d" />
							Invisible
						</MenuItem>
						
						<CustomStatusSection>
							<MenuItem onClick={handleCustomStatus}>
								<Icon icon="mdiAccount" size="14px" />
								Custom status
								<div style={{ marginLeft: "auto" }}>
									<Icon icon="mdiDelete" size="14px" color="var(--text-muted)" />
								</div>
							</MenuItem>
						</CustomStatusSection>
						
						<MenuItem onClick={handleProfileSettings}>
							<Icon icon="mdiCog" size="14px" />
							Profile Settings
						</MenuItem>
					</ContextMenu>
				</div>
			)}

		</Container>
	);
}

export default observer(GuildSidebar);
