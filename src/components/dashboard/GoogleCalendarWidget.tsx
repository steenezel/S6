import { CalendarDays, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCalendarEvents } from '../../features/calendar/useCalendarEvents'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

const FAMILY_CALENDAR_ID =
  'family17033390667928334518@group.calendar.google.com'

export const GoogleCalendarWidget = () => {
  const { data, isLoading, isError } = useCalendarEvents({
    calendarId: FAMILY_CALENDAR_ID,
    maxResults: 10,
  })

  const events = (data ?? []).slice(0, 3)

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl">
      <div className="p-4 pb-2 flex items-center gap-2">
        <div className="h-8 w-8 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center">
          <CalendarDays className="h-4 w-4 text-sky-300" />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-50">
            Eerstvolgende afspraken
          </h2>
          <p className="text-xs text-slate-400">
            Gezinagenda (Google Calendar, Supabase OAuth).
          </p>
        </div>
      </div>

      <div className="px-4 pb-3 pt-1">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-3"
              >
                <Skeleton className="h-3 w-28 mb-2 bg-slate-800/80" />
                <Skeleton className="h-3 w-40 bg-slate-800/80" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="text-[11px] text-slate-500 rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2">
            Kon Google Calendar niet laden. Zorg dat je bent ingelogd via Google
            in Supabase.
          </p>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <p className="text-[11px] text-slate-500 rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2">
            Geen komende events gevonden in de family calendar.
          </p>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <motion.ul
            className="space-y-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {events.map((event) => {
              const startDate = new Date(event.start)
              const dateLabel = startDate.toLocaleDateString('nl-BE', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })
              const timeLabel = startDate.toLocaleTimeString('nl-BE', {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <li
                  key={event.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2.5 text-xs text-slate-200 flex items-start gap-3"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase tracking-wide text-sky-300">
                      {dateLabel}
                    </span>
                    <span className="text-[11px] text-slate-400">{timeLabel}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-slate-50 truncate">
                      {event.summary}
                    </p>
                    {event.location && (
                      <p className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </motion.ul>
        )}
      </div>
    </Card>
  )
}

