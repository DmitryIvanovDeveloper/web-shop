import { mockSkus } from '../../shared/mocks/data';

export default function ShopInterfacePage() {
  return (
    <div>
      <h2>Shop Interface (Mock)</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {mockSkus.map(s => (
          <div key={s.id} style={{ border: '1px solid #eee', padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{s.title}</div>
            <div>${s.price}</div>
            <button>+ Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
