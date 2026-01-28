'use client';

export default function CleanRenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        * {
          box-sizing: border-box;
        }
        /* Скрываем все элементы приложения */
        aside, nav, header, footer, .sidebar, .navbar {
          display: none !important;
        }
        /* Показываем только main content */
        main {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      {children}
    </>
  );
}