import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { AnalystMode, ReviewBrief, TrustpilotReview } from '@/types'

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingRight: 32,
    paddingBottom: 28,
    paddingLeft: 32,
    backgroundColor: '#ffffff',
    color: '#111111',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  reportMeta: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1 solid #111111',
    borderBottom: '1 solid #111111',
    paddingTop: 6,
    paddingBottom: 6,
  },
  metaItem: {
    width: '32%',
  },
  metaLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#333333',
  },
  metaValue: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: 600,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 700,
    paddingBottom: 4,
    borderBottom: '1 solid #111111',
  },
  paragraph: {
    marginTop: 8,
    lineHeight: 1.45,
    color: '#1f1f1f',
  },
  statGrid: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    borderTop: '1 solid #222222',
    borderLeft: '1 solid #222222',
  },
  statCell: {
    width: '33.333%',
    borderRight: '1 solid #222222',
    borderBottom: '1 solid #222222',
    padding: 8,
  },
  statLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#333333',
    letterSpacing: 0.8,
  },
  statValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 700,
  },
  twoCol: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  column: {
    flex: 1,
    border: '1 solid #222222',
    padding: 8,
  },
  columnTitle: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: 700,
    borderBottom: '1 solid #222222',
    paddingBottom: 4,
  },
  bulletItem: {
    marginTop: 5,
    lineHeight: 1.4,
  },
  tableHeader: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    borderTop: '1 solid #222222',
    borderLeft: '1 solid #222222',
    borderRight: '1 solid #222222',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: 700,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderLeft: '1 solid #222222',
    borderRight: '1 solid #222222',
    borderBottom: '1 solid #222222',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cellAuthor: {
    width: '22%',
    paddingRight: 4,
  },
  cellRating: {
    width: '12%',
    paddingRight: 4,
  },
  cellDate: {
    width: '16%',
    paddingRight: 4,
  },
  cellPreview: {
    width: '50%',
  },
  transcriptRow: {
    marginTop: 8,
    border: '1 solid #222222',
    padding: 8,
  },
  transcriptRole: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: 700,
  },
  transcriptText: {
    marginTop: 4,
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 14,
    borderTop: '1 solid #111111',
    paddingTop: 6,
    fontSize: 8,
    color: '#444444',
  },
})

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const getSafeNumber = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback

const renderList = (items: readonly string[]) =>
  items.length > 0 ? items : ['No items available']

const getPreview = ({ title, body }: TrustpilotReview) => {
  const source = (title || body || '').replace(/\s+/g, ' ').trim()
  if (!source) return 'N/A'
  return source.length > 140 ? `${source.slice(0, 140)}...` : source
}

const toDisplayRating = (rating: number) => `${getSafeNumber(rating, 0).toFixed(1).replace(/\.0$/, '')}/5`

const kMaxReviewsInExport = 25
const kMaxMessagesInExport = 20

export const BExportDocument = ({
  brief,
  messages,
  mode,
  reviews,
}: {
  brief: ReviewBrief
  messages: readonly { readonly role: string; readonly content: string }[]
  mode: AnalystMode
  reviews: readonly TrustpilotReview[]
}) => (
  <Document title="ReviewLens Standard Report">
    <Page size="A4" style={styles.page}>
      <Text style={styles.reportTitle}>Customer Review Analysis Report</Text>
      <View style={styles.reportMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Report date</Text>
          <Text style={styles.metaValue}>{formatDate(new Date().toISOString())}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Mode</Text>
          <Text style={styles.metaValue}>{mode.toUpperCase()}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Sample size</Text>
          <Text style={styles.metaValue}>{reviews.length} reviews</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Executive summary</Text>
        <Text style={styles.paragraph}>{brief.summary || 'Summary not available.'}</Text>
        <View style={styles.statGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Review count</Text>
            <Text style={styles.statValue}>{getSafeNumber(brief.reviewCount, reviews.length)}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Average rating</Text>
            <Text style={styles.statValue}>{getSafeNumber(brief.averageRating, 0).toFixed(1)}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Urgent flags</Text>
            <Text style={styles.statValue}>{brief.urgentFlags.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Key findings</Text>
        <View style={styles.twoCol}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Pain points</Text>
            {renderList(brief.painPoints).map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.bulletItem}>
                • {item}
              </Text>
            ))}
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Praise themes</Text>
            {renderList(brief.praiseThemes).map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.bulletItem}>
                • {item}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Urgent flags</Text>
          {renderList(brief.urgentFlags).map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.bulletItem}>
              • {item}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Review sample</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.cellAuthor}>Author</Text>
          <Text style={styles.cellRating}>Rating</Text>
          <Text style={styles.cellDate}>Date</Text>
          <Text style={styles.cellPreview}>Review excerpt</Text>
        </View>
        {reviews.slice(0, kMaxReviewsInExport).map((review) => (
          <View key={review.id} style={styles.tableRow}>
            <Text style={styles.cellAuthor}>{review.author || 'N/A'}</Text>
            <Text style={styles.cellRating}>{toDisplayRating(review.rating)}</Text>
            <Text style={styles.cellDate}>{formatDate(review.date)}</Text>
            <Text style={styles.cellPreview}>{getPreview(review)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Analyst transcript (optional)</Text>
        {messages.length > 0 ? (
          messages.slice(0, kMaxMessagesInExport).map(({ role, content }, index) => (
            <View key={`${role}-${index}`} style={styles.transcriptRow}>
              <Text style={styles.transcriptRole}>{role === 'user' ? 'Analyst' : 'Assistant'}</Text>
              <Text style={styles.transcriptText}>{content || 'N/A'}</Text>
            </View>
          ))
        ) : (
          <View style={styles.transcriptRow}>
            <Text style={styles.transcriptText}>No transcript entries available.</Text>
          </View>
        )}
      </View>

      <Text style={styles.footer}>Generated by ReviewLens · Standardized industrial report layout</Text>
    </Page>
  </Document>
)
