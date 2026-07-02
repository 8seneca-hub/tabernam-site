'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import posthog from 'posthog-js';
import { useI18n } from '@/app/hook/useI18n';
import Button from '@/components/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  recipient?: string;
}

const DEFAULT_RECIPIENT = 'tiborbucek@gmail.com';

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-surface text-text border border-border rounded-2 text-[15px] leading-snug outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20';

export default function RequestCvModal({ open, onClose, recipient = DEFAULT_RECIPIENT }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = t('cv.modal.subject');
    const lines = [
      `${t('cv.modal.field.name')}: ${name}`,
      `${t('cv.modal.field.email')}: ${email}`,
      company ? `${t('cv.modal.field.company')}: ${company}` : null,
      '',
      message || t('cv.modal.defaultBody'),
    ].filter((l): l is string => l !== null);
    const body = lines.join('\n');
    const href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    posthog.capture('cv_request_submitted', {
      has_company: Boolean(company),
      has_message: Boolean(message),
    });
    window.location.href = href;
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-cv-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm cursor-default"
            aria-label={t('cv.modal.close')}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-[480px] bg-bg text-text rounded-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-7 max-md:p-5"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <button
              type="button"
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-text hover:bg-surface/60 transition"
              onClick={onClose}
              aria-label={t('cv.modal.close')}
            >
              ✕
            </button>

            <h2 id="request-cv-title" className="text-2xl font-bold text-text pr-8">
              {t('cv.modal.title')}
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {t('cv.modal.intro')}
            </p>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
              <Field id="rcv-name" label={t('cv.modal.field.name')} required>
                <input
                  ref={firstFieldRef}
                  id="rcv-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field id="rcv-email" label={t('cv.modal.field.email')} required>
                <input
                  id="rcv-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field id="rcv-company" label={t('cv.modal.field.company')}>
                <input
                  id="rcv-company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field id="rcv-message" label={t('cv.modal.field.message')}>
                <textarea
                  id="rcv-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${INPUT_CLASS} resize-y`}
                  placeholder={t('cv.modal.messagePlaceholder')}
                />
              </Field>

              <div className="flex items-center justify-end gap-3 mt-1">
                <Button variant="ghost" size="sm" shape="pill" onClick={onClose}>
                  {t('cv.modal.cancel')}
                </Button>
                <Button variant="primary" size="sm" shape="pill" type="submit" className="font-semibold shadow-sm">
                  {t('cv.modal.submit')}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}{required && <span className="text-brand ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
