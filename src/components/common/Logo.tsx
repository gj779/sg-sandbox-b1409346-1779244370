
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ width = 40, height = 40, className = "", showText = true }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div style={{ width, height }} className="bg-primary/20 rounded-full" />
        {showText && <span className="font-bold text-xl">StaffSpace</span>}
      </div>
    );
  }
  
  const isDark = theme === "dark" || resolvedTheme === "dark";
  const logoSrc = isDark ? "/images/logo-dark.svg" : "/images/logo.svg";
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src={logoSrc} 
        alt="StaffSpace Logo" 
        width={width} 
        height={height} 
        className="transition-all duration-200"
      />
      {showText && <span className="font-bold text-xl">StaffSpace</span>}
    </div>
  );
}
