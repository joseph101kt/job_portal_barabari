# 🎨 UI Package

Design system for the Job Portal app.

Provides reusable components, tokens, and layout primitives.

---

## 📁 Structure

ui/
 ┣ src/
 ┃ ┣ components/
 ┃ ┃ ┣ atoms/
 ┃ ┃ ┣ molecules/
 ┃ ┃ ┣ organisms/
 ┃ ┃ ┣ ThemeProvider.tsx
 ┃ ┃ ┗ ToastProvider.tsx
 ┃ ┣ tokens/
 ┃ ┃ ┣ colors.ts
 ┃ ┃ ┣ spacing.ts
 ┃ ┃ ┗ typography.ts
 ┃ ┣ index.ts
 ┃ ┗ tailwind.config.js

---

## 🧱 Component Layers

### Atoms
Basic UI elements:
- Button
- Input
- Avatar
- Badge
- Tag
- Toggle
- etc.

---

### Molecules
Composed components:
- JobCard
- ApplicantCard
- MessageBubble
- SearchBar
- SectionHeader
- EmptyState
- etc.

---

### Organisms
Complex UI blocks:
- PageLayout
- ChatInput
- BottomSheet
- FormSection
- TabBar
- ProfileHeader

---

## 🎯 Purpose

- Maintain UI consistency
- Speed up development
- Avoid duplication
- Enable easy redesign

---

## 🎨 Tokens

Defined in:

- colors.ts
- spacing.ts
- typography.ts

---

## 📌 Usage

```tsx
import { Button, Input, JobCard } from '@my-app/ui'

<Button>Apply</Button>
<Input placeholder="Search jobs" />
🧠 Rules
Do not use inline styles
Use tokens for spacing and colors
Keep atoms simple and reusable
Molecules = composition only
Organisms = layout + structure
🔔 Toast System

Use ToastProvider:

Toast.showSuccess()
Toast.showError()

No Alert.alert usage.

🎯 Layout Standard

All screens should follow:

PageLayout
SectionHeader
Content

🚀 Notes
Built with Tailwind (NativeWind)
Shared across web + mobile
Designed for future UI refinement