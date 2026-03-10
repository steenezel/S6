export type CalendarEvent = {
  id: string
  summary: string
  description?: string
  start: string
  end: string
  location?: string
}

type GoogleCalendarEvent = {
  id: string
  summary?: string
  description?: string
  location?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

type GoogleCalendarResponse = {
  items?: GoogleCalendarEvent[]
}

export async function fetchCalendarEvents(params: {
  accessToken: string
  calendarId: string
  maxResults?: number
}): Promise<CalendarEvent[]> {
  const { accessToken, calendarId, maxResults = 10 } = params

  const timeMin = new Date().toISOString()
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  )

  url.searchParams.set('maxResults', String(maxResults))
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('timeMin', timeMin)

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Google Calendar request failed: ${res.status}`)
  }

  const data = (await res.json()) as GoogleCalendarResponse
  const items = data.items ?? []

  return items.map((item) => {
    const start =
      item.start?.dateTime ??
      (item.start?.date ? `${item.start.date}T00:00:00Z` : new Date().toISOString())
    const end =
      item.end?.dateTime ??
      (item.end?.date ? `${item.end.date}T23:59:59Z` : new Date().toISOString())

    return {
      id: item.id,
      summary: item.summary ?? 'Geen titel',
      description: item.description,
      start,
      end,
      location: item.location,
    }
  })
}

