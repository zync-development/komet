
import Button from "@components/Button";
import Container from "@components/Container";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { Suspense } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import styled from "styled-components";

const Wrapper = styled.div`
	justify-content: center;
	align-items: center;
	display: flex;
	flex-direction: column;
	flex: 1;
`;



function LoadingPage() {
	const app = useAppStore();

	return (
		<Container
			style={{
				flex: 1,
			}}
		>
					<Wrapper>
			<PulseLoader color="var(--text)" />
				{app.token && (
					<div
						style={{
							position: "absolute",
							bottom: "30vh",
						}}
					>
						<Button palette="danger" onClick={() => app.logout()}>
							Logout
						</Button>
					</div>
				)}
			</Wrapper>
		</Container>
	);
}

export default observer(LoadingPage);

export const LoadingSuspense = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<LoadingPage />}>{children}</Suspense>
);
