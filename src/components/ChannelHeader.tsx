import { Permissions, calculatePermissions } from "@utils/Permissions";
import { modalController } from "@/controllers/modals";
import { Floating, FloatingTrigger } from "@components/floating";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { CDNRoutes, ImageFormat } from "@spacebarchat/spacebar-api-types/v9";
import { REST } from "@utils";
import { Role } from "@structures";
import React, { useEffect } from "react";
import styled from "styled-components";
import Icon, { IconProps } from "./Icon";
import IconButton from "./IconButton";
import { SectionHeader } from "./SectionHeader";

const Wrapper = styled(SectionHeader)<{ bannerUrl?: string }>`
	background-color: var(--background-secondary);
	cursor: pointer;
    ${props => props.bannerUrl && `
        background-image: url(${props.bannerUrl});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        min-height: 80px; /* Adjust as needed */
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding-bottom: 10px;
    `}

	&:hover {
		background-color: var(--background-secondary-highlight);
	}
`;

const HeaderText = styled.header`
	font-size: 16px;
	font-weight: var(--font-weight-medium);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	user-select: none;
`;

function ChannelHeader() {
	const app = useAppStore();

	const [isOpen, setOpen] = React.useState(false);
	const [icon, setIcon] = React.useState<IconProps["icon"]>("mdiChevronDown");

	const onOpenChange = (open: boolean) => {
		setOpen(open);
	};

	useEffect(() => {
		if (isOpen) setIcon("mdiClose");
		else setIcon("mdiChevronDown");
	}, [isOpen]);

	if (app.activeGuildId === "@me") {
		return (
			<Wrapper
				style={{
					cursor: "default",
					pointerEvents: "none",
					display: "flex",
					justifyContent: "center",
				}}
			>
				<HeaderText>Direct Messages</HeaderText>
			</Wrapper>
		);
	}

	if (!app.activeGuild) return null;

	const member = app.activeGuild.members.get(app.account!.id);
	if (!member) return null;

	const userRoles = member.roles.map((roleId) => app.roles.get(roleId)).filter((role): role is Role => role !== undefined);
	const serverRoles = app.activeGuild.roles;

	const permissions = calculatePermissions(app.account!.id, app.activeGuild!, userRoles, serverRoles, app.activeChannel, app.channelPermissions);
	const hasManageChannelPermission = (permissions & Permissions.ManageChannel) === Permissions.ManageChannel;

	return (
		<Floating type="guild" open={isOpen} onOpenChange={onOpenChange} props={{ guild: app.activeGuild! }}>
			<FloatingTrigger>
				<Wrapper bannerUrl={app.activeGuild.banner ? REST.makeCDNUrl(CDNRoutes.guildBanner(app.activeGuild.id, app.activeGuild.banner, ImageFormat.PNG)) : undefined}>
					<HeaderText>{app.activeGuild.name}</HeaderText>
					<Icon icon={icon} size="20px" color="var(--text)" />
					{hasManageChannelPermission && (
						<IconButton icon="mdiCog" size="20px" color="var(--text)" onClick={() => modalController.push({ type: "channel_settings", target: app.activeChannel! })} />
					)}
				</Wrapper>
			</FloatingTrigger>
		</Floating>
	);
}

export default observer(ChannelHeader);
