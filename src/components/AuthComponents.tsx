import Container from "@components/Container";
import styled from "styled-components";
import Button from "./Button";

export const Wrapper = styled(Container)`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	background-color: var(--background-tertiary);
	flex: 1;
	padding-right: 10%;
`;

export const AuthContainer = styled(Container)`
	background: rgba(32, 34, 37, 0.8);
	backdrop-filter: blur(25px) saturate(180%);
	-webkit-backdrop-filter: blur(25px) saturate(180%);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 16px;
	box-shadow: 
		0 8px 32px rgba(0, 0, 0, 0.3),
		0 0 0 1px rgba(255, 255, 255, 0.05),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
	padding: 20px;
	font-size: 16px;
	color: var(--text-muted);
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
	}

	@media (max-width: 480px) {
		width: 100%;
		height: 100%;
		justify-content: center;
	}
	@media (min-width: 480px) {
		width: 350px;
		height: 100;
		border-radius: 16px;
	}
`;

export const HeaderContainer = styled.div`
	width: 100%;
`;

export const Header = styled.h1`
	margin-bottom: 3px;
	color: var(--text);
	font-weight: var(--font-weight-bold);
	font-size: 24px;
`;

export const SubHeader = styled.h2<{ noBranding?: boolean }>`
	margin-top: 3px;
	color: var(--text-muted);
	font-weight: var(--font-weight-regular);
	font-size: ${(props) => (props.noBranding ? "20px" : "16px")};
`;

export const FormContainer = styled.form`
	width: 100%;
	margin-top: 40px;
`;

export const InputContainer = styled.h1<{ marginBottom: boolean }>`
	margin-bottom: ${(props) => (props.marginBottom ? "20px" : "0")};
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

export const LabelWrapper = styled.div<{ error?: boolean; isPassword?: boolean }>`
	display: flex;
	flex-direction: row;
	margin-bottom: 8px;
`;

export const InputErrorText = styled.label`
	font-size: 14px;
	font-weight: var(--font-weight-regular);
	font-style: italic;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const InputLabel = styled.label<{ isPassword?: boolean }>`
	font-size: 14px;
	font-weight: var(--font-weight-bold);
	color: ${(props) => props.isPassword ? 'white' : 'rgba(255, 255, 255, 0.7)'};
`;

export const InputWrapper = styled.div`
	width: 100%;
	display: flex;
`;

export const Input = styled.input<{ error?: boolean; disableFocusRing?: boolean }>`
	outline: none;
	background: var(--background-secondary);
	border: 1px solid var(--background-secondary-alt);
	border-radius: 8px;
	padding: 12px 16px;
	font-size: 16px;
	width: 100%;
	color: white;
	margin: 0;
	box-sizing: border-box;
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	transition: all 0.2s ease;

	&::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	&:hover {
		border-color: var(--background-secondary-highlight);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	&:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
		background: var(--background-secondary-highlight);
	}

	/* Override browser autocomplete styling */
	&:-webkit-autofill,
	&:-webkit-autofill:hover,
	&:-webkit-autofill:focus,
	&:-webkit-autofill:active {
		-webkit-box-shadow: 0 0 0 30px var(--background-secondary) inset !important;
		-webkit-text-fill-color: white !important;
		background-color: var(--background-secondary) !important;
		background-image: none !important;
		-webkit-background-clip: content-box !important;
	}

	/* Firefox autocomplete override */
	&:-moz-autofill {
		background-color: var(--background-secondary) !important;
		color: white !important;
		background-image: none !important;
	}

	/* Additional autocomplete prevention */
	&[autocomplete="off"] {
		background-color: var(--background-secondary) !important;
		background-image: none !important;
	}

	${(props) =>
		props.error &&
		`
		background: var(--background-secondary);
		border-color: var(--error);
		box-shadow: 0 0 0 2px rgba(232, 63, 54, 0.2);
	`}

	&:disabled {
		background: var(--background-tertiary);
		color: rgba(255, 255, 255, 0.4);
		cursor: not-allowed;
		border-color: var(--background-secondary-alt);
		box-shadow: none;
	}

	-moz-appearance: textfield;
	appearance: textfield;

	&::-webkit-inner-spin-button,
	&::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}
`;

export const Link = styled.button`
	margin-bottom: 20px;
	margin-top: 4px;
	padding: 2px 0;
	font-size: 14px;
	display: flex;
	color: var(--text-link);
	background: none;
	border: none;

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;

export const SubmitButton = styled(Button)`
	margin-bottom: 8px;
	width: 100%;
	min-width: 130px;
	min-height: 44px;
	font-size: 16px;
	font-weight: 600;
	background: var(--primary);
	border: none;
	border-radius: 8px;
	color: var(--primary-contrast-text);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
	transition: all 0.2s ease;

	&:hover:not(:disabled) {
		background: var(--primary-light);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}

	&:active:not(:disabled) {
		background: var(--primary-dark);
		transform: translateY(0);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: rgba(255, 255, 255, 0.4);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
`;

export const AuthSwitchPageContainer = styled.div`
	margin-top: 4px;
	text-align: initial;
`;

export const AuthSwitchPageLabel = styled.label`
	font-size: 14px;
`;

export const AuthSwitchPageLink = styled.button`
	font-size: 14px;
	background: none;
	border: none;
	color: var(--text-link);

	@media (max-width: 480px) {
		display: inline-block;
	}

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;