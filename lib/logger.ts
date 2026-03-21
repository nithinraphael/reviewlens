import pino from 'pino'

const kIsDevelopment = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (kIsDevelopment ? 'debug' : 'info'),
  base: {
    service: 'reviewlens',
    env: process.env.NODE_ENV ?? 'development',
  },
  transport: kIsDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
})

export const createRouteLogger = (route: string, requestId: string) =>
  logger.child({
    route,
    requestId,
  })
