import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ApplicationsSelectFilter() {
  return (
    <Select>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Filter by status' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All Applications</SelectItem>
        <SelectItem value='applied'>Applied</SelectItem>
        <SelectItem value='viewed'>Viewed</SelectItem>
        <SelectItem value='in_review'>In Review</SelectItem>
        <SelectItem value='interview_scheduled'>Interview Scheduled</SelectItem>
        <SelectItem value='offered'>Job Offered</SelectItem>
        <SelectItem value='rejected'>Not Selected</SelectItem>
        <SelectItem value='withdrawn'>Withdrawn</SelectItem>
      </SelectContent>
    </Select>
  );
}