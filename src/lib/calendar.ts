import { supabase } from './supabase';

// VERVANG DIT DOOR JOUW EFFECTIEVE ID
const FAMILY_CALENDAR_ID = 'family17033390667928334518@group.calendar.google.com';

export const getCalendarEvents = async (date: string) => {
  const { data: { session } } = await (supabase.auth as any).getSession();
  const token = session?.provider_token;
  if (!token) return [];

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(FAMILY_CALENDAR_ID)}/events`);
  url.searchParams.set('timeMin', startOfDay.toISOString());
  url.searchParams.set('timeMax', endOfDay.toISOString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  return data.items || [];
};

export const addCalendarEvent = async (summary: string, start: string, end: string) => {
  const { data: { session } } = await (supabase.auth as any).getSession();
  const token = session?.provider_token;

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(FAMILY_CALENDAR_ID)}/events`,
    {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        summary,
        start: { dateTime: start, timeZone: 'Europe/Brussels' },
        end: { dateTime: end, timeZone: 'Europe/Brussels' }
      })
    }
  );
  return res.ok;
};