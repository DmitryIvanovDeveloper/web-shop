export default function ContentScenariosPage() {
  const list = [
    'Blog/News: publish, schedule, moderate',
    'Media Support: upload/process/stream'
  ];
  return (
    <div>
      <h3>Content — User Scenarios (Mock)</h3>
      <ul>{list.map((s, i) => (<li key={i}>{s}</li>))}</ul>
    </div>
  );
}
