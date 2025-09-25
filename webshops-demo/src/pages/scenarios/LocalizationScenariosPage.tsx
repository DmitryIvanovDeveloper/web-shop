export default function LocalizationScenariosPage() {
  const list = [
    'Translate Content',
    'Detect Language',
    'Manage Translations',
    'Update Locale',
    'Validate Translation'
  ];
  return (
    <div>
      <h3>Localization — User Scenarios (Mock)</h3>
      <ul>{list.map((s, i) => (<li key={i}>{s}</li>))}</ul>
    </div>
  );
}
