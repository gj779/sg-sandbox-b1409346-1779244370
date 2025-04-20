
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Building, MessageSquare, Video, Phone } from "lucide-react";
import Link from "next/link";

// Mock data for upcoming interviews
const mockInterviews = [
  {
    id: "int1",
    jobTitle: "Head Chef",
    restaurantName: "La Bistro Restaurant",
    location: "New York, NY",
    date: new Date("2025-04-05T14:00:00"),
    type: "in-person",
    notes: "Bring your portfolio and be prepared to discuss your experience with French cuisine."
  },
  {
    id: "int2",
    jobTitle: "Bartender",
    restaurantName: "The Speakeasy",
    location: "Chicago, IL",
    date: new Date("2025-04-07T16:30:00"),
    type: "video",
    notes: "Prepare to demonstrate your mixology skills and knowledge of classic cocktails."
  },
  {
    id: "int3",
    jobTitle: "Server",
    restaurantName: "Oceanview Grill",
    location: "Miami, FL",
    date: new Date("2025-04-10T11:00:00"),
    type: "phone",
    notes: "Initial phone screening to discuss your experience and availability."
  }
];

interface UpcomingInterviewsProps {
  userType: "applicant" | "restaurant";
}

export default function UpcomingInterviews({ userType }: UpcomingInterviewsProps) {
  const [interviews, setInterviews] = useState(mockInterviews);

  // Format date for display with error handling
  const formatDate = (date: Date) => {
    try {
      // Ensure date is valid before formatting
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format time for display with error handling
  const formatTime = (date: Date) => {
    try {
      // Ensure date is valid before formatting
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  // Get interview type badge
  const getInterviewTypeBadge = (type: string) => {
    switch (type) {
      case "in-person":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300">In Person</Badge>;
      case "video":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300">Video Call</Badge>;
      case "phone":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300">Phone</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get interview type icon
  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "in-person":
        return <Building className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>
          Your scheduled interviews for the next 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {interviews.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium mb-2">No Upcoming Interviews</h3>
            <p className="text-muted-foreground text-sm">
              {userType === "applicant" 
                ? "You don't have any interviews scheduled. Keep applying to jobs!" 
                : "You don't have any interviews scheduled. Post a job to find candidates!"}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {interviews.map((interview) => (
              <div key={interview.id} className='border rounded-lg p-4'>
                <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{interview.jobTitle}</h3>
                      {getInterviewTypeBadge(interview.type)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{interview.restaurantName}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        {formatDate(interview.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {formatTime(interview.date)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1.5 h-4 w-4" />
                        {interview.location}
                      </div>
                    </div>
                    {interview.notes && (
                      <div className="mt-2 text-sm bg-muted p-2 rounded">
                        <p>{interview.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className='flex flex-row md:flex-row gap-2 mt-2 md:mt-0 justify-start md:justify-end'>
                    <Button variant='outline' size='sm' asChild>
                      <Link href={`/messaging?conversation=${interview.restaurantName}`}>
                        <MessageSquare className='h-4 w-4 mr-1' />
                        Message
                      </Link>
                    </Button>
                    {interview.type !== 'in-person' && (
                      <Button size='sm' asChild>
                        <Link href='#'>
                          {getInterviewTypeIcon(interview.type)}
                          <span className='ml-1'>
                            {interview.type === 'video' ? 'Join Call' : 'Call'}
                          </span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant='outline' className='w-full' asChild>
          <Link href='/interviews'>
            <Calendar className='mr-2 h-4 w-4' />
            View All Scheduled Interviews
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
