import { mockCampaigns, mockSkus, mockRewards, mockSegments } from '../../shared/mocks/data';

export default function DashboardPage() {
  return (
    <div>
      <h2>Merchant Dashboard (Mock)</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div style={{ padding: 12, border: '1px solid #eee' }}>
          <strong>Active Campaigns</strong>
          <div>{mockCampaigns.filter(c => c.status === 'active').length}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee' }}>
          <strong>SKUs</strong>
          <div>{mockSkus.length}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee' }}>
          <strong>Segments</strong>
          <div>{mockSegments.length}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee' }}>
          <strong>Loyalty Tier</strong>
          <div>{mockRewards.loyalty.tier}</div>
        </div>
      </div>
    </div>
  );
}
