 'use client';

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  children?: React.ReactNode;
  widthClassName?: string; // e.g. "w-64"
  title?: string;
  onSelect?: (key: string) => void;
};

const menuItems: Array<{ key: string; label: string; icon: string; href: string }> = [
  { key: "home", label: "Home", icon: "🏠", href: "/" },
  { key: "analytics-dashboard", label: "Analytics\nDashboard", icon: "📈", href: "/dashboard" },
  { key: "merchant-admin-daily-rewards", label: "Daily Rewards", icon: "🎯", href: "/merchant-admin/daily-rewards?appId=APP123" },
  { key: "merchant-admin-offers", label: "Offers", icon: "🎁", href: "/merchant-admin/offers?appId=APP123" },
  { key: "merchant-admin-products", label: "Products", icon: "📦", href: "/products?appId=APP123" },
  { key: "merchant-admin-patch-notes", label: "Patch Notes", icon: "📋", href: "/merchant-admin/patch-notes?appId=APP123" },
  { key: "merchant-admin-localization", label: "Localization", icon: "🌐", href: "/merchant-admin/localization" },
  { key: "ui-builder", label: "Builder", icon: "🛠️", href: "/ui-builder?appId=APP123&pageSlug=store" },
];

export function Sidebar({ children, widthClassName = "w-64", title = "Navigation", onSelect }: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const isAdmin = useMemo(() => {
    if (typeof window === "undefined") return false;
    const url = new URL(window.location.href);
    return url.searchParams.get("role") === "admin";
  }, [pathname]); // Re-evaluate when pathname changes
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

  const isActive = (itemHref: string): boolean => {
    const basePath = itemHref.split("?")[0];

    if (basePath === "/") {
      return pathname === "/";
    }

    return pathname?.startsWith(basePath) ?? false;
  };

  return (
    <aside role="complementary" aria-label="Sidebar" data-testid="sidebar" style={containerStyle}>
      {children ?? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1D4ED8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>WS</div>
            <span style={{ color: "#E5E7EB", fontWeight: 600, letterSpacing: 0.3 }}>Web Shop</span>
          </div>
          <nav style={listStyle}>
            {(
              isAdmin
                ? menuItems
                    .filter((item) => item.key !== "merchant-admin-offers" && item.key !== "merchant-admin-products")
                    .map((item) =>
                      item.key === "ui-builder"
                        ? { ...item, href: "/ui-builder?role=admin" }
                        : item.key === "merchant-admin-daily-rewards"
                        ? { ...item, href: "/merchant-admin/daily-rewards" }
                        : item.key === "merchant-admin-offers"
                        ? { ...item, href: "/merchant-admin/offers" }
                        : item.key === "merchant-admin-products"
                        ? { ...item, href: "/products" }
                        : item.key === "merchant-admin-patch-notes"
                        ? { ...item, href: "/merchant-admin/patch-notes" }
                        : item
                    )
                : menuItems
            ).map((item) => (
              <Link
                key={item.key}
                href={item.href}
                style={{ ...itemStyle(isActive(item.href)), transition: "background-color .15s ease" }}
                onClick={() => {
                  onSelect?.(item.key);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isActive(item.href) ? "#3B3F4A" : "#1B1E26";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive(item.href) ? "#3B3F4A" : "transparent";
                }}
              >
                <span style={iconStyle(isActive(item.href))} aria-hidden>
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


