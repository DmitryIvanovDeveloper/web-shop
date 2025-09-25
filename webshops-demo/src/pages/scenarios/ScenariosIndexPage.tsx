import { Link } from 'react-router-dom';

const entries = [
  { to: '/scenarios/merchant', title: 'Merchant' },
  { to: '/scenarios/personalization', title: 'Personalization Engine' },
  { to: '/scenarios/rewards', title: 'Rewards System' },
  { to: '/scenarios/content', title: 'Content Management' },
  { to: '/scenarios/localization', title: 'Localization' },
  { to: '/scenarios/webshop', title: 'Webshop Experience' },
  { to: '/scenarios/sdk', title: 'SDK Integration' }
];

export default function ScenariosIndexPage() {
  return (
    <div>
      <h2>User Scenarios (Mock)</h2>
      <ul>
        {entries.map(e => (<li key={e.to}><Link to={e.to}>{e.title}</Link></li>))}
      </ul>
    </div>
  );
}
