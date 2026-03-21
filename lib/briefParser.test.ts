import { Flip } from '@reachdesign/flip'
import { parseReviewBriefJson } from '@/lib/briefParser'

describe('parseReviewBriefJson', () => {
  it('parses plain json', async () => {
    const result = await parseReviewBriefJson(
      '{"painPoints":["Delays"],"praiseThemes":["Support"],"urgentFlags":[],"summary":"Mixed sentiment.","reviewCount":5,"averageRating":3.2}',
    )

    expect(Flip.isOk(result)).toBe(true)
  })

  it('parses fenced or prefixed json', async () => {
    const result = await parseReviewBriefJson(`Here is the result:
\`\`\`json
{"painPoints":["Delays"],"praiseThemes":["Support"],"urgentFlags":[],"summary":"Mixed sentiment.","reviewCount":5,"averageRating":3.2}
\`\`\``)

    expect(Flip.isOk(result)).toBe(true)
  })
})
