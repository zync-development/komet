import React, { createContext, useContext, useEffect, useState } from 'react';
import { isMobile, isTablet } from 'react-device-detect';

interface MobileContextType {
	isMobile: boolean;
	isTablet: boolean;
	isSmallScreen: boolean;
	isMediumScreen: boolean;
	isLargeScreen: boolean;
	screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	orientation: 'portrait' | 'landscape';
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const useMobile = () => {
	const context = useContext(MobileContext);
	if (!context) {
		throw new Error('useMobile must be used within a MobileProvider');
	}
	return context;
};

interface MobileProviderProps {
	children: React.ReactNode;
}

export const MobileProvider: React.FC<MobileProviderProps> = ({ children }) => {
	const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
	const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

	useEffect(() => {
		const updateScreenSize = () => {
			const width = window.innerWidth;
			if (width < 480) setScreenSize('xs');
			else if (width < 768) setScreenSize('sm');
			else if (width < 1024) setScreenSize('md');
			else if (width < 1440) setScreenSize('lg');
			else setScreenSize('xl');
		};

		const updateOrientation = () => {
			setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
		};

		updateScreenSize();
		updateOrientation();

		window.addEventListener('resize', () => {
			updateScreenSize();
			updateOrientation();
		});

		window.addEventListener('orientationchange', updateOrientation);

		return () => {
			window.removeEventListener('resize', updateScreenSize);
			window.removeEventListener('orientationchange', updateOrientation);
		};
	}, []);

	const value: MobileContextType = {
		isMobile: isMobile || window.innerWidth < 768,
		isTablet: isTablet || (window.innerWidth >= 768 && window.innerWidth < 1024),
		isSmallScreen: window.innerWidth < 768,
		isMediumScreen: window.innerWidth >= 768 && window.innerWidth < 1024,
		isLargeScreen: window.innerWidth >= 1024,
		screenSize,
		orientation,
	};

	return (
		<MobileContext.Provider value={value}>
			{children}
		</MobileContext.Provider>
	);
};
