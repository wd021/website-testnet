import { Element, Fragment, ReactType } from 'react'
import useClipboard from 'react-use-clipboard'
import {
  format,
  isBefore,
  isAfter,
  parseISO,
  eachWeekOfInterval,
} from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import ActivityBlockMined from 'components/icons/ActivityBlockMined'
import ActivityBugReported from 'components/icons/ActivityBugReport'
import ActivityPullRequest from 'components/icons/ActivityPullRequest'
import ActivityCopy from 'components/icons/ActivityCopy'

import { EventType, ApiEvent, ApiEventMetadata } from 'apiClient/index'
const NEEDS_ICON = '🤨'
export function displayEventType(type: EventType): Element {
  const text =
    type === 'BLOCK_MINED'
      ? 'Mined a block'
      : type === 'BUG_CAUGHT'
      ? 'Reported a bug'
      : type === 'COMMUNITY_CONTRIBUTION'
      ? 'Contributed to the community'
      : type === 'PULL_REQUEST_MERGED'
      ? 'Submitted a Pull Request'
      : type === 'SOCIAL_MEDIA_PROMOTION'
      ? 'Promoted testnet'
      : type
  const icon =
    type === 'BLOCK_MINED' ? (
      <ActivityBlockMined />
    ) : type === 'BUG_CAUGHT' ? (
      <ActivityBugReported />
    ) : type === 'COMMUNITY_CONTRIBUTION' ? (
      NEEDS_ICON
    ) : type === 'PULL_REQUEST_MERGED' ? (
      <ActivityPullRequest />
    ) : type === 'SOCIAL_MEDIA_PROMOTION' ? (
      NEEDS_ICON
    ) : (
      type
    )
  return (
    <div className="flex items-center justify-start">
      <span className="mr-2">{icon}</span>
      {text}
    </div>
  )
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

type CopyableHashProps = {
  hash: string
  children: Element
}

const CopyableHash = ({ hash, children }: CopyableHashProps) => {
  const [, setCopied] = useClipboard(hash, {
    successDuration: 1000,
  })
  return (
    <div
      onClick={e => {
        e.preventDefault()
        setCopied()
      }}
      className="flex items-center justify-center"
    >
      {children}
    </div>
  )
}

const summarizeEvent = (
  type: EventType,
  metadata: ApiEventMetadata
): Element => {
  if (type === EventType.BLOCK_MINED) {
    // return 'View in the explorer'
    const { hash } = metadata
    const hashLength = hash.length
    return (
      <CopyableHash hash={hash}>
        <>
          Block &hellip;{' '}
          {hash.slice(hashLength - Math.round(hashLength / 4), Infinity)}
          <ActivityCopy className="ml-1" />
        </>
      </CopyableHash>
    )
  } else if (type === EventType.PULL_REQUEST_MERGED) {
    return <>View pull request</>
  }
  return <>UNHANDLED TYPE</>
}

const formatEventDate = (d: Date) =>
  format(d, `do MMM. Y - kk':'mm':'ss`, {
    locale: enUS,
  })

export const EventRow = ({
  type,
  occurred_at: occurredAt,
  points,
  metadata,
}: EventRowProps) => {
  return (
    <tr className="border-b border-black">
      <td className="py-4">{displayEventType(type)}</td>
      <td>{formatEventDate(new Date(occurredAt))}</td>
      <td>{points}</td>
      <td>
        <a
          href={makeLinkForEvent(type, metadata)}
          className="text-iflightblue border-b-ifblue flex"
        >
          {summarizeEvent(type, metadata)}
        </a>
      </td>
    </tr>
  )
}

type WeekRowProps = {
  date: Date
  week: number
}

const WeekRow = ({ date, week }: WeekRowProps) => {
  const when = `Week ${week} - Started ${format(date, 'MMMM do, Y')}`
  return (
    <tr
      className="bg-black text-white"
      data-date={date}
      aria-text={when}
      title={when}
    >
      <td
        colSpan={4}
        className="text-center uppercase text-xs tracking-widest h-8"
      >
        Week {week}
      </td>
    </tr>
  )
}
const weeksBetween = (start: Date, end: Date) =>
  eachWeekOfInterval({ start, end })

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
      .map(
        ({ date, week, events }: WeeklyData) =>
          events.length > 0 && (
            <Fragment key={date.toTimeString() + week}>
              <WeekRow week={week} date={date} />
              {events.map((e: ApiEvent) => (
                <EventRow {...e} key={e.id} />
              ))}
            </Fragment>
          )
      )
  )
}
export default renderEvents
