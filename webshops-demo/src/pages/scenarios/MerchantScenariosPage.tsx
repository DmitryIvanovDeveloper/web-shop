export default function MerchantScenariosPage() {
  const list = [
    'Dashboard: Real-time overview',
    'Campaign Manager: create/activate/schedule',
    'SKU Management: CRUD, pricing, inventory',
    'Promo Management: promo codes, flow editor',
    'UI Builder: drag & drop, theme apply',
    'Analytics: KPIs, reports'
  ];
  return (
    <div>
      <h3>Merchant — User Scenarios (Mock)</h3>
      <ul>{list.map((s, i) => (<li key={i}>{s}</li>))}</ul>
    </div>
  );
}
