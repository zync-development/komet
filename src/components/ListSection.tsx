import React, { ReactNode } from "react";
import styled from "styled-components";
import Icon from "./Icon";

const Container = styled.div`
	padding: 24px 8px 0 16px;
`;

const Title = styled.span`
	font-size: 12px;
	font-weight: var(--font-weight-bold);
	color: var(--text-secondary);
	user-select: none;
	cursor: pointer;

	display: flex;
	align-items: center;
`;

const Wrapper = styled.div<{ open?: boolean }>`
	margin-top: 4px;
	display: flex;
	flex-direction: column;
	display: ${(props) => (props.open === false ? "flex" : "none")};
`;

const Item = styled.span`
	font-size: 16px;
	font-weight: var(--font-weight-medium);
	color: var(--text-normal);
	user-select: none;
	margin-left: 8px;
	padding: 4px 0;
`;

interface Props {
	name: string;
	items: ReactNode[];
}

function ListSection(props: Props) {
	const [open, setOpen] = React.useState(false);
	const toggle = () => setOpen((prev) => !prev);

	return (
		<Container>
			<Title onClick={toggle}>
				<Icon icon={open ? "mdiChevronRight" : "mdiChevronDown"} size={"16px"} />
				{props.name}
			</Title>
			<Wrapper open={open}>
				{props.items.map((item, i) => (
					<Item key={i}>{item}</Item>
				))}
			</Wrapper>
		</Container>
	);
}

export default ListSection;
