export function Footer() {
  return (
    <footer style={{borderTop: '1px solid #151a24', background: '#0e1420', color: '#7e92b8'}}>
      <div style={{maxWidth: 1280, margin: '0 auto', padding: '16px 20px', fontSize: 12, display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center'}}>
        <div>© 2025 Aghanim — Demo</div>
        <div style={{display: 'flex', gap: 12}}>
          <a href="#" style={{color: '#9fb3d9', textDecoration: 'none'}}>Terms of Use</a>
          <a href="#" style={{color: '#9fb3d9', textDecoration: 'none'}}>Privacy Policy</a>
          <a href="#" style={{color: '#9fb3d9', textDecoration: 'none'}}>Consent Preferences</a>
        </div>
      </div>
    </footer>
  );
}
