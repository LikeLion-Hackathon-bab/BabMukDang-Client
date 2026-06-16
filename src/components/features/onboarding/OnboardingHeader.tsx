export function OnboardingHeader({ isSkipable = false }: { isSkipable?: boolean }) {
  return <header>{isSkipable ? null : <span>MealPlan</span>}</header>
}
