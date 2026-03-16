/**
 * apps/mobile/app/test.tsx
 *
 * Integration playground — one button per feature.
 * Wire up each handler as you complete each phase.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import {
  Button,
  Card,
  Input,
  Container,
  PageLayout,
  Badge,
  Divider,
  colors,
  typography,
  spacing,
} from '@my-app/ui'; // update this import path to match your workspace alias
import { VideoCallScreen } from '@my-app/features'; // Adjust alias if needed
import { router, useLocalSearchParams, useRouter } from 'expo-router'; // Add useRouter here
// ─── Feature handlers (fill these in as you build each phase) ───────────────


function handleRunOCR() {
  // Phase 4 — Tesseract OCR
  Alert.alert('OCR', 'Pick image and run OCR here');
}

function handleUploadResume() {
  // Phase 6 — Document upload
  Alert.alert('Upload', 'Pick PDF or Word doc here');
}

function handleAISummary() {
  // Phase 7 — AI Resume Analyzer
  Alert.alert('AI', 'Send text to OpenAI here');
}

function handleChatTest() {
  // Phase 10 — Supabase Realtime Chat
  Alert.alert('Chat', 'Open Supabase chat here');
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TestScreen() {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [roomName, setRoomName] = useState('test-room'); // State for room input

  function validateInput() {
    if (!inputValue.trim()) {
      setInputError('This field cannot be empty');
    } else {
      setInputError('');
      Alert.alert('Valid', inputValue);
    }
  }
  
  function handleStartCall() {
  if (!roomName.trim()) {
    Alert.alert('Error', 'Please enter a room name');
    return;
  }
  // Navigate to the dynamic route: apps/mobile/app/call/[room].tsx
  router.push(`/call/${roomName.trim()}`);
}

  return (
    <PageLayout
      header={{
        title: 'Component Test',
        subtitle: 'Phase 1 — UI Foundation',
      }}
    >
      {/* ── Status badges ── */}
      <Section title="Build status">
        <View style={styles.badgeRow}>
          <Badge label="Phase 1 ✓" variant="success" dot />
          <Badge label="Phase 3 pending" variant="warning" dot />
          <Badge label="Phase 4 pending" variant="neutral" dot />
          <Badge label="Phase 7 pending" variant="neutral" dot />
        </View>
      </Section>

      <Divider />

      {/* ── Feature buttons ── */}
      <Section title="Feature integration">
<View style={styles.buttonGrid}>
    {/* Add this Input so you can name the room */}
    <Input
      label="Room Name"
      placeholder="e.g. interview-101"
      value={roomName}
      onChangeText={setRoomName}
    />
    <Button
      label="Start Call"
      variant="primary"
      size="md"
      onPress={handleStartCall}
      fullWidth
    />
          <Button
            label="Upload Resume"
            variant="outline"
            size="md"
            onPress={handleUploadResume}
            fullWidth
          />
          <Button
            label="AI Summary"
            variant="primary"
            size="md"
            onPress={handleAISummary}
            fullWidth
          />
          <Button
            label="Chat Test"
            variant="ghost"
            size="md"
            onPress={handleChatTest}
            fullWidth
          />
        </View>
      </Section>

      <Divider />

      {/* ── Button variants showcase ── */}
      <Section title="Button variants">
        <View style={styles.buttonGrid}>
          <Button label="Primary" variant="primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Outline" variant="outline" />
          <Button label="Ghost" variant="ghost" />
          <Button label="Danger" variant="danger" />
          <Button label="Loading" variant="primary" loading />
          <Button label="Disabled" variant="primary" disabled />
        </View>
      </Section>

      <Divider />

      {/* ── Button sizes ── */}
      <Section title="Button sizes">
        <View style={styles.buttonGrid}>
          <Button label="Small" size="sm" />
          <Button label="Medium" size="md" />
          <Button label="Large" size="lg" />
        </View>
      </Section>

      <Divider />

      {/* ── Input showcase ── */}
      <Section title="Input states">
        <Input
          label="Normal input"
          placeholder="Type something..."
          value={inputValue}
          onChangeText={setInputValue}
        />
        <Input
          label="With error"
          placeholder="Required field"
          error={inputError || undefined}
          value=""
          onChangeText={() => {}}
        />
        <Input
          label="Disabled"
          placeholder="Cannot edit"
          editable={false}
          value="Locked value"
          onChangeText={() => {}}
        />
        <Input
          label="With hint"
          placeholder="your@email.com"
          hint="We'll never share your email."
          keyboardType="email-address"
          value=""
          onChangeText={() => {}}
        />
        <Button
          label="Validate input"
          onPress={validateInput}
          variant="outline"
        />
      </Section>

      <Divider />

      {/* ── Card variants ── */}
      <Section title="Card variants">
        <Card elevation="flat">
          <Text style={styles.cardText}>Flat card — no shadow</Text>
        </Card>
        <Card elevation="raised">
          <Text style={styles.cardText}>Raised card — subtle shadow</Text>
        </Card>
        <Card elevation="elevated">
          <Text style={styles.cardText}>Elevated card — more prominent</Text>
        </Card>
        <Card
          elevation="raised"
          onPress={() => Alert.alert('Card pressed!')}
        >
          <Text style={styles.cardText}>Pressable card — tap me</Text>
          <Text style={styles.cardSubtext}>Has onPress handler</Text>
        </Card>
      </Section>

      <Divider />

      {/* ── Badge variants ── */}
      <Section title="Badge variants">
        <View style={styles.badgeRow}>
          <Badge label="Primary" variant="primary" />
          <Badge label="Success" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Error" variant="error" />
          <Badge label="Info" variant="info" />
          <Badge label="Neutral" variant="neutral" />
        </View>
      </Section>

      <Divider />

      {/* ── Typography scale ── */}
      <Section title="Typography scale">
        <Text style={styles.typeH1}>Heading 1 — 34px bold</Text>
        <Text style={styles.typeH2}>Heading 2 — 28px bold</Text>
        <Text style={styles.typeH3}>Heading 3 — 22px semibold</Text>
        <Text style={styles.typeH4}>Heading 4 — 18px semibold</Text>
        <Text style={styles.typeBody}>Body — 16px regular. The quick brown fox jumps over the lazy dog.</Text>
        <Text style={styles.typeBodySmall}>Body small — 14px regular. Secondary information lives here.</Text>
        <Text style={styles.typeCaption}>Caption — 12px. Timestamps, labels, meta info.</Text>
      </Section>

      <Divider />

      {/* ── Color palette ── */}
      <Section title="Color palette">
        <View style={styles.colorGrid}>
          {(
            [
              ['primary', colors.primary],
              ['primaryLight', colors.primaryLight],
              ['secondary', colors.secondary],
              ['success', colors.success],
              ['warning', colors.warning],
              ['error', colors.error],
              ['text', colors.text],
              ['muted', colors.muted],
              ['border', colors.border],
              ['surface', colors.surface],
            ] as [string, string][]
          ).map(([name, value]) => (
            <View key={name} style={styles.colorSwatch}>
              <View style={[styles.swatchBlock, { backgroundColor: value }]} />
              <Text style={styles.swatchLabel}>{name}</Text>
              <Text style={styles.swatchValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Section>
    </PageLayout>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.styles.label,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionContent: {
    gap: spacing.itemGap,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttonGrid: {
    gap: spacing.sm,
  },
  cardText: {
    ...typography.styles.body,
    color: colors.text,
  },
  cardSubtext: {
    ...typography.styles.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: '30%',
    gap: 4,
  },
  swatchBlock: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatchLabel: {
    ...typography.styles.caption,
    color: colors.text,
    fontWeight: '600',
  },
  swatchValue: {
    ...typography.styles.caption,
    color: colors.muted,
  },

  // Typography scale
  typeH1: { ...typography.styles.h1, color: colors.text },
  typeH2: { ...typography.styles.h2, color: colors.text },
  typeH3: { ...typography.styles.h3, color: colors.text },
  typeH4: { ...typography.styles.h4, color: colors.text },
  typeBody: { ...typography.styles.body, color: colors.text },
  typeBodySmall: { ...typography.styles.bodySmall, color: colors.textSecondary },
  typeCaption: { ...typography.styles.caption, color: colors.muted },
});