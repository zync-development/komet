import * as Icons from "@mdi/js";
import { Icon as MdiIcon } from "@mdi/react";
import { IconProps as IconBaseProps } from "@mdi/react/dist/IconProps";

export type IconType = keyof typeof Icons;

export interface IconProps extends Omit<IconBaseProps, "path"> {
	icon: IconType | string;
}

function Icon(props: IconProps) {
	const { icon, ...propSpread } = props;
	
	// Check if it's a valid MDI icon
	if (typeof icon === "string" && Icons[icon as IconType]) {
		const path = Icons[icon as IconType];
		return <MdiIcon {...propSpread} path={path} />;
	}
	
	// Fallback for invalid icons
	console.warn(`Invalid icon name: ${icon}`);
	return <span>?</span>;
}

export default Icon;
