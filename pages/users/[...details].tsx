import { useCallback, useEffect, useState } from 'react'
import Router, { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import Head from 'next/head'

import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import Loader from 'components/Loader'
import { Container as OffsetBorderContainer } from 'components/OffsetBorder'
import EventsPaginationButton from 'components/user/EventsPaginationButton'
import FishAvatar from 'components/user/FishAvatar'
import Flag from 'components/user/Flag'
import Tabs, { TabType } from 'components/user/Tabs'
import usePaginatedEvents from 'hooks/usePaginatedEvents'
import { encode as btoa } from 'base-64'

import * as API from 'apiClient'
import { graffitiToColor, numberToOrdinal } from 'utils'
import { LoginContext } from 'hooks/useLogin'
import { useQueriedToast, Toast, Alignment } from 'hooks/useToast'
// const API = {}

// The number of events to display in the Recent Activity list.
const EVENTS_LIMIT = 7

const validTabValue = (x: string) =>
  x === 'weekly' || x === 'all' || x === 'settings'

export const getServerSideProps: GetServerSideProps =
  async function getServerSideProps(context) {
    const { params = {} } = context
    const { details = [] } = params
    const [userId, tab] = details as string[]
    if (isNaN(parseInt(userId))) {
      return {
        redirect: {
          destination: `/leaderboard?toast=${btoa('Unable to find that user')}`,
          permanent: true,
        },
      }
    }
    if (tab && !validTabValue(tab)) {
      return {
        redirect: {
          destination: `/users/${userId}`,
          permanent: false,
        },
      }
    }
    return { props: {} }
  }

interface Props {
  loginContext: LoginContext
}

function displayEventType(type: API.EventType): string {
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

export default function User({ loginContext }: Props) {
  const $toast = useQueriedToast({
    queryString: 'toast',
    duration: 8e3,
  })

  const router = useRouter()
  const { query = {}, isReady: routerIsReady } = router
  const { details: queryDetails = [] } = query
  const [userId, tab] = queryDetails as string[]

  const rawTab = !tab ? 'weekly' : (tab as TabType)
  const [$activeTab, $setActiveTab] = useState<TabType>(rawTab)

  const [$user, $setUser] = useState<API.ApiUser | undefined>(undefined)
  const [$events, $setEvents] = useState<API.ListEventsResponse | undefined>(
    undefined
  )
  const [$allTimeMetrics, $setAllTimeMetrics] = useState<
    API.UserMetricsResponse | undefined
  >(undefined)
  const [$weeklyMetrics, $setWeeklyMetrics] = useState<
    API.UserMetricsResponse | undefined
  >(undefined)
  const [$metricsConfig, $setMetricsConfig] = useState<
    API.MetricsConfigResponse | undefined
  >(undefined)
  const [$fetched, $setFetched] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      try {
        if (!routerIsReady || $fetched) {
          // console.log($fetched ? 'fetched already' : 'no router yet')
          // eslint-disable-next-line no-console
          console.log('no router yet')
          return
        }
        // eslint-disable-next-line no-console
        console.log('requesting data')
        const [user, events, allTimeMetrics, weeklyMetrics, metricsConfig] =
          await Promise.all([
            API.getUser(userId),
            API.listEvents({
              userId,
              limit: EVENTS_LIMIT,
            }),
            API.getUserAllTimeMetrics(userId),
            API.getUserWeeklyMetrics(userId),
            API.getMetricsConfig(),
          ])

        if (isCancelled) {
          return
        }

        if (
          'error' in user ||
          'error' in events ||
          'error' in allTimeMetrics ||
          'error' in weeklyMetrics ||
          'error' in metricsConfig
        ) {
          Router.push(
            `/leaderboard?toast=${btoa(
              'An error occurred while fetching user data'
            )}`
          )
          return
        }

        // eslint-disable-next-line no-console
        console.log('no errors!')
        $setUser(user)
        $setEvents(events)
        $setAllTimeMetrics(allTimeMetrics)
        $setWeeklyMetrics(weeklyMetrics)
        $setMetricsConfig(metricsConfig)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)

        throw e
      }
    }

    fetchData()
    return () => {
      isCancelled = true
    }
  }, [
    routerIsReady,
    userId,
    $toast,
    loginContext?.metadata?.id,
    loginContext?.metadata?.graffiti,
    $fetched,
  ])
  useEffect(() => {
    if (!$user) return
    $setFetched(true)
  }, [$user])

  // Recent Activity hooks
  const { $hasPrevious, $hasNext, fetchPrevious, fetchNext } =
    usePaginatedEvents(userId, EVENTS_LIMIT, $events, $setEvents)

  // Tab hooks
  const onTabChange = useCallback((t: TabType) => {
    $setActiveTab(t)
  }, [])

  if (
    !$user ||
    !$allTimeMetrics ||
    !$metricsConfig ||
    !$weeklyMetrics ||
    !$events
  ) {
    return <Loader />
  }

  const avatarColor = graffitiToColor($user.graffiti)
  const ordinalRank = numberToOrdinal($user.rank)

  const totalWeeklyLimit = Object.values($metricsConfig.weekly_limits).reduce(
    (acc, cur) => acc + cur,
    0
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{$user.graffiti}</title>
        <meta name="description" content={String($user.graffiti)} />
      </Head>

      <Navbar
        loginContext={loginContext}
        fill="black"
        className="bg-ifpink text-black"
      />

      <main className="bg-ifpink flex-1 justify-center flex pt-16 pb-32">
        <div style={{ flexBasis: 1138 }}>
          <OffsetBorderContainer>
            <div className="px-24 pt-16 pb-12">
              {/* Header */}
              <div
                className="flex justify-between mb-8"
                style={{ width: '100%' }}
              >
                <div>
                  <h1 className="font-extended text-6xl mt-6 mb-8">
                    {$user.graffiti}
                  </h1>

                  <div className="font-favorit flex flex-wrap gap-x-16 gap-y-2">
                    <div>
                      <div>All Time Rank</div>
                      <div className="text-3xl mt-2">{ordinalRank}</div>
                    </div>
                    <div>
                      <div>Total Points</div>
                      <div className="text-3xl mt-2">
                        {$user.total_points.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div>Weekly Points</div>
                      <div className="text-3xl mt-2">
                        {$weeklyMetrics.points.toLocaleString()} /{' '}
                        {totalWeeklyLimit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <FishAvatar color={avatarColor} />
                  <div className="mt-4">
                    <Flag code={$user.country_code} />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs
                reloadUser={loginContext.reloadUser}
                toast={$toast}
                activeTab={$activeTab}
                onTabChange={onTabChange}
                user={$user}
                authedUser={loginContext.metadata}
                allTimeMetrics={$allTimeMetrics}
                weeklyMetrics={$weeklyMetrics}
                metricsConfig={$metricsConfig}
              />

              {/* Recent Activity */}
              {$activeTab !== 'settings' && (
                <>
                  <h1 className="font-favorit">Recent Activity</h1>

                  <table className="font-favorit w-full">
                    <thead>
                      <tr className="text-xs text-left tracking-widest border-b border-black">
                        <th className="font-normal py-4">ACTIVITY</th>
                        <th className="font-normal">DATE</th>
                        <th className="font-normal">POINTS EARNED</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {$events.data.map(e => (
                        <tr key={e.id} className="border-b border-black">
                          <td className="py-4">{displayEventType(e.type)}</td>
                          <td>{new Date(e.occurred_at).toLocaleString()}</td>
                          <td>{e.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </OffsetBorderContainer>
          {/* Recent Activity Pagination */}
          {$activeTab !== 'settings' && (
            <div className="flex font-favorit justify-center mt-8">
              <div className="flex gap-x-1.5">
                <EventsPaginationButton
                  disabled={!$hasPrevious}
                  onClick={fetchPrevious}
                >{`<< Previous`}</EventsPaginationButton>
                <div>{`|`}</div>
                <EventsPaginationButton
                  disabled={!$hasNext}
                  onClick={fetchNext}
                >{`Next >>`}</EventsPaginationButton>
              </div>
            </div>
          )}
        </div>
      </main>
      <Toast
        message={$toast.message}
        visible={$toast.visible}
        alignment={Alignment.Top}
      />
      <Footer />
    </div>
  )
}
