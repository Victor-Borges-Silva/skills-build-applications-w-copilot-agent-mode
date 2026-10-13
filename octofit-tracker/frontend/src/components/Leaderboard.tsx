import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      dataKey="leaderboard"
      emptyText="No leaderboard"
      itemText={(item) => `${item.teamName ?? 'Team'} • ${item.totalPoints ?? 0} points`}
    />
  );
}
