import React from "react";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  gifUrl: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children, gifUrl }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: "10%",
      }}
    >
      {/* Background layer */}
      <div
        style={{
          backgroundImage: `url(${gifUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
      
      {/* Content layer */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};
