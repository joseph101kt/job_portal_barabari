/**
 * apps/mobile/app/test.tsx
 */
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { View, Text, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Button,
  Card,
  Input,
  PageLayout,
  Badge,
  Divider,
  colors,
} from '@my-app/ui';
import {
  useOcr,
  OcrEngine,
  pickImageAsBase64,
  runTesseractWeb,
} from '@my-app/features';

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TestScreen() {
  const router = useRouter();

  const { status, result, error, onOcrEvent, reset } = useOcr();
  const webviewRef = useRef<WebView>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function handleRunOCR() {
    reset();
    setImageUri(null);

    const img = await pickImageAsBase64();
    if (!img) return;

    setImageUri(img.uri);

    if (Platform.OS === 'web') {
      // Web: Tesseract runs directly, no WebView needed
      await runTesseractWeb(img.base64, onOcrEvent);
    } else {
      // Native: send to hidden WebView bridge
      if (!webviewRef.current) {
        Alert.alert('OCR Error', 'Engine not ready. Try again.');
        return;
      }
      webviewRef.current.postMessage(JSON.stringify({ imageBase64: img.base64 }));
    }
  }

  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  function validateInput() {
    if (!inputValue.trim()) {
      setInputError('This field cannot be empty');
    } else {
      setInputError('');
      Alert.alert('Valid', inputValue);
    }
  }

  return (
    <PageLayout header={{ title: 'Component Test', subtitle: 'Phase 1 — UI Foundation' }}>

      {/* Native only — no-op on web */}
      <OcrEngine webviewRef={webviewRef} onEvent={onOcrEvent} />

      {/* ── Build status ── */}
      <Section title="Build status">
        <View className="flex-row flex-wrap gap-2">
          <Badge label="Phase 1 ✓"         variant="success" dot />
          <Badge label="Phase 3 pending"    variant="warning" dot />
          <Badge label="Phase 4 pending"    variant="neutral" dot />
          <Badge label="Phase 7 pending"    variant="neutral" dot />
        </View>
      </Section>

      <Divider />

      {/* ── Feature buttons ── */}
      <Section title="Feature integration">
        <View className="gap-2">
          <Button label="Start Call"     variant="primary"   size="md" onPress={() => router.push('/call')} fullWidth />
          <Button
            label="Run OCR"
            variant="secondary"
            size="md"
            onPress={handleRunOCR}
            loading={status === 'processing'}
            disabled={status === 'processing'}
            fullWidth
          />
          <Button label="Upload Resume"  variant="outline"   size="md" onPress={() => Alert.alert('Upload', 'Coming soon')} fullWidth />
          <Button label="AI Summary"     variant="primary"   size="md" onPress={() => Alert.alert('AI', 'Coming soon')}     fullWidth />
          <Button label="Chat Test"      variant="ghost"     size="md" onPress={() => Alert.alert('Chat', 'Coming soon')}   fullWidth />
        </View>
      </Section>

      <Divider />

      {/* ── OCR output ── */}
      <Section title="OCR output">

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-48 rounded-lg bg-gray-100"
            resizeMode="contain"
          />
        )}

        {status !== 'idle' && (
          <View className="flex-row flex-wrap gap-2">
            <Badge
              label={
                status === 'ready'       ? 'Engine ready' :
                status === 'processing'  ? 'Running OCR…' :
                status === 'success'     ? 'Done'          :
                status === 'error'       ? 'Failed'        : status
              }
              variant={
                status === 'success'    ? 'success' :
                status === 'error'      ? 'error'   :
                status === 'processing' ? 'warning' : 'info'
              }
              dot
            />
            {status === 'success' && result && (
              <Badge label={`${result.confidence.toFixed(0)}% confidence`} variant="neutral" />
            )}
          </View>
        )}

        {status === 'processing' && (
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color={colors.primary} />
            <Text className="text-sm text-gray-500 flex-1">
              {Platform.OS === 'web'
                ? 'First run downloads ~4MB language model — takes 10–20s'
                : 'Running OCR via WebView bridge…'}
            </Text>
          </View>
        )}

        {status === 'success' && result && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Extracted text
            </Text>
            <Text className="text-base text-gray-800 mb-3">
              {result.text}
            </Text>
            <Button label="Clear" variant="ghost" size="sm" onPress={reset} />
          </Card>
        )}

        {status === 'error' && error && (
          <Card elevation="flat">
            <Text className="text-sm text-red-500 mb-3">{error}</Text>
            <Button label="Try again" variant="outline" size="sm" onPress={handleRunOCR} />
          </Card>
        )}

        {status === 'idle' && (
          <Text className="text-sm text-gray-400 italic">
            Press "Run OCR" above to pick an image and extract text.
          </Text>
        )}

      </Section>

      <Divider />

      {/* ── Button variants ── */}
      <Section title="Button variants">
        <View className="gap-2">
          <Button label="Primary"   variant="primary"   />
          <Button label="Secondary" variant="secondary" />
          <Button label="Outline"   variant="outline"   />
          <Button label="Ghost"     variant="ghost"     />
          <Button label="Danger"    variant="danger"    />
          <Button label="Loading"   variant="primary"   loading />
          <Button label="Disabled"  variant="primary"   disabled />
        </View>
      </Section>

      <Divider />

      {/* ── Button sizes ── */}
      <Section title="Button sizes">
        <View className="gap-2">
          <Button label="Small"  size="sm" />
          <Button label="Medium" size="md" />
          <Button label="Large"  size="lg" />
        </View>
      </Section>

      <Divider />

      {/* ── Input states ── */}
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
        <Button label="Validate input" onPress={validateInput} variant="outline" />
      </Section>

      <Divider />

      {/* ── Card variants ── */}
      <Section title="Card variants">
        <Card elevation="flat">
          <Text className="text-base text-gray-800">Flat card — no shadow</Text>
        </Card>
        <Card elevation="raised">
          <Text className="text-base text-gray-800">Raised card — subtle shadow</Text>
        </Card>
        <Card elevation="elevated">
          <Text className="text-base text-gray-800">Elevated card — more prominent</Text>
        </Card>
        <Card elevation="raised" onPress={() => Alert.alert('Card pressed!')}>
          <Text className="text-base text-gray-800">Pressable card — tap me</Text>
          <Text className="text-sm text-gray-400 mt-1">Has onPress handler</Text>
        </Card>
      </Section>

      <Divider />

      {/* ── Badge variants ── */}
      <Section title="Badge variants">
        <View className="flex-row flex-wrap gap-2">
          <Badge label="Primary" variant="primary" />
          <Badge label="Success" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Error"   variant="error"   />
          <Badge label="Info"    variant="info"    />
          <Badge label="Neutral" variant="neutral" />
        </View>
      </Section>

      <Divider />

      {/* ── Typography scale ── */}
      <Section title="Typography scale">
        <Text className="text-4xl font-bold text-gray-900">Heading 1 — 34px bold</Text>
        <Text className="text-3xl font-bold text-gray-900">Heading 2 — 28px bold</Text>
        <Text className="text-2xl font-semibold text-gray-900">Heading 3 — 22px semibold</Text>
        <Text className="text-xl font-semibold text-gray-900">Heading 4 — 18px semibold</Text>
        <Text className="text-base text-gray-800">Body — 16px regular. The quick brown fox jumps over the lazy dog.</Text>
        <Text className="text-sm text-gray-600">Body small — 14px. Secondary information lives here.</Text>
        <Text className="text-xs text-gray-400">Caption — 12px. Timestamps, labels, meta info.</Text>
      </Section>

      <Divider />

      {/* ── Color palette ── */}
      <Section title="Color palette">
        <View className="flex-row flex-wrap gap-2">
          {(
            [
              ['primary',      colors.primary],
              ['primaryLight', colors.primaryLight],
              ['secondary',    colors.secondary],
              ['success',      colors.success],
              ['warning',      colors.warning],
              ['error',        colors.error],
              ['text',         colors.text],
              ['muted',        colors.muted],
              ['border',       colors.border],
              ['surface',      colors.surface],
            ] as [string, string][]
          ).map(([name, value]) => (
            <View key={name} className="w-[30%] gap-1">
              <View
                className="h-10 rounded-lg border border-gray-200"
                style={{ backgroundColor: value }}
              />
              <Text className="text-xs font-semibold text-gray-800">{name}</Text>
              <Text className="text-xs text-gray-400">{value}</Text>
            </View>
          ))}
        </View>
      </Section>

    </PageLayout>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}