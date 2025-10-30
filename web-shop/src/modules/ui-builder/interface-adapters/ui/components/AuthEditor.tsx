"use client";

import React from 'react';

type Props = {
  value: Record<string, unknown> | null;
  onUpdateButton: (input: { text?: string; icon?: string; styles?: Record<string, string> }) => void;
  onUpdatePopup: (input: { userIdPlaceholder?: string; enterUserId?: string; visible?: boolean }) => void;
  tab: "button" | "popup";
};

export function AuthEditor({ value, onUpdateButton, onUpdatePopup, tab }: Props): JSX.Element {
  const auth = (value as any)?.authentication || {};
  const labels = (value as any)?.labels || {};

  const buttonStyles = (auth.loginButtonUI?.styles || {}) as Record<string, string>;
  const buttonText = auth.loginButtonUI?.props?.text || "Login";
  const buttonIcon = auth.loginButtonUI?.props?.icon || "";

  return (
    <div className="bg-white rounded-lg shadow p-3">
      {tab === "button" && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span>Text</span>
            <input className="border rounded px-2 py-1" defaultValue={buttonText} onChange={e => onUpdateButton({ text: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Icon</span>
            <input className="border rounded px-2 py-1" defaultValue={buttonIcon} onChange={e => onUpdateButton({ icon: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Background</span>
            <input className="border rounded px-2 py-1" defaultValue={buttonStyles.backgroundColor || ''} onChange={e => onUpdateButton({ styles: { backgroundColor: e.target.value } })} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Text Color</span>
            <input className="border rounded px-2 py-1" defaultValue={buttonStyles.color || buttonStyles.textColor || ''} onChange={e => onUpdateButton({ styles: { color: e.target.value, textColor: e.target.value } })} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Border Radius</span>
            <input className="border rounded px-2 py-1" defaultValue={buttonStyles.borderRadius || ''} onChange={e => onUpdateButton({ styles: { borderRadius: e.target.value } })} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Padding</span>
            <input className="border rounded px-2 py-1" defaultValue={buttonStyles.padding || ''} onChange={e => onUpdateButton({ styles: { padding: e.target.value } })} />
          </label>
        </div>
      )}

      {tab === "popup" && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span>UserId Placeholder</span>
            <input className="border rounded px-2 py-1" defaultValue={labels.userIdPlaceholder || ''} onChange={e => onUpdatePopup({ userIdPlaceholder: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Enter Button Text</span>
            <input className="border rounded px-2 py-1" defaultValue={labels.enterUserId || ''} onChange={e => onUpdatePopup({ enterUserId: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );
}


