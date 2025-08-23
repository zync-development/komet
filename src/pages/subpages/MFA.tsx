import KometLogoBlue from "@assets/images/logo/Komet-Logo-Blue.svg?react";
import { AnimatedBackground } from "@components/AnimatedBackground";
import {
	AuthContainer,
	FormContainer,
	Header,
	HeaderContainer,
	Input,
	InputContainer,
	InputErrorText,
	InputLabel,
	InputWrapper,
	LabelWrapper,
	Link,
	SubHeader,
	SubmitButton,
	Wrapper,
} from "@components/AuthComponents";
import { useAppStore } from "@hooks/useAppStore";
import { TextDivider } from "@components/Divider";
import useLogger from "@hooks/useLogger";
import { Routes } from "@spacebarchat/spacebar-api-types/v9";
import {
	IAPIError,
	IAPILoginResponseMFARequired,
	IAPILoginResponseSuccess,
	IAPITOTPRequest,
	messageFromFieldError,
} from "@utils";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type FormValues = {
	code: string;
};

interface Props extends IAPILoginResponseMFARequired {
	close: () => void;
}

function MFA(props: Props) {
	const app = useAppStore();
	const logger = useLogger("MFA");
	const navigate = useNavigate();
	const [loading, setLoading] = React.useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<FormValues>();

	const onSubmit = handleSubmit((data) => {
		setLoading(true);

		app.rest
			.post<IAPITOTPRequest, IAPILoginResponseSuccess>(Routes.mfaTotp(), {
				...data,
				ticket: props.ticket,
			})
			.then((r) => {
				app.setToken(r.token, true);
				navigate("/app", { replace: true });
			})
			.catch((r: IAPIError) => {
				if ("message" in r) {
					// error
					if (r.errors) {
						const t = messageFromFieldError(r.errors);
						if (t) {
							setError(t.field as keyof FormValues, {
								type: "manual",
								message: t.error,
							});
						} else {
							setError("code", {
								type: "manual",
								message: r.message,
							});
						}
					} else {
						setError("code", {
							type: "manual",
							message: r.message,
						});
					}
				} else {
					// unknown error
					logger.error(r);
					setError("code", {
						type: "manual",
						message: "Unknown Error",
					});
				}
			})
			.finally(() => setLoading(false));
	});

	return (
		<Wrapper>
			<AnimatedBackground gifUrl={app.theme.backgroundGifUrl ?? "https://media.discordapp.net/attachments/1405695893381841006/1408702250385145948/background_1_1.gif?ex=68aab3b4&is=68a96234&hm=357d19e4a1f7ebef7054187c0c58226e4127d798c180f76fc29bd8963712af1b&="}>
				<AuthContainer>
				<HeaderContainer>
					<KometLogoBlue height={48} width="100%" />
					<Header>Two-factor authentication</Header>
					<SubHeader>You can use a backup code or your two-factor authentication mobile app.</SubHeader>

					<FormContainer onSubmit={onSubmit}>
						<InputContainer marginBottom={true} style={{ marginTop: 0 }}>
							<LabelWrapper error={!!errors.code}>
								<InputLabel>Enter 2FA/Backup Code</InputLabel>
								{errors.code && (
									<InputErrorText>
										<>
											<TextDivider>-</TextDivider>
											{errors.code.message}
										</>
									</InputErrorText>
								)}
							</LabelWrapper>
							<InputWrapper>
								<Input
									type="text"
									autoFocus
									{...register("code", { required: true })}
									error={!!errors.code}
									disabled={loading}
									placeholder="6-digit authentication code/8-digit backup code"
								/>
							</InputWrapper>
						</InputContainer>

						<SubmitButton palette="primary" type="submit" disabled={loading}>
							Log In
						</SubmitButton>

						{/* <Link
						onClick={() => {
							window.open(
								"https://youtu.be/dQw4w9WgXcQ",
								"_blank",
							);
						}}
						type="button"
					>
						Recieve auth code from SMS
					</Link> */}

						<Link onClick={() => props.close()} type="button">
							Go Back to Login
						</Link>
					</FormContainer>
				</HeaderContainer>
							</AuthContainer>
			</AnimatedBackground>
		</Wrapper>
	);
}

export default MFA;
