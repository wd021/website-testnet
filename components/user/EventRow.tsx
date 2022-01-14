// import { ReactType } from 'react'
import addWeeks from 'date-fns/addWeeks'
import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'
import parseISO from 'date-fns/parseISO'
// import isDate from 'date-fns/isDate'

import { EventType, ApiEvent, ApiEventMetadata } from 'apiClient/index'

export function displayEventType(type: EventType): string {
  switch (type) {
    case 'BLOCK_MINED':
      return 'Mined a block'
    case 'BUG_CAUGHT':
      return 'Reported a bug'
    case 'COMMUNITY_CONTRIBUTION':
      return 'Contributed to the community'
    case 'PULL_REQUEST_MERGED':
      return 'Merged a pull request'
    case 'SOCIAL_MEDIA_PROMOTION':
      return 'Promoted testnet'
    default:
      return type
  }
}
export type EventRowProps = {
  id: number
  type: EventType
  occurred_at: string
  points: number
  metadata?: ApiEventMetadata
}

const makeLinkForEvent = (type: EventType, metadata?: ApiEventMetadata) => {
  if (metadata && metadata.hash && type === EventType.BLOCK_MINED) {
    return `https://explorer.ironfish.network/blocks/${metadata.hash}`
  }
}

const summarizeEvent = (
  type: EventType
  // metadata?: ApiEventMetadata
) => {
  if (type === EventType.BLOCK_MINED) {
    return 'View in the explorer'
    // return '...' + metadata.hash.slice(metadata.hash.length / 2, Infinity)
  } else if (type === EventType.PULL_REQUEST_MERGED) {
    return 'View pull request'
  }
}

export const EventRow = ({
  id,
  type,
  occurred_at: occurredAt,
  points,
  metadata,
}: EventRowProps) => {
  return (
    <tr key={id} className="border-b border-black">
      <td className="py-4">{displayEventType(type)}</td>
      <td>{new Date(occurredAt).toLocaleString()}</td>
      <td>{points}</td>
      <td>
        <a
          href={makeLinkForEvent(type, metadata)}
          className="text-ifblue border-b-ifblue"
        >
          {summarizeEvent(type)}
        </a>
      </td>
    </tr>
  )
}

type WeekRowProps = {
  date: Date
  week: number
}

const WeekRow = ({ date, week }: WeekRowProps) => (
  <tr className="bg-black text-white" data-date={date}>
    <td
      colSpan={4}
      className="text-center uppercase text-xs tracking-widest h-8"
    >
      Week {week}
    </td>
  </tr>
)

const weeksBetween = (start: Date, end: Date) => {
  if (isAfter(start, end)) {
    throw new Error(
      'Unable to create a valid week range, try weeksBetween(b, a) instead.'
    )
  }
  const weeks = []
  const offset = addWeeks(start, -1)
  let current = start
  while (isAfter(current, offset) && isBefore(current, end)) {
    weeks.push(current)
    current = addWeeks(current, 1)
  }
  return weeks
}

// type Predicate<T> = (x: T) => boolean

const eventsBetween = (
  start: Date,
  end: Date,
  events: ApiEvent[]
): ApiEvent[] =>
  events.filter(e => {
    const time = parseISO(e.occurred_at)
    return isAfter(time, start) && isBefore(time, end)
  })

// const eventsBefore = (a: Date, events: ApiEvent[]): ApiEvent[] =>
//   events.filter(e => isBefore(parseISO(e.occurred_at), a))

const makeCounter = () => {
  let x = 0
  return () => ++x
}

const sortEventsByDate = (xs: ApiEvent[]) =>
  xs.sort((a: ApiEvent, b: ApiEvent): number =>
    a.occurred_at > b.occurred_at ? 1 : -1
  )

type WeeklyData = {
  week: number
  date: Date
  events: ApiEvent[]
}

export const renderEvents = (start: Date, rawEvents: ApiEvent[]) => {
  const now = new Date()
  const weeksThisYear = weeksBetween(start, now)
  const counter = makeCounter()
  return (
    weeksThisYear
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((agg: any, date: Date) => {
        const prev = agg[agg.length - 1]
        return agg.concat({
          date,
          events: sortEventsByDate(
            eventsBetween(prev ? prev.date : start, date, rawEvents)
          ),
          week: counter(),
        })
      }, [])
      .map(({ date, week, events }: WeeklyData) => {
        return (
          events.length > 0 && (
            <>
              <WeekRow key={'' + date} week={week} date={date} />
              {events.map((e: ApiEvent) => (
                <EventRow {...e} key={e.id} />
              ))}
            </>
          )
        )
      })
  )
}
export default renderEvents
