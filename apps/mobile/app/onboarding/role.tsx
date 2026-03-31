// apps/mobile/app/onboarding/role.tsx

/**
 * Role Picker Screen (Onboarding)
 * ----------------------------------------
 * Shown to:
 * - OAuth users (Google login)
 * - Users without a role in profile
 *
 * Handles:
 * - Role selection (job_seeker / job_poster)
 * - Updates profile in Supabase
 * - Routes to role-specific onboarding
 *
 * UX Notes:
 * - Uses Toast (no Alert)
 * - Prevents continuation without selection
 * - Shows loading state
 * - Clean, minimal decision UI
 *
 * Dependencies:
 * - expo-router (navigation)
 * - supabase (auth + db)
 * - @my-app/ui (Button, Toast)
 */

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button, Toast } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

type Role = 'job_seeker' | 'job_poster'

export default function RolePickerScreen() {
  const router = useRouter()

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)

  // ─────────────────────────────────────────────
  // CONTINUE HANDLER
  // ─────────────────────────────────────────────
  async function handleContinue() {
    // ✅ Validation
    if (!role) {
      Toast.showError('Please select a role to continue')
      return
    }

    setLoading(true)

    // 👤 Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // ❌ No user → redirect to login
    if (!user) {
      Toast.showError('Session expired. Please login again.')
      router.replace('/auth/login')
      setLoading(false)
      return
    }

    // 🧾 Update profile with role
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id)

    if (error) {
      Toast.showError(error.message, 'Failed to save role')
      setLoading(false)
      return
    }

    // ✅ Success feedback
    Toast.showSuccess('Role saved successfully')

    // 🚀 Navigate based on role
    if (role === 'job_seeker') {
      router.replace('/onboarding/job-seeker')
    } else {
      router.replace('/onboarding/job-poster')
    }

    setLoading(false)
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <View className="flex-1 justify-center px-6 bg-white">
      {/* Header */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        One quick thing
      </Text>

      <Text className="text-base text-gray-500 mb-10">
        Tell us how you'll be using the app so we can personalise your experience.
      </Text>

      {/* Role Options */}
      <View className="gap-4 mb-8">
        <RoleCard
          label="Job Seeker"
          description="I'm looking for opportunities and want to showcase my skills"
          icon="🔍"
          selected={role === 'job_seeker'}
          onPress={() => setRole('job_seeker')}
        />

        <RoleCard
          label="Job Poster"
          description="I'm hiring and want to find great candidates"
          icon="🏢"
          selected={role === 'job_poster'}
          onPress={() => setRole('job_poster')}
        />
      </View>

      {/* Continue Button */}
      <Button
        label="Continue"
        variant="primary"
        onPress={handleContinue}
        loading={loading}
        disabled={!role}
        fullWidth
      />
    </View>
  )
}

/**
 * RoleCard Component
 * ----------------------------------------
 * Selectable card UI for role choice
 */
function RoleCard({
  label,
  description,
  icon,
  selected,
  onPress,
}: {
  label: string
  description: string
  icon: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`p-5 rounded-2xl border-2 flex-row items-center gap-4 ${
        selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      {/* Icon */}
      <Text className="text-3xl">{icon}</Text>

      {/* Text Content */}
      <View className="flex-1">
        <Text
          className={`text-base font-semibold mb-1 ${
            selected ? 'text-blue-700' : 'text-gray-800'
          }`}
        >
          {label}
        </Text>

        <Text
          className={`text-sm ${
            selected ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          {description}
        </Text>
      </View>

      {/* Selection Indicator */}
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
        }`}
      >
        {selected && <View className="w-2 h-2 rounded-full bg-white" />}
      </View>
    </Pressable>
  )
}