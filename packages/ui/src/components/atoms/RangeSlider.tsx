import React, { useState, useEffect, useRef } from 'react'
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native'

type Props = {
  min: number
  max: number
  step?: number
  low: number
  high: number
  onChange: (low: number, high: number) => void
}

export function RangeSlider({
  min,
  max,
  step = 1,
  low,
  high,
  onChange,
}: Props) {
  const [width, setWidth] = useState(0)

  // 🔥 INTERNAL STATE
  const [internalLow, setInternalLow] = useState(low)
  const [internalHigh, setInternalHigh] = useState(high)

  // 🧠 sync with parent
  useEffect(() => {
    setInternalLow(low)
    setInternalHigh(high)
  }, [low, high])

  // 🧠 VALUE refs (avoid stale values)
  const lowRef = useRef(internalLow)
  const highRef = useRef(internalHigh)

  useEffect(() => {
    lowRef.current = internalLow
  }, [internalLow])

  useEffect(() => {
    highRef.current = internalHigh
  }, [internalHigh])

  // 🧠 WIDTH ref (CRITICAL FIX)
  const widthRef = useRef(0)

  useEffect(() => {
    widthRef.current = width
  }, [width])

  // 🧠 POSITION refs (px)
  const lowPosRef = useRef(0)
  const highPosRef = useRef(0)

  const clamp = (val: number, minVal: number, maxVal: number) =>
    Math.min(Math.max(val, minVal), maxVal)

  const valueToPosition = (value: number) =>
    width === 0 ? 0 : ((value - min) / (max - min)) * width

  const positionToValue = (pos: number) => {
    const currentWidth = widthRef.current
    if (currentWidth === 0) return min

    const raw = (pos / currentWidth) * (max - min) + min
    return Math.round(raw / step) * step
  }

  // 🧠 keep positions synced
  useEffect(() => {
    lowPosRef.current = valueToPosition(internalLow)
  }, [internalLow, width])

  useEffect(() => {
    highPosRef.current = valueToPosition(internalHigh)
  }, [internalHigh, width])

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width)
  }

  // 🔥 debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedChange = (l: number, h: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(l, h)
    }, 120)
  }

  const createPanResponder = (isLow: boolean) => {
    let startX = 0

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        startX = isLow ? lowPosRef.current : highPosRef.current
      },

      onPanResponderMove: (_, gesture) => {
        const currentWidth = widthRef.current
        if (currentWidth === 0) return

        const newPos = clamp(startX + gesture.dx, 0, currentWidth)
        let newValue = positionToValue(newPos)

        if (isLow) {
          newValue = clamp(newValue, min, highRef.current - step)
          setInternalLow(newValue)
          debouncedChange(newValue, highRef.current)
        } else {
          newValue = clamp(newValue, lowRef.current + step, max)
          setInternalHigh(newValue)
          debouncedChange(lowRef.current, newValue)
        }
      },

      onPanResponderRelease: () => {
        onChange(lowRef.current, highRef.current)
      },
    })
  }

  // ✅ stable responders (no recreation)
  const lowPan = useRef(createPanResponder(true)).current
  const highPan = useRef(createPanResponder(false)).current

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Track */}
      <View style={styles.track} />

      {/* Selected Range */}
      <View
        style={[
          styles.range,
          {
            left: valueToPosition(internalLow),
            width:
              valueToPosition(internalHigh) -
              valueToPosition(internalLow),
          },
        ]}
      />

      {/* Low Thumb */}
      <View
        style={[
          styles.thumb,
          { left: valueToPosition(internalLow) - 10 },
        ]}
        {...lowPan.panHandlers}
      />

      {/* High Thumb */}
      <View
        style={[
          styles.thumb,
          { left: valueToPosition(internalHigh) - 10 },
        ]}
        {...highPan.panHandlers}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  range: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
})