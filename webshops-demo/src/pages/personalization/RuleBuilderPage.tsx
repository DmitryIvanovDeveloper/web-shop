import { mockSegments } from '../../shared/mocks/data';

export default function RuleBuilderPage() {
  return (
    <div>
      <h2>Rule Builder (Mock)</h2>
      <p>Available segments: {mockSegments.map(s => s.name).join(', ')}</p>
    </div>
  );
}
