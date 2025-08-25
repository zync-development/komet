import Container from "@components/Container";
import { Floating, FloatingTrigger } from "@components/floating";
import { GuildSidebarListItem } from "@components/GuildItem";
import Icon, { IconProps } from "@components/Icon";
import SidebarPill, { PillType } from "@components/SidebarPill";
import React from "react";
import styled from "styled-components";

const Wrapper = styled(Container)<{
	margin?: boolean;
	active?: boolean;
	useGreenColorScheme?: boolean;
}>`
	${(props) => (props.margin !== false ? "margin-top: 8px;" : "")}};
	padding: 0;
	width: 52px;
	height: 52px;
	border-radius: ${(props) => (props.active ? "16px" : "14px")};
	background-color: ${(props) => (props.active ? "var(--primary)" : "var(--background-tertiary)")};
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s ease;
	border: 1px solid ${(props) => (props.active ? "rgba(88, 101, 242, 0.3)" : "rgba(255, 255, 255, 0.06)")};

	&:hover {
		border-radius: 16px;
		background-color: ${(props) => (props.useGreenColorScheme ? "var(--success)" : "var(--primary)")};
		transform: translateY(-1px);
		border-color: ${(props) => (props.useGreenColorScheme ? "rgba(34, 197, 94, 0.4)" : "rgba(88, 101, 242, 0.4)")};
	}
`;

interface Props {
	tooltip?: string;
	action?: () => void;
	image?: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
	icon?: IconProps;
	label?: string;
	margin?: boolean;
	active?: boolean;
	useGreenColorScheme?: boolean;
	disablePill?: boolean;
}

function SidebarAction(props: Props) {
	if (props.image && props.icon && props.label)
		throw new Error("SidebarAction can only have one of image, icon, or label");

	const [pillType, setPillType] = React.useState<PillType>("none");
	const [isHovered, setHovered] = React.useState(false);

	React.useEffect(() => {
		if (props.disablePill) return;

		if (props.active) return setPillType("active");
		else if (isHovered) return setPillType("hover");
		// TODO: unread
		else return setPillType("none");
	}, [props.active, isHovered]);

	return (
		<GuildSidebarListItem>
			<SidebarPill type={pillType} />
			<Floating
				placement="right"
				type="tooltip"
				offset={20}
				props={{
					content: <span>{props.tooltip}</span>,
				}}
			>
				<FloatingTrigger>
					<Wrapper
						onClick={props.action}
						onMouseEnter={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}
						margin={props.margin}
						active={props.active}
						useGreenColorScheme={props.useGreenColorScheme}
					>
						{props.image && <img {...props.image} loading="lazy" />}
						{props.icon && (
							<Icon
								{...props.icon}
								color={isHovered && props.useGreenColorScheme ? "var(--text)" : props.icon.color}
							/>
						)}
						{props.label && <span>{props.label}</span>}
					</Wrapper>
				</FloatingTrigger>
			</Floating>
		</GuildSidebarListItem>
	);
}

export default SidebarAction;
