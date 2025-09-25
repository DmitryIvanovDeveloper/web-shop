import { Link, useLocation } from 'react-router-dom';
import React from 'react';

const linkBase: React.CSSProperties = {
  color: '#9fb3d9',
  textDecoration: 'none',
  padding: '8px 10px',
  borderRadius: 6,
  display: 'block'
};

export function Sidebar() {
  const { pathname } = useLocation();
  const active = (to: string) => ({
    ...linkBase,
    background: pathname === to ? '#131b2b' : 'transparent',
    color: pathname === to ? '#d7e3ff' : '#9fb3d9'
  });


  // Note: currentScenarios was used for integrated sidebar scenarios (removed feature)

  return (
    <aside style={{ 
      width: 260, 
      padding: 16, 
      borderRight: '1px solid #151a24', 
      background: '#0e1420', 
      textAlign: 'left',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'auto',
      flexShrink: 0
    }}>
      <div style={{ color: '#fff', fontWeight: 700, marginBottom: 12, textAlign: 'left' }}>WebShopX</div>
      <nav style={{ display: 'grid', gap: 4 }}>
        <strong style={{ color: '#7e92b8', padding: '6px 0', textAlign: 'left' }}>Main</strong>
        <Link to="/modules/webshop" style={active('/modules/webshop')}>Webshop</Link>
        <Link to="/modules/rewards" style={active('/modules/rewards')}>Rewards</Link>
        <Link to="/modules/content" style={active('/modules/content')}>News/Blog</Link>
        <Link to="/modules/localization" style={active('/modules/localization')}>Localization</Link>
        <Link to="/modules/personalization" style={active('/modules/personalization')}>Personalization</Link>
        <Link to="/modules/analytics" style={active('/modules/analytics')}>Analytics</Link>
        <Link to="/modules/merchant" style={active('/modules/merchant')}>Merchant</Link>
        <Link to="/modules/uibuilder" style={active('/modules/uibuilder')}>UI Builder</Link>
        <Link to="/modules/sdk" style={active('/modules/sdk')}>SDK Integration</Link>
        <Link to="/modules/loyalty" style={active('/modules/loyalty')}>Loyalty Program</Link>
        <Link to="/modules/liveops" style={active('/modules/liveops')}>LiveOps</Link>
      </nav>
      
    </aside>
  );
}
