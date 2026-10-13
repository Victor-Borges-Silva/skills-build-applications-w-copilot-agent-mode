import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint="/api/workouts/suggestions/mona@example.com"
      dataKey="suggestions"
      emptyText="No workout suggestions"
      itemText={(item) => `${item.title ?? 'Workout'} • ${item.focus ?? 'fitness'} • ${item.reason ?? 'Recommended for your goal'}`}
    />
  );
}
