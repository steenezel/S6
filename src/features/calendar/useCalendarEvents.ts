import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { fetchCalendarEvents, type CalendarEvent } from '../../lib/calendar'

type UseCalendarEventsOptions = {
  calendarId: string
  maxResults?: number
}

export const useCalendarEvents = ({
  calendarId,
  maxResults = 10,
}: UseCalendarEventsOptions): UseQueryResult<CalendarEvent[]> => {
  return useQuery({
    queryKey: ['calendarEvents', calendarId, maxResults],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const accessToken = session?.provider_token

      if (!session || !accessToken) {
        throw new Error('Geen geldige Google OAuth sessie gevonden.')
      }

      return fetchCalendarEvents({
        accessToken,
        calendarId,
        maxResults,
      })
    },
  })
}

