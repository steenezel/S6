import { useQuery } from '@tanstack/react-query'
import { getCalendarEvents } from '../../lib/calendar'

// We definiëren het type hier direct om import-fouten te voorkomen
export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  description?: string;
}

export const useCalendarEvents = (date: string) => {
  return useQuery({
    queryKey: ['calendar-events', date],
    queryFn: () => getCalendarEvents(date),
    // We houden de data 5 minuten vast voordat we op de achtergrond verversen
    staleTime: 1000 * 60 * 5,
  })
}