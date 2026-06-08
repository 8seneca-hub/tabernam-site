import { getContactTexts, getContactOffice } from '@/lib/directus';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const [texts, office] = await Promise.all([
    getContactTexts(),
    getContactOffice(),
  ]);
  return <ContactContent texts={texts} office={office} />;
}
