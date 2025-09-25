import { mockSkus } from '../../shared/mocks/data';

export default function SkusPage() {
  return (
    <div>
      <h2>SKU Management (Mock)</h2>
      <ul>
        {mockSkus.map(s => (
          <li key={s.id}>{s.title} — ${s.price} — stock: {s.inventory}</li>
        ))}
      </ul>
    </div>
  );
}
