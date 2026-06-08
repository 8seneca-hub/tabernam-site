import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from './client';
import { composePageBundle, type PageTextsBundle } from './pages';
import type { ContactOffice, LabeledRow } from '../data';

export function getContactTexts(): Promise<PageTextsBundle> {
  return composePageBundle('contact');
}

function splitLines(value: string | null | undefined): string[] {
  return (value || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLabeledRows(value: string | null | undefined): LabeledRow[] {
  return splitLines(value).map((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return { label: '', value: line };
    return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
  });
}

// Operational contact data is now stored as singleton-level fields on the
// `contact` collection (formerly `contact_offices`). Map images live in the
// `contact_files` junction.
export async function getContactOffice(): Promise<ContactOffice | null> {
  try {
    const o = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('contact', { fields: ['*', { maps: ['directus_files_id'] }] } as any),
    )) as unknown as {
      slug: string; region: string; label: string; icon: string;
      org_name: string; zone: string; role_label: string; role_name: string;
      address: string; corporate_ids: string;
      phone: string; website_url: string; whatsapp: string; wechat: string;
      work_email: string; personal_email: string;
      bank_credentials: string;
      maps?: Array<{ directus_files_id: string }>;
    };
    return {
      slug: o.slug,
      region: o.region,
      label: o.label,
      icon: o.icon,
      orgName: o.org_name,
      zone: o.zone,
      roleLabel: o.role_label,
      roleName: o.role_name,
      addressLines: splitLines(o.address),
      corporateIds: parseLabeledRows(o.corporate_ids),
      phone: o.phone,
      websiteUrl: o.website_url,
      whatsapp: o.whatsapp,
      wechat: o.wechat,
      workEmail: o.work_email,
      personalEmail: o.personal_email,
      bankCredentials: parseLabeledRows(o.bank_credentials),
      mapImages: (o.maps || [])
        .map((m) => m.directus_files_id)
        .filter((id): id is string => !!id)
        .map((id) => assetUrl(id)),
    };
  } catch (e) {
    console.warn('Directus fetch failed for contact singleton, using fallback:', e);
    return null;
  }
}
