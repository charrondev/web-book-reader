/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SettingsImport } from './routes/settings'
import { Route as DiscoverImport } from './routes/discover'
import { Route as BooksImport } from './routes/books'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const SettingsRoute = SettingsImport.update({
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any)

const DiscoverRoute = DiscoverImport.update({
  path: '/discover',
  getParentRoute: () => rootRoute,
} as any)

const BooksRoute = BooksImport.update({
  path: '/books',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/books': {
      preLoaderRoute: typeof BooksImport
      parentRoute: typeof rootRoute
    }
    '/discover': {
      preLoaderRoute: typeof DiscoverImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  BooksRoute,
  DiscoverRoute,
  SettingsRoute,
])

/* prettier-ignore-end */
