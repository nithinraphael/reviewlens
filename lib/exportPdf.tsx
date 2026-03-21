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
    padding: 28,
    backgroundColor: '#f6f4ef',
    color: '#121212',
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    border: '1 solid #e7e2d8',
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#7c766f',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 700,
  },
  heroRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  chips: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    backgroundColor: '#f8f6f1',
    borderRadius: 12,
    padding: 12,
    minWidth: 90,
  },
  chipLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#7c766f',
    letterSpacing: 1.5,
  },
  chipValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 4,
  },
  summary: {
    marginTop: 10,
    color: '#4b4741',
    lineHeight: 1.6,
  },
  twoCol: {
    display: 'flex',
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
  },
  panel: {
    flex: 1,
    backgroundColor: '#fbfaf7',
    borderRadius: 12,
    padding: 14,
    border: '1 solid #ebe6dc',
  },
  listItem: {
    color: '#4b4741',
    lineHeight: 1.6,
    marginTop: 6,
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f8f6f1',
    borderBottom: '1 solid #ebe6dc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#7c766f',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '1 solid #f0ebe2',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  colAuthor: { width: '24%' },
  colRating: { width: '14%' },
  colDate: { width: '18%' },
  colPreview: { width: '44%' },
  messageList: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  message: {
    borderRadius: 12,
    border: '1 solid #ebe6dc',
    padding: 12,
    backgroundColor: '#ffffff',
  },
  userMessage: {
    backgroundColor: '#121212',
    color: '#ffffff',
    border: '1 solid #121212',
  },
  messageRole: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.6,
    marginBottom: 6,
  },
  empty: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: '1 dashed #d8d1c6',
    color: '#7c766f',
  },
})

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const renderList = (items: readonly string[]) =>
  items.length > 0 ? items : ['No items available']

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
  <Document title="ReviewLens Export">
    <Page size="A4" style={styles.page}>
      <View style={styles.stack}>
        <View style={styles.card}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.eyebrow}>ReviewLens Export</Text>
              <Text style={styles.heroTitle}>Review intelligence report</Text>
            </View>
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Mode</Text>
                <Text style={styles.chipValue}>{mode}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Reviews</Text>
                <Text style={styles.chipValue}>{reviews.length}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Avg rating</Text>
                <Text style={styles.chipValue}>{brief.averageRating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>Executive summary</Text>
          <Text style={styles.sectionTitle}>Brief overview</Text>
          <Text style={styles.summary}>{brief.summary}</Text>
          <View style={styles.twoCol}>
            <View style={styles.panel}>
              <Text style={styles.eyebrow}>Pain points</Text>
              {renderList(brief.painPoints).map((item) => (
                <Text key={item} style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </View>
            <View style={styles.panel}>
              <Text style={styles.eyebrow}>Praise themes</Text>
              {renderList(brief.praiseThemes).map((item) => (
                <Text key={item} style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>Risk summary</Text>
          <Text style={styles.sectionTitle}>Urgent flags</Text>
          {renderList(brief.urgentFlags).map((item) => (
            <Text key={item} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>Reviews</Text>
          <Text style={styles.sectionTitle}>Recent review feed</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colAuthor}>Author</Text>
            <Text style={styles.colRating}>Rating</Text>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colPreview}>Preview</Text>
          </View>
          {reviews.slice(0, 10).map((review) => (
            <View key={review.id} style={styles.tableRow}>
              <Text style={styles.colAuthor}>{review.author}</Text>
              <Text style={styles.colRating}>{review.rating.toFixed(1).replace(/\.0$/, '')}/5</Text>
              <Text style={styles.colDate}>{formatDate(review.date)}</Text>
              <Text style={styles.colPreview}>{(review.title || review.body).slice(0, 110)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>Conversation</Text>
          <Text style={styles.sectionTitle}>Chat transcript</Text>
          <View style={styles.messageList}>
            {messages.length > 0 ? (
              messages.map(({ role, content }, index) => (
                <View
                  key={`${role}-${index}`}
                  style={role === 'user' ? [styles.message, styles.userMessage] : styles.message}
                >
                  <Text style={styles.messageRole}>{role === 'user' ? 'You' : 'ReviewLens'}</Text>
                  <Text>{content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.empty}>
                <Text>No chat transcript captured yet.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Page>
  </Document>
)
