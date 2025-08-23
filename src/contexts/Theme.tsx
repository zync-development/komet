import { useAppStore } from "@hooks/useAppStore";
import { rgbToHsl } from "@utils";
import { observer } from "mobx-react-lite";
import { createGlobalStyle } from "styled-components";

const font: ThemeFont["font"] = {
	weight: {
		thin: 100,
		// extraLight: 200,
		light: 300,
		regular: 400,
		medium: 500,
		// semiBold: 600,
		bold: 700,
		// extraBold: 800,
		black: 900,
	},
	family: "Roboto, Arial, Helvetica, sans-serif",
	familyCode: '"Roboto Mono", monospace',
};

export type ThemeVariables =
	| "backgroundPrimary"
	| "backgroundPrimaryAlt"
	| "backgroundPrimaryHighlight"
	| "backgroundSecondary"
	| "backgroundSecondaryAlt"
	| "backgroundSecondaryHighlight"
	| "backgroundTertiary"
	| "textHeader"
	| "textHeaderSecondary"
	| "text"
	| "textSecondary"
	| "textDisabled"
	| "textHint"
	| "textLink"
	| "textMuted"
	| "inputBackground"
	| "error"
	| "divider"
	| "primary"
	| "primaryLight"
	| "primaryDark"
	| "primaryContrastText"
	| "secondary"
	| "secondaryLight"
	| "secondaryDark"
	| "secondaryContrastText"
	| "danger"
	| "dangerLight"
	| "dangerDark"
	| "dangerContrastText"
	| "success"
	| "successLight"
	| "successDark"
	| "successContrastText"
	| "warning"
	| "warningLight"
	| "warningDark"
	| "warningContrastText"
	| "interactive"
	| "scrollbarTrack"
	| "scrollbarThumb"
	| "statusIdle"
	| "statusOffline"
	| "accent";

export type Overrides = {
	[variable in ThemeVariables]: string;
};

export type ThemeFont = {
	font: {
		weight: {
			thin?: number;
			extraLight?: number;
			light?: number;
			regular?: number;
			medium?: number;
			semiBold?: number;
			bold?: number;
			extraBold?: number;
			black?: number;
		};
		family: string;
		familyCode: string;

	};
};

export type OverridesWithFont = Overrides & ThemeFont;

export type Theme = OverridesWithFont & {
	light?: boolean;
};

export const ThemePresets: Record<string, Theme> = {
	light: {
		backgroundPrimary: "#ffffff",
		backgroundPrimaryAlt: "",
		backgroundPrimaryHighlight: "",
		backgroundSecondary: "#ebe5e4",
		backgroundSecondaryAlt: "#ebe5e4",
		backgroundSecondaryHighlight: "#ebe5e4",
		backgroundTertiary: "#e9e2e1",
		text: "#000000",
		textSecondary: "#bdbdbd",
		textDisabled: "#909090",
		textHeader: "#000000",
		textHeaderSecondary: "#000000",
		textMuted: "#8e8e8e",
		textHint: "#22194D",
		textLink: "#00a8fc",
		inputBackground: "#757575",
		error: "#e83f36",
		divider: "#3c3c3c",
		primary: "#22c55e",
		primaryLight: "#4ade80",
		primaryDark: "#16a34a",
		primaryContrastText: "#ffffff",
		accent: "#000115",
		secondary: "#4e4e4e",
		secondaryLight: "#ff9633",
		secondaryDark: "#b25e00",
		secondaryContrastText: "",
		danger: "",
		dangerLight: "",
		dangerDark: "",
		dangerContrastText: "",
		success: "",
		successLight: "",
		successDark: "",
		successContrastText: "",
		warning: "",
		warningLight: "",
		warningDark: "",
		warningContrastText: "",
		scrollbarTrack: "",
		scrollbarThumb: "",
		interactive: "",
		statusIdle: "#ff7c01",
		statusOffline: "#5d5d5d",
		font: font,
	},
	dark: {
		backgroundPrimary: "#0a0a0a",
		backgroundPrimaryAlt: "#050505",
		backgroundPrimaryHighlight: "#0f0f0f",
		backgroundSecondary: "#0d0d0d",
		backgroundSecondaryAlt: "#080808",
		backgroundSecondaryHighlight: "#121212",
		backgroundTertiary: "#050505",
		text: "#e9e2e1",
		textSecondary: "#bdbdbd",
		textDisabled: "#909090",
		textHeader: "#ffffff",
		textHeaderSecondary: "#b3b3b3",
		textMuted: "#8e8e8e",
		textHint: "#22194D",
		textLink: "#00a8fc",
		inputBackground: "#0a0a0a",
		error: "#e83f36",
		divider: "#1a1a1a",
		primary: "#22c55e",
		primaryLight: "#4ade80",
		primaryDark: "#16a34a",
		primaryContrastText: "#ffffff",
		accent: "#000115",
		secondary: "#2a2a2a",
		secondaryLight: "#ff9633",
		secondaryDark: "#b25e00",
		secondaryContrastText: "#040404",
		danger: "#ff3a3b",
		dangerLight: "#ff6162",
		dangerDark: "#b22829",
		dangerContrastText: "#ffffff",
		success: "#34af65",
		successLight: "#5cbf83",
		successDark: "#247a46",
		successContrastText: "#040404",
		warning: "#faa61a",
		warningLight: "#fbb747",
		warningDark: "#af7412",
		warningContrastText: "#040404",
		scrollbarTrack: "#0d0d0d",
		scrollbarThumb: "#050505",
		interactive: "#1a1a1a",
		statusIdle: "#ff7c01",
		statusOffline: "#2a2a2a",
		font: font,
	},
};

const GlobalTheme = createGlobalStyle<{ theme: Theme }> `
:root {
    ${(props) => generateVariables(props.theme)}
}
`;

const toDashed = (str: string) => str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function objectToCSSVariables(obj: any, parentKey = "") {
	let cssVariables = "";

	for (const key in obj) {
		if (typeof obj[key] === "object") {
			cssVariables += objectToCSSVariables(obj[key], `${parentKey}-${key}`);
		} else {
			const variableName = `--${parentKey}-${toDashed(key)}`;
			const variableValue = obj[key];
			cssVariables += `${variableName}: ${variableValue};
`;
		}
	}

	return cssVariables;
}

export const generateVariables = (theme: Theme) => {
	const EXCLUDED_KEYS = ["light"];
	return (Object.keys(theme) as ThemeVariables[])
		.filter((x) => !EXCLUDED_KEYS.includes(x))
		.map((key) => {
			const colour = theme[key];
			try {
				const r = parseInt(colour.substring(1, 3), 16);
				const g = parseInt(colour.substring(3, 5), 16);
				const b = parseInt(colour.substring(5, 7), 16);
				return `--${toDashed(key)}: ${theme[key]}; --${toDashed(key)}-rgb: rgb(${r}, ${g}, ${b}); --${toDashed(
					key,
				)}-hsl: ${rgbToHsl(r, g, b)};`;
			} catch {
				if (typeof theme[key] === "object") {
					return objectToCSSVariables(theme[key], key);
				} else return `--${toDashed(key)}: ${theme[key]};`;
			}
		});
};

export default observer(() => {
	const appStore = useAppStore();
	const theme = appStore.theme;

	const variables = theme.computeVariables();

	return <GlobalTheme theme={variables} />;
});