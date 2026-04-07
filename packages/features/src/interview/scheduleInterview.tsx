'use client'

import React, { useState } from 'react'
import { Button, Toast } from "../../../ui/src"
import { scheduleInterview } from "@my-app/supabase"

type ScheduleInterviewBtnProps = {
  onPress: () => void
}

export function ScheduleInterviewBtn({ onPress }: ScheduleInterviewBtnProps) {
  return (
    <Button
      label="Schedule Interview"
      onPress={onPress}
      variant="primary"
      size="sm"
      className="dark:bg-blue-500 dark:border-blue-500"
    />
  )
}

// ================= MODAL =================

type ScheduleInterviewModalProps = {
  applicationId: string // ✅ FIXED
  onClose: () => void
}

export function ScheduleInterviewModal({
  applicationId,
  onClose,
}: ScheduleInterviewModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    console.log('🚀 Action: schedule interview UI')

    // ✅ VALIDATION
    if (!date || !time) {
      Toast.showError('Please select both date and time')
      return
    }

    const scheduledAt = new Date(`${date}T${time}`)

    if (scheduledAt <= new Date()) {
      Toast.showError('Please choose a future time')
      return
    }

    setLoading(true)

    try {
      await scheduleInterview({
        applicationId, // ✅ FIXED
        scheduledAt: scheduledAt.toISOString(),
      })

      console.log('✅ Interview scheduled')
      Toast.showSuccess('Interview scheduled successfully')
      onClose()
    } catch (err) {
      console.error('❌ Error:', err)
      const message =
        err instanceof Error ? err.message : String(err)

      Toast.showError(`Failed due to: ${message}`)
    }

    setLoading(false)
  }

  const preview =
    date && time
      ? new Date(`${date}T${time}`).toLocaleString()
      : null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-md p-6 rounded-2xl
          bg-white dark:bg-zinc-900
          shadow-2xl space-y-5
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">
            Schedule Interview
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* INPUTS */}
        <div className="grid grid-cols-2 gap-3">
          {/* DATE */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Date
            </label>

            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) =>
                  (e.target as HTMLInputElement).showPicker?.()
                }
                className="
                  w-full p-3 rounded-lg border cursor-pointer
                  bg-white dark:bg-zinc-800
                  border-zinc-300 dark:border-zinc-700
                  dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
              <span className="absolute right-3 top-3 text-zinc-400 pointer-events-none">
                📅
              </span>
            </div>
          </div>

          {/* TIME */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Time
            </label>

            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onClick={(e) =>
                  (e.target as HTMLInputElement).showPicker?.()
                }
                className="
                  w-full p-3 rounded-lg border cursor-pointer
                  bg-white dark:bg-zinc-800
                  border-zinc-300 dark:border-zinc-700
                  dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
              <span className="absolute right-3 top-3 text-zinc-400 pointer-events-none">
                ⏰
              </span>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        {preview && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Scheduled for {preview}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="
              flex-1 px-4 py-2 rounded-xl
              bg-zinc-200 hover:bg-zinc-300
              dark:bg-zinc-700 dark:hover:bg-zinc-600
              dark:text-white
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              flex-1 px-4 py-2 rounded-xl
              bg-blue-600 text-white
              hover:bg-blue-700
              dark:bg-blue-500 dark:hover:bg-blue-600
              disabled:opacity-50
            "
          >
            {loading ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}