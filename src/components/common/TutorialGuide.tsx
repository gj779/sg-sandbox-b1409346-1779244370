import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  targetElement?: string;
  image?: string;
}

interface TutorialGuideProps {
  steps: TutorialStep[];
  onComplete: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TutorialGuide({ 
  steps, 
  onComplete, 
  isOpen, 
  onOpenChange 
}: TutorialGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && steps[currentStep]?.targetElement) {
      try {
        const element = document.querySelector(steps[currentStep].targetElement!) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          element.classList.add('tutorial-highlight');
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (error) {
        console.error('Error finding tutorial target element:', error);
      }
    }

    return () => {
      if (highlightedElement) {
        try {
          highlightedElement.classList.remove('tutorial-highlight');
        } catch (error) {
          console.error('Error removing highlight class:', error);
        }
        setHighlightedElement(null);
      }
    };
  }, [currentStep, isOpen, steps, highlightedElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (highlightedElement) {
        highlightedElement.classList.remove("tutorial-highlight");
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      if (highlightedElement) {
        highlightedElement.classList.remove("tutorial-highlight");
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove("tutorial-highlight");
    }
    onComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove("tutorial-highlight");
    }
    onComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{steps[currentStep]?.title || 'Tutorial'}</DialogTitle>
          <DialogDescription>
            {steps[currentStep]?.description || 'Learn how to use the application.'}
          </DialogDescription>
        </DialogHeader>
        
        {steps[currentStep]?.image && (
          <div className='my-4'>
            <img 
              src={steps[currentStep].image} 
              alt={steps[currentStep].title || 'Tutorial step'} 
              className='rounded-md w-full'
            />
          </div>
        )}
        
        <DialogFooter className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}