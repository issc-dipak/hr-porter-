"use client";

import { useServerInsertedHTML } from 'next/navigation';

export default function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="hr-theme-init"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              try {
                const stored = localStorage.getItem('hr_system_dark_mode');
                const shouldUseDark = stored === null ? true : stored === 'true';
                document.documentElement.classList.toggle('dark', shouldUseDark);
              } catch (_) {
                document.documentElement.classList.add('dark');
              }
            })();
          `
        }}
      />
    );
  });

  return null;
}
