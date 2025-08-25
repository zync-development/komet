import Container from "@components/Container";
import styled from "styled-components";

export type PillType = "none" | "unread" | "hover" | "active";

const Wrapper = styled(Container)`
	position: absolute;
	left: 0;
	width: 4px;
	height: 100%;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	background-color: inherit;
`;

const Pill = styled.span<{ type: PillType }>`
	width: 4px;
	border-radius: 0 2px 2px 0;
	background-color: ${(props) => {
		switch (props.type) {
			case "unread":
				return "var(--primary)";
			case "hover":
				return "var(--text-secondary)";
			case "active":
				return "var(--primary)";
			default:
				return "transparent";
		}
	}};
	margin-left: -2px;
	transition: all 0.15s ease;
	box-shadow: ${(props) => props.type !== "none" ? "0 0 4px rgba(88, 101, 242, 0.4)" : "none"};

	${(props) => {
		switch (props.type) {
			case "unread":
				return `
					height: 16px;
					opacity: 1;
				`;
			case "hover":
				return `
					height: 24px;
					opacity: 0.9;
				`;
			case "active":
				return `
					height: 32px;
					opacity: 1;
				`;
			default:
				return `
					height: 0;
					opacity: 0;
				`;
		}
	}}
`;

interface Props {
	type: PillType;
}

function SidebarPill({ type }: Props) {
	return (
		<Wrapper>
			<Pill type={type} />
		</Wrapper>
	);
}

export default SidebarPill;
