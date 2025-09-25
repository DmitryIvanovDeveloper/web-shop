export default function SDKScenariosPage() {
  const list = [
    'Payments: configure/test/deploy',
    'Analytics tracking: GA4 events',
    'Game Engine: Unity/Unreal overlay init',
    'Security: OAuth/JWT/MFA',
    'Mobile: push, deep links, crash reporting',
    'API Management: monitoring and rate limits',
    'Integration Testing & Analytics'
  ];
  return (
    <div>
      <h3>SDK Integration — User Scenarios (Mock)</h3>
      <ul>{list.map((s, i) => (<li key={i}>{s}</li>))}</ul>
    </div>
  );
}
