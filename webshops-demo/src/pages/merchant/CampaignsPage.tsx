import { mockCampaigns } from '../../shared/mocks/data';

export default function CampaignsPage() {
  return (
    <div>
      <h2>Campaign Manager (Mock)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align='left'>Name</th>
            <th align='left'>Status</th>
            <th align='left'>Discount</th>
          </tr>
        </thead>
        <tbody>
          {mockCampaigns.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.status}</td>
              <td>{c.discount}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
