
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export default function BackButton({ fallbackPath = "/", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, go to fallback path (dashboard or home)
      router.push(fallbackPath);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleBack} 
      className={`flex items-center ${className}`}
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Back
    </Button>
  );
}
