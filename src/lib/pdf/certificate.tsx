import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  border: {
    border: '4px solid #2563eb',
    borderRadius: 8,
    padding: 40,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBorder: {
    border: '1px solid #cbd5e1',
    padding: 30,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 40,
    letterSpacing: 1,
  },
  heading: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 30,
  },
  studentName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 20,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 1.6,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginVertical: 15,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 30,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1px solid #e2e8f0',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
  },
});

interface CertificateProps {
  studentName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  eventTitle,
  eventDate,
  venue,
}) => {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder}>
            {/* Logo/Brand */}
            <Text style={styles.logo}>CampusEvents</Text>

            {/* Certificate Heading */}
            <Text style={styles.heading}>Certificate of Participation</Text>

            <Text style={styles.subheading}>This is to certify that</Text>

            {/* Student Name */}
            <Text style={styles.studentName}>{studentName}</Text>

            {/* Participation Text */}
            <Text style={styles.text}>has successfully participated in</Text>

            {/* Event Title */}
            <Text style={styles.eventTitle}>{eventTitle}</Text>

            {/* Event Details */}
            <Text style={styles.text}>
              held on {formattedDate} at {venue}
            </Text>

            {/* Date of Issue */}
            <Text style={styles.date}>
              Certificate issued on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                CampusEvents - Campus Event Management Platform
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
