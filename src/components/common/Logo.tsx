
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
  textOnly?: boolean;
}

export default function Logo({ 
  width = 40, 
  height = 40, 
  className = "", 
  showText = true,
  textOnly = false
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {!textOnly && <div style={{ width, height }} className="bg-primary/20 rounded-full" />}
        {showText && <div className="h-8 w-32 bg-primary/20 rounded" />}
      </div>
    );
  }
  
  const isDark = theme === "dark" || resolvedTheme === "dark";
  // Use the uploaded SVG icon
  const logoSrc = "/icon-s-blue-m8umsa8t.svg";
  
  if (textOnly) {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`text-2xl font-bold ${isDark ? "text-white" : "text-primary"}`}>
          StaffSpace
        </span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src={logoSrc} 
        alt="StaffSpace Logo" 
        width={width} 
        height={height} 
        className="transition-all duration-200"
      />
      {showText && (
        <span className={`text-xl font-bold ${isDark ? "text-white" : "text-primary"}`}>
          StaffSpace
        </span>
      )}
    </div>
  );
}
