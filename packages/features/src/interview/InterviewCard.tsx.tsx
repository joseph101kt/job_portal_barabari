'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  cancelInterview,
  getSupabase,
  Interview,
  InterviewStatus,
  joinInterview,
} from '@my-app/supabase'

type Props = {
  interviewId: string
  role: 'poster' | 'job_seeker'
}

export function InterviewCard({ interviewId, role }: Props) {
  const [loading, setLoading] = useState(false)
  const [interview, setInterview] = useState<Interview | null>(null)

  const router = useRouter()

  useEffect(() => {
    fetchInterview()
  }, [interviewId])

  const fetchInterview = async () => {
    const supabase = getSupabase()

    const { data } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single()

    setInterview(data)
  }

  if (!interview) return null

  // ✅ HANDLE NULL SAFELY
  const scheduledTime = interview.scheduled_at
    ? new Date(interview.scheduled_at)
    : null

  const now = new Date()

  const canJoin =
    scheduledTime
      ? now >= new Date(scheduledTime.getTime() - 5 * 60 * 1000)
      : false

const timeLeft =
  scheduledTime
    ? Math.max(0, scheduledTime.getTime() - now.getTime())
    : null

let days = 0
let hours = 0
let minutes = 0

if (timeLeft !== null) {
  const totalMinutes = Math.ceil(timeLeft / (1000 * 60))

  days = Math.floor(totalMinutes / (60 * 24))
  hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  minutes = totalMinutes % 60
}

const formatTimeLeft = () => {
  if (timeLeft === null || timeLeft <= 0) return null

  const parts = []

  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.join(' ')
}

  const handleJoin = async () => {
    try {
      setLoading(true)

      await joinInterview(interviewId)

      router.push({
        pathname:
          role === 'poster'
            ? '/poster/interview'
            : '/seeker/interview',
        params: { interviewId },
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      setLoading(true)
      await cancelInterview(interviewId)
      await fetchInterview()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ TYPE-SAFE STATUS MAP
  const statusMap: Record<
    InterviewStatus,
    { label: string; color: string }
  > = {
    scheduled: {
      label: 'Scheduled',
      color:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    active: {
      label: 'Live',
      color:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    ended: {
      label: 'Ended',
      color:
        'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    },
    cancelled: {
      label: 'Cancelled',
      color:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
  }

  const statusUI = statusMap[interview.status]

  return (
    <div
      className="
      p-4 rounded-2xl border
      bg-white dark:bg-zinc-900
      border-zinc-200 dark:border-zinc-700
      shadow-sm space-y-3
    "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <p className="font-semibold dark:text-white">
          Interview
        </p>

        <span
          className={`px-2 py-1 text-xs rounded-full ${statusUI.color}`}
        >
          {statusUI.label}
        </span>
      </div>

      {/* TIME */}
      {scheduledTime && (
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {scheduledTime.toLocaleString()}
        </div>
      )}

      {/* COUNTDOWN */}
      {interview.status === 'scheduled' &&
        formatTimeLeft !== null &&
        formatTimeLeft () && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Starts in {formatTimeLeft()} min
          </div>
        )}

      {/* ACTIONS */}
      <div className="flex gap-2 pt-2">
        {/* JOIN */}
        {(interview.status === 'scheduled' ||
          interview.status === 'active') && (
          <button
            disabled={
              (!canJoin && interview.status !== 'active') || loading
            }
            onClick={handleJoin}
            className="
              flex-1 px-4 py-2 rounded-xl
              bg-green-600 text-white
              hover:bg-green-700
              dark:bg-green-500 dark:hover:bg-green-600
              disabled:opacity-50
            "
          >
            {interview.status === 'active'
              ? 'Join Now'
              : canJoin
              ? 'Join'
              :  formatTimeLeft()
                ? `Starts in ${formatTimeLeft()}, Please wait`
                : 'Join'}
          </button>
        )}

        {/* CANCEL */}
        {role === 'poster' &&
          interview.status === 'scheduled' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="
                px-4 py-2 rounded-xl
                bg-red-600 text-white
                hover:bg-red-700
                dark:bg-red-500 dark:hover:bg-red-600
                disabled:opacity-50
              "
            >
              Cancel
            </button>
          )}
      </div>
    </div>
  )
}