'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMsg } from '@/hooks/useWebSocketSync';

const EMOJIS = ['😀', '😂', '🔥', '🏎️', '💨', '👏', '😅', '🤝', '⚡', '🏁', '💪', '😎', '🎉', '👀', '💯', '🙌'];

function isImageUrl(text: string) {
  const t = text.trim();
  return /^https?:\/\/\S+\.(gif|png|jpg|jpeg|webp)(\?\S*)?$/i.test(t) || /^https?:\/\/(media\.giphy\.com|media\.tenor\.com|i\.imgur\.com)\/\S+$/i.test(t);
}

export default function RoomChat({
  open, onClose, messages, myName, onSend,
}: {
  open: boolean; onClose: () => void; messages: ChatMsg[]; myName: string; onSend: (t: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifHelp, setShowGifHelp] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, open]);

  if (!open) return null;

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[340px] flex-col border-l border-white/10 bg-[#0b0e14]/95 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-white">Room chat</p>
          <p className="text-[11px] text-white/45">{messages.length} messages</p>
        </div>
        <button onClick={onClose} aria-label="Close chat" className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[12px] text-white/70 hover:border-white/40 hover:text-white">✕</button>
      </div>

      <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <p className="rounded-xl bg-white/[0.04] px-3 py-4 text-center text-[12px] leading-5 text-white/45">
            Say good luck to the lobby.<br />Messages stay in this room only.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.name === myName || m.name === `${myName} (YOU)`;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'rounded-br-md bg-white text-black' : 'rounded-bl-md bg-white/[0.07] text-white'}`}>
                {!mine && <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-white/50">{m.name}</p>}
                {isImageUrl(m.text) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.text} alt="gif" className="max-h-40 rounded-lg object-cover" loading="lazy" />
                ) : (
                  <p className="break-words text-[13px] leading-5">{m.text}</p>
                )}
                <p className={`mt-1 text-right text-[9px] ${mine ? 'text-black/50' : 'text-white/35'}`}>
                  {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showEmoji && (
        <div className="grid grid-cols-8 gap-1 border-t border-white/10 px-3 py-2">
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setDraft((d) => d + e)} className="rounded-lg py-1 text-lg hover:bg-white/10">{e}</button>
          ))}
        </div>
      )}
      {showGifHelp && (
        <p className="border-t border-white/10 px-4 py-2 text-[11px] leading-4 text-white/50">
          Paste a GIF / image link (giphy, tenor, imgur…) and it will play inline like WhatsApp.
        </p>
      )}

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setShowEmoji((s) => !s); setShowGifHelp(false); }} aria-label="Emojis"
            className={`rounded-lg border px-2.5 py-2 text-[15px] ${showEmoji ? 'border-white bg-white/10' : 'border-white/15'}`}>😀</button>
          <button onClick={() => { setShowGifHelp((s) => !s); setShowEmoji(false); }} aria-label="GIF"
            className={`rounded-lg border px-2.5 py-2 text-[11px] font-bold ${showGifHelp ? 'border-white bg-white/10 text-white' : 'border-white/15 text-white/60'}`}>GIF</button>
          <input
            value={draft} maxLength={300} data-chat="1" onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); e.stopPropagation(); }}
            onKeyUp={(e) => e.stopPropagation()}
            placeholder={`Message as ${myName || 'RACER'}…`}
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-white/50"
          />
          <button onClick={submit} disabled={!draft.trim()} aria-label="Send"
            className="rounded-xl bg-white px-3 py-2 text-[13px] font-semibold text-black disabled:opacity-40">↑</button>
        </div>
      </div>
    </aside>
  );
}
