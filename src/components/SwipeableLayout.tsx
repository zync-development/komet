import { useWindowSize } from "@uidotdev/usehooks";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { animated, config, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";
import styled from "styled-components";

const Container = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
`;

const Sidebar = styled(animated.div)`
	position: absolute;
	top: 0;
	left: 0;
	width: 80%;
	height: 100%;
	z-index: 10;
	background: var(--background-primary);
	border-right: 1px solid var(--background-tertiary);
	box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled(animated.div)`
	position: relative;
	width: 100%;
	height: 100%;
	background: var(--background-primary);
`;

const Overlay = styled(animated.div)`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 5;
	pointer-events: none;
`;

const SwipeIndicator = styled.div<{ $visible: boolean }>`
	position: absolute;
	top: 50%;
	left: 8px;
	transform: translateY(-50%);
	width: 4px;
	height: 40px;
	background: var(--brand-560);
	border-radius: 2px;
	opacity: ${props => props.$visible ? 1 : 0};
	transition: opacity 0.3s ease;
	z-index: 15;
	pointer-events: none;
`;

interface Props {
	leftChildren: React.ReactNode;
	rightChildren?: React.ReactNode;
	children: React.ReactNode;
}

function SwipeableLayout({ leftChildren, children }: Props) {
	const size = useWindowSize();
	const [isOpen, setIsOpen] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	
	// Calculate sidebar width (80% of screen width, max 320px)
	const sidebarWidth = Math.min(size.width! * 0.8, 320);
	
	// Spring animation for smooth transitions
	const [{ x }, api] = useSpring(() => ({
		x: 0,
		config: {
			tension: 300,
			friction: 30,
			mass: 0.8,
		},
	}));

	// Overlay opacity animation
	const overlayOpacity = x.to([0, sidebarWidth], [0, 0.3]);

	// Open sidebar with smooth animation
	const openSidebar = useCallback(() => {
		api.start({
			x: sidebarWidth,
			config: config.gentle,
		});
		setIsOpen(true);
	}, [api, sidebarWidth]);

	// Close sidebar with smooth animation
	const closeSidebar = useCallback(() => {
		api.start({
			x: 0,
			config: config.gentle,
		});
		setIsOpen(false);
	}, [api]);

	// Handle drag gestures
	const bind = useDrag(
		({ 
			last, 
			velocity: v, 
			direction: [dx], 
			offset: [ox], 
			cancel, 
			canceled,
			first,
			moving,
			down
		}) => {
			// Start dragging
			if (first) {
				setIsDragging(true);
			}

			// Update position while dragging
			if (moving) {
				api.start({ x: Math.max(0, ox), immediate: true });
			}

			// Handle release
			if (last) {
				setIsDragging(false);
				
				const velocity = Math.abs(v);
				const threshold = sidebarWidth * 0.3; // 30% threshold
				
				// Determine whether to open or close based on position and velocity
				if (ox > threshold || (ox > sidebarWidth * 0.1 && velocity > 0.5)) {
					// Open sidebar
					api.start({
						x: sidebarWidth,
						config: {
							tension: 300,
							friction: 30,
							mass: 0.8,
						},
					});
					setIsOpen(true);
				} else {
					// Close sidebar
					api.start({
						x: 0,
						config: {
							tension: 300,
							friction: 30,
							mass: 0.8,
						},
					});
					setIsOpen(false);
				}
			}
		},
		{
			from: () => [x.get(), 0],
			filterTaps: true,
			bounds: { left: 0, right: sidebarWidth },
			rubberband: true,
			axis: "x",
			threshold: 10, // Minimum distance to start dragging
		},
	);

	// Handle resize
	useEffect(() => {
		if (size.width) {
			const newSidebarWidth = Math.min(size.width * 0.8, 320);
			if (isOpen && x.get() > 0) {
				api.start({ x: newSidebarWidth, immediate: true });
			}
		}
	}, [size.width, isOpen, api]);

	// Close sidebar when clicking overlay
	const handleOverlayClick = useCallback(() => {
		closeSidebar();
	}, [closeSidebar]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				closeSidebar();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, closeSidebar]);

	// Add touch-friendly swipe area on the left edge
	const leftSwipeArea = (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '20px',
				height: '100%',
				zIndex: 20,
				cursor: 'pointer',
			}}
			onClick={() => !isOpen && openSidebar()}
		/>
	);

	return (
		<Container ref={containerRef}>
			{/* Sidebar */}
			<Sidebar style={{ width: sidebarWidth }}>
				{leftChildren}
			</Sidebar>

			{/* Main content with drag gesture */}
			<MainContent {...bind()} style={{ x }}>
				{children}
			</MainContent>

			{/* Overlay when sidebar is open */}
			<Overlay 
				style={{ 
					opacity: overlayOpacity,
					pointerEvents: isOpen ? 'auto' : 'none'
				}}
				onClick={handleOverlayClick}
			/>

			{/* Swipe indicator */}
			<SwipeIndicator $visible={!isOpen && !isDragging} />

			{/* Left edge swipe area */}
			{leftSwipeArea}
		</Container>
	);
}

export default SwipeableLayout;
