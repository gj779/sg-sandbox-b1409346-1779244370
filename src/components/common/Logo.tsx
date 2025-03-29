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
  const logoSrc = isDark ? "/images/logo-dark.svg" : "/images/logo.svg";
  const textLogoSrc = isDark ? "/images/staffspace-text-dark.svg" : "/images/staffspace-text-light.svg";
  
  if (textOnly) {
    return (
      <div className={`flex items-center ${className}`}>
        <Image 
          src={textLogoSrc} 
          alt="StaffSpace" 
          width={180} 
          height={40} 
          className="transition-all duration-200"
        />
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
        <Image 
          src={textLogoSrc} 
          alt="StaffSpace" 
          width={120} 
          height={30} 
          className="transition-all duration-200"
        />
      )}
    </div>
  );
}