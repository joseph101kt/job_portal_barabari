// packages/ui/src/index.ts

// ── Tokens ────────────────────────────────────────────────────────────────────
export { colors, statusColors, employmentTypeColors } from './tokens/colors'
export { typography } from './tokens/typography'
export { spacing }    from './tokens/spacing'

// ── Atoms ─────────────────────────────────────────────────────────────────────
export { Button }  from './components/atoms/Button'
export { Input }   from './components/atoms/Input'
export { Badge }   from './components/atoms/Badge'
export { Avatar }  from './components/atoms/Avatar'
export { Chip }    from './components/atoms/Chip'
export { Divider } from './components/atoms/Divider'
export { Tag }     from './components/atoms/Tag'
export { Toggle }  from './components/atoms/Toggle'
export { DateInput } from './components/atoms/DateInput'
export { RangeSlider } from './components/atoms/RangeSlider'

// ── Molecules ─────────────────────────────────────────────────────────────────
export { Card }              from './components/molecules/Card'
export { JobCard }           from './components/molecules/JobCard'
export { ApplicantCard }     from './components/molecules/ApplicantCard'
export { ApplicationCard}    from './components/molecules/ApplicationCard'
export { StatCard }          from './components/molecules/StatCard'
export { SearchBar }         from './components/molecules/SearchBar'
export { FilterChips }       from './components/molecules/FilterChips'
export { EmptyState }        from './components/molecules/EmptyState'
export { ProgressBar }       from './components/molecules/ProgressBar'
export { StepIndicator }     from './components/molecules/StepIndicator'
export { ProfileCompletion } from './components/molecules/ProfileCompletion'
export { MessageBubble }     from './components/molecules/MessageBubble'
export { SectionHeader }     from './components/molecules/SectionHeader'

// ── Organisms ─────────────────────────────────────────────────────────────────
export { PageLayout }    from './components/organisms/PageLayout'
export { BottomSheet }   from './components/organisms/BottomSheet'
export { ProfileHeader } from './components/organisms/ProfileHeader'
export { TabBar }        from './components/organisms/TabBar'
export { ChatInput }     from './components/organisms/ChatInput'
export { FormSection }   from './components/organisms/FormSection'



// ── Theme Provider ──────────────────────────────────────────────────────────────
export { ThemeProvider } from './components/ThemeProvider'
export { ThemeToggle }      from './components/ThemeProvider'



// ── Toast ──────────────────────────────────────────────────────────────
export { ToastProvider } from './components/ToastProvider'
export { Toast }   from './components/ToastProvider'
export { useToast } from './components/ToastProvider'