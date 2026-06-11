'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import PinDetailCard, { type CardData } from './PinDetailCard';

interface Props {
  isOpen: boolean;
  card: CardData | null;
  photoIdx: number;
  regionKey: string;
  panelGoToLocationLabel: string;
  btnExploreNowLabel: string;
  onClose: () => void;
  onLocationClick: () => void;
}

export default function PinDetailSheet({
  isOpen,
  card,
  photoIdx,
  regionKey,
  panelGoToLocationLabel,
  btnExploreNowLabel,
  onClose,
  onLocationClick,
}: Props) {
  const sheetRef = useRef<HTMLElement>(null);
  const sheetDragRef = useRef<{ startY: number; collapsedPx: number; dragging: boolean }>({
    startY: 0,
    collapsedPx: 0,
    dragging: false,
  });
  const sheetCollapsedRef = useRef(0);
  const sheetRafRef = useRef(0);
  const sheetLastYRef = useRef(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // Reset to collapsed peek whenever the selected city changes.
  const slug = card?.citySlug ?? null;
  useEffect(() => {
    setSheetExpanded(false);
  }, [slug]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !card) return;
    const measure = () => {
      const h = sheet.getBoundingClientRect().height;
      const peek = Math.min(h, 0.5 * window.innerHeight);
      const collapsed = Math.max(0, h - peek);
      sheet.style.setProperty('--sheet-collapsed', `${collapsed}px`);
      sheetCollapsedRef.current = collapsed;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sheet);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [card]);

  const collapsedOffsetPx = () => sheetCollapsedRef.current;

  const onSheetDragStart = (e: PointerEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheetDragRef.current = {
      startY: e.clientY,
      collapsedPx: collapsedOffsetPx(),
      dragging: true,
    };
    sheetLastYRef.current = e.clientY;
    sheet.style.transition = 'none';
    sheet.style.willChange = 'transform';
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  // Apply the latest drag position once per frame (rAF-throttled) for smoothness.
  const renderSheetDrag = () => {
    sheetRafRef.current = 0;
    const drag = sheetDragRef.current;
    const sheet = sheetRef.current;
    if (!drag.dragging || !sheet) return;
    const base = sheetExpanded ? 0 : drag.collapsedPx;
    // Cap upward at 0 (fully expanded), but allow dragging past collapsedPx
    // so the user sees the sheet move down before the close-on-release snap.
    const next = Math.max(0, base + (sheetLastYRef.current - drag.startY));
    sheet.style.transform = `translate3d(0, ${next}px, 0)`;
  };

  const onSheetDragMove = (e: PointerEvent) => {
    if (!sheetDragRef.current.dragging) return;
    sheetLastYRef.current = e.clientY;
    if (!sheetRafRef.current) {
      sheetRafRef.current = requestAnimationFrame(renderSheetDrag);
    }
  };

  // Drag down this far past collapsedPx → close the card instead of snapping
  // back. Keeps small overshoots from accidentally dismissing the sheet.
  const CLOSE_DRAG_THRESHOLD_PX = 80;

  const onSheetDragEnd = (e: PointerEvent) => {
    const drag = sheetDragRef.current;
    const sheet = sheetRef.current;
    if (!drag.dragging || !sheet) return;
    drag.dragging = false;
    if (sheetRafRef.current) {
      cancelAnimationFrame(sheetRafRef.current);
      sheetRafRef.current = 0;
    }
    const base = sheetExpanded ? 0 : drag.collapsedPx;
    const ended = Math.max(0, base + (e.clientY - drag.startY));

    // Pulled well past the collapsed peek → close the card entirely.
    if (ended > drag.collapsedPx + CLOSE_DRAG_THRESHOLD_PX) {
      sheet.style.transition = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';
      sheet.style.transform = `translate3d(0, ${window.innerHeight}px, 0)`;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        sheet.removeEventListener('transitionend', finish);
        sheet.style.transition = '';
        sheet.style.transform = '';
        sheet.style.willChange = '';
        onClose();
      };
      sheet.addEventListener('transitionend', finish);
      window.setTimeout(finish, 360);
      return;
    }

    // Otherwise snap between expanded (0) and collapsed peek.
    const clamped = Math.min(drag.collapsedPx, ended);
    const willExpand = clamped < drag.collapsedPx / 2;
    const target = willExpand ? 0 : drag.collapsedPx;
    // Animate to the snap target inline, then hand control back to the CSS
    // class (which now matches `sheetExpanded`) once the transition settles.
    sheet.style.transition = 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)';
    sheet.style.transform = `translate3d(0, ${target}px, 0)`;
    setSheetExpanded(willExpand);
    const clear = () => {
      sheet.style.transition = '';
      sheet.style.transform = '';
      sheet.style.willChange = '';
      sheet.removeEventListener('transitionend', clear);
    };
    sheet.addEventListener('transitionend', clear);
    window.setTimeout(clear, 480);
  };

  const visible = isOpen && !!card;

  return (
    <aside
      ref={sheetRef}
      className={`ga-panel${visible ? ' in' : ''}${sheetExpanded ? ' expanded' : ''}`}
      aria-hidden={!visible}
    >
      {card && (
        <PinDetailCard
          card={card}
          photoIdx={photoIdx}
          regionKey={regionKey}
          panelGoToLocationLabel={panelGoToLocationLabel}
          btnExploreNowLabel={btnExploreNowLabel}
          onClose={onClose}
          onLocationClick={onLocationClick}
          dragHandlers={{
            onPointerDown: onSheetDragStart,
            onPointerMove: onSheetDragMove,
            onPointerUp: onSheetDragEnd,
            onPointerCancel: onSheetDragEnd,
          }}
        />
      )}
    </aside>
  );
}
