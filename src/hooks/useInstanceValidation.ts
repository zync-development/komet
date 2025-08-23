import useLogger from "@hooks/useLogger";
import { Globals, REST, RouteSettings } from "@utils";
import React, { useEffect } from "react";
import { FieldPath, FieldValues, UseFormClearErrors, UseFormSetError } from "react-hook-form";

const getValidURL = (url: string) => {
	try {
		return new URL(url);
	} catch (e) {
		return undefined;
	}
};

export function useInstanceValidation<T extends FieldValues>(
	setError: UseFormSetError<T>,
	clearErrors: UseFormClearErrors<T>,
	instanceField: FieldPath<T> = "instance" as FieldPath<T>,
) {
	const logger = useLogger("InstanceValidation");
	const [debounce, setDebounce] = React.useState<NodeJS.Timeout | null>(null);
	const [isCheckingInstance, setCheckingInstance] = React.useState(false);

	const handleInstanceChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			clearErrors(instanceField);
			setCheckingInstance(false);

			// Clear existing debounce
			if (debounce) clearTimeout(debounce);

			const doRequest = async () => {
				let instanceUrl = e.target.value;
				if (!instanceUrl.startsWith("http://") && !instanceUrl.startsWith("https://")) {
					instanceUrl = `http://${instanceUrl}`;
				}

				const url = getValidURL(instanceUrl);
				if (!url) {
					setError(instanceField, {
						type: "manual",
						message: "Invalid URL format",
					} as any);
					return;
				}
				setCheckingInstance(true);

				let endpoints: RouteSettings;
				try {
					endpoints = await REST.getEndpointsFromDomain(url);
				} catch (e) {
					return setError(instanceField, {
						type: "manual",
						message: (e instanceof Error && e.message) || "Instance could not be resolved",
					} as any);
				} finally {
					setCheckingInstance(false);
				}

				logger.debug(`Instance lookup has set routes to`, endpoints);
				Globals.routeSettings = endpoints;
				Globals.save();
			};

			setDebounce(setTimeout(doRequest, 500));
		},
		[debounce, setError, clearErrors, instanceField, logger],
	);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (debounce) clearTimeout(debounce);
		};
	}, [debounce]);

	return {
		handleInstanceChange,
		isCheckingInstance,
	};
}
