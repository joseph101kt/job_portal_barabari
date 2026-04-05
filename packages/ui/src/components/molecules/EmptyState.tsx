// packages/ui/src/components/molecules/EmptyState.tsx
import { View, Text } from 'react-native'
import { Button } from '../atoms/Button'

type Props = {
  emoji?:      string   // 👈 made optional
  title:       string
  description?: string
  action?:     { label: string; onPress: () => void }
  secondaryAction?: { label: string; onPress: () => void }
}

export function EmptyState({ emoji, title, description, action, secondaryAction }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-4 py-16">
      {emoji && ( // 👈 render only if exists
        <Text className="text-5xl">{emoji}</Text>
      )}

      <View className="items-center gap-2">
        <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100 text-center">
          {title}
        </Text>

        {description && (
          <Text className="text-sm text-neutral-500 text-center leading-relaxed">
            {description}
          </Text>
        )}
      </View>

      {action && (
        <View className="gap-2 items-center">
          <Button
            label={action.label}
            onPress={action.onPress}
            variant="primary"
            size="md"
          />

          {secondaryAction && (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
              size="sm"
            />
          )}
        </View>
      )}
    </View>
  )
}