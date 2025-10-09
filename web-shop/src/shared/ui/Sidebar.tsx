import React, { useState } from "react";
import Link from "next/link";

type SidebarProps = {
  children?: React.ReactNode;
  widthClassName?: string; // e.g. "w-64"
  title?: string;
  onSelect?: (key: string) => void;
};

const menuItems: Array<{ key: string; label: string; icon: string; href: string }> = [
  { key: "home", label: "Home", icon: "🏠", href: "/" },
  { key: "analytics-dashboard", label: "Analytics\nDashboard", icon: "📈", href: "/dashboard" },
];

export function Sidebar({ children, widthClassName = "w-64", title = "Navigation", onSelect }: SidebarProps): JSX.Element {
  const [activeKey, setActiveKey] = useState<string>("home");
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: widthClassName === "w-64" ? 256 : undefined,
    backgroundColor: "#12141A",
    padding: 24,
    boxSizing: "border-box",
    zIndex: 50,
  };

  const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    margin: 0,
    paddingTop: 8,
  };

  const itemStyle = (active?: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: "12px 16px",
    backgroundColor: active ? "#3B3F4A" : "transparent",
    color: active ? "#FFFFFF" : "#B7BBC7",
    textDecoration: "none",
    fontSize: 15,
    lineHeight: "20px",
  });

  const iconStyle = (active?: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: active ? "#535865" : "transparent",
    color: active ? "#FFFFFF" : "#B7BBC7",
    fontSize: 14,
  });

  const handleSelect = (key: string) => {
    setActiveKey(key);
    onSelect?.(key);
  };

  return (
    <aside role="complementary" aria-label="Sidebar" style={containerStyle}>
      {children ?? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1D4ED8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>WS</div>
            <span style={{ color: "#E5E7EB", fontWeight: 600, letterSpacing: 0.3 }}>Web Shop</span>
          </div>
          <nav style={listStyle}>
            {menuItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                style={{ ...itemStyle(item.key === activeKey), transition: "background-color .15s ease" }}
                onClick={() => {
                  handleSelect(item.key);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.key === activeKey ? "#3B3F4A" : "#1B1E26")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.key === activeKey ? "#3B3F4A" : "transparent")}
              >
                <span style={iconStyle(item.key === activeKey)} aria-hidden>
                  {item.icon}
                </span>
                <span style={{ whiteSpace: "pre-line" }}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}

export default Sidebar;


