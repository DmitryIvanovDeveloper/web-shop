export default function WebshopScenariosPage() {
  const list = [
    'Shop Interface: browse, add to cart, checkout',
    'External Links: track clicks',
    'Patch Notes: version history'
  ];
  return (
    <div>
      <h3>Webshop — User Scenarios (Mock)</h3>
      <ul>{list.map((s, i) => (<li key={i}>{s}</li>))}</ul>
    </div>
  );
}
