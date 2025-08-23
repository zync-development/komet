import { bannerController } from "@/controllers/banners";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { arch, locale, platform, version } from "@tauri-apps/plugin-os";
import { useNetworkState } from "@uidotdev/usehooks";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import useLogger from "./hooks/useLogger";
import AppPage from "./pages/AppPage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import NotFoundPage from "./pages/NotFound";
import RegistrationPage from "./pages/RegistrationPage";
import FriendsPage from "./pages/FriendsPage";
import ChannelPage from "./pages/subpages/ChannelPage";
import { Globals } from "./utils/Globals";
// @ts-expect-error no types
import FPSStats from "react-fps-stats";
import AuthenticationGuard from "./components/AuthenticationGuard";
import { useAppStore } from "./hooks/useAppStore";
import InvitePage from "./pages/InvitePage";
import { isTauri } from "./utils/Utils";
import { MobileProvider } from "./contexts/MobileContext";
import { MobileHeader, MobileNavigation } from "./components/mobile";

function App() {
	const app = useAppStore();
	const logger = useLogger("App");
	const navigate = useNavigate();
	const networkState = useNetworkState();

	React.useEffect(() => {
		// Handles gateway connection/disconnection on token change
		const dispose = reaction(
			() => app.token,
			(value) => {
				if (value) {
					app.rest.setToken(value);
					if (app.gateway.readyState === WebSocket.CLOSED) {
						app.setGatewayReady(false);
						app.gateway.connect(Globals.routeSettings.gateway);
					} else {
						logger.debug("Gateway connect called but socket is not closed");
					}
				} else {
					logger.debug("user no longer authenticated");
					if (app.gateway.readyState === WebSocket.OPEN) {
						app.gateway.disconnect(1000, "user is no longer authenticated");
					}

					navigate("/");
				}
			},
		);

		const loadAsyncGlobals = async () => {
			const [tauriVersion, appVersion, platformName, platformArch, platformVersion, platformLocale] =
				await Promise.all([getTauriVersion(), getVersion(), platform(), arch(), version(), locale()]);
			window.globals = {
				tauriVersion: tauriVersion,
				appVersion: appVersion,
				platform: {
					name: platformName,
					arch: platformArch,
					version: platformVersion,
					locale: platformLocale,
				},
			};
		};

		if (isTauri) loadAsyncGlobals();
		Globals.load();
		app.loadSettings();

		logger.debug("Loading complete");
		app.setAppLoading(false);

		return dispose;
	}, []);

	React.useEffect(() => {
		if (!networkState.online) {
			bannerController.push(
				{
					type: "offline",
				},
				"offline",
			);
		} else {
			// only close if the current banner is the offline banner
			bannerController.remove("offline");
		}
	}, [networkState]);

	return (
		<MobileProvider>
			<ErrorBoundary section="app">
				{app.fpsShown && <FPSStats />}
				<MobileHeader />
				<Loader>
					<Routes>
						<Route index path="/" element={<AuthenticationGuard component={AppPage} />} />
						<Route path="/app" element={<AuthenticationGuard component={AppPage} />} />
						<Route
							path="/channels/:guildId/:channelId?"
							element={<AuthenticationGuard component={ChannelPage} />}
						/>
						<Route
							path="/login"
							element={<AuthenticationGuard requireUnauthenticated component={LoginPage} />}
						/>
						<Route
							path="/register"
							element={<AuthenticationGuard requireUnauthenticated component={RegistrationPage} />}
						/>
						<Route path="/logout" element={<AuthenticationGuard component={LogoutPage} />} />
						<Route path="/invite/:code" element={<InvitePage />} />
						<Route path="/friends" element={<AuthenticationGuard component={FriendsPage} />} />
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</Loader>
				<MobileNavigation />
			</ErrorBoundary>
		</MobileProvider>
	);
}

export default observer(App);
