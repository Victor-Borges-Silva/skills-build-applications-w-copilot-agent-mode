import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      dataKey="teams"
      emptyText="No teams"
      itemText={(item) => `${item.name ?? 'Team'} • ${Array.isArray(item.members) ? item.members.length : 0} members`}
    />
  );
}
