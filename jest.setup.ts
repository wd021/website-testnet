import { jest } from '@jest/globals'
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => {
    return 'image'
  },
}))

/*
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
    }
  },
}))
*/
