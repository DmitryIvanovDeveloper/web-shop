import { mockSegments } from '../../shared/mocks/data';

export default function SegmentsPage() {
  return (
    <div>
      <h2>Audience Segmentation (Mock)</h2>
      <ul>
        {mockSegments.map(s => (<li key={s.id}>{s.name} — {s.size}</li>))}
      </ul>
    </div>
  );
}
