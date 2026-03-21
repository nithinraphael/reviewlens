import { Flip } from '@reachdesign/flip'
import { NextResponse } from 'next/server'
import { parseJson } from '@/lib/json'
import { createRouteLogger } from '@/lib/logger'
import { getUIMessageText } from '@/lib/messages'
import type { ExportRequestBody } from '@/types'
import { BExportDocument } from '@/lib/exportPdf'

export const runtime = 'nodejs'

export const POST = async (request: Request) => {
  const requestId = crypto.randomUUID()
  const requestLogger = createRouteLogger('/api/export', requestId)
  const startedAt = Date.now()

  requestLogger.info({ event: 'request_received' }, 'Incoming export request')
  const body = await request.text().then((value) => parseJson<ExportRequestBody>(value))
  if (Flip.isErr(body)) {
    requestLogger.warn({ event: 'invalid_request_body' }, 'Export request body was invalid')
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { brief, messages, mode, reviews } = Flip.v(body)
  const reactPdf = await import('@react-pdf/renderer').catch(() => null)
  if (!reactPdf) {
    requestLogger.error({ event: 'renderer_import_failed' }, 'Failed to load React PDF renderer')
    return NextResponse.json({ error: 'Unable to load PDF renderer.' }, { status: 500 })
  }

  try {
    const document = BExportDocument({
      brief,
      messages: messages.map((message) => ({
        role: message.role,
        content: getUIMessageText(message),
      })),
      mode,
      reviews,
    })
    const stream = await reactPdf.renderToStream(document)

    requestLogger.info(
      { event: 'request_completed', durationMs: Date.now() - startedAt, reviewCount: reviews.length },
      'Export request completed',
    )

    return new NextResponse(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="review-analysis.pdf"',
      },
    })
  } catch (error: unknown) {
    requestLogger.error(
      { event: 'request_failed', error: error instanceof Error ? error.message : 'Unknown export error' },
      'Export request failed',
    )
    return NextResponse.json({ error: 'Unable to generate PDF export.' }, { status: 500 })
  }
}
