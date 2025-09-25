import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header style={{borderBottom: '1px solid #151a24', background: '#0e1420'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', maxWidth: 1280, margin: '0 auto'}}>
        <Link to="/" style={{color: '#fff', fontWeight: 700, textDecoration: 'none'}}>WebShopX</Link>
        <nav style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/webshop/shop" style={linkStyle}>Store</Link>
          <Link to="/rewards/daily" style={linkStyle}>Daily Rewards</Link>
          <Link to="/rewards/loyalty" style={linkStyle}>Loyalty Program</Link>
          <Link to="/merchant/promo" style={linkStyle}>Redeem Code</Link>
          <Link to="/content/blog" style={linkStyle}>News</Link>
          <Link to="/webshop/patch-notes" style={linkStyle}>Updates</Link>
          <Link to="/events" style={linkStyle}>Events</Link>
          <Link to="/achievements" style={linkStyle}>Achievements</Link>
        </nav>
        <div style={{marginLeft: 'auto', display: 'flex', gap: 10}}>
          <button style={btnStyle}>Login</button>
          <button style={btnGhost}>EN</button>
        </div>
      </div>
    </header>
  );
}

const linkStyle: React.CSSProperties = {
  color: '#d7e3ff',
  textDecoration: 'none',
  padding: '6px 8px',
  borderRadius: 6
};

const btnStyle: React.CSSProperties = {
  background: '#2e68ff',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer'
};

const btnGhost: React.CSSProperties = {
  background: 'transparent',
  color: '#9fb3d9',
  border: '1px solid #2b3952',
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer'
};
