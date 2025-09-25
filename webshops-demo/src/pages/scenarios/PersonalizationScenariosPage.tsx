export default function PersonalizationScenariosPage() {
  const list = [
    'Rule Builder: create/execute rules',
    'Audience Segmentation: define and segment',
    'Abandoned Cart Offers: detect/send reminders',
    'LiveOps Automation: workflows and triggers'
  ];
  return (
    <div>
      <h3>Personalization — User Scenarios (Mock)</h3>
      <ul>{list.map((s, i) => (<li key={i}>{s}</li>))}</ul>
    </div>
  );
}
