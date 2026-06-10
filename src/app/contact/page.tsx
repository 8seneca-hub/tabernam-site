import { getContactTexts, getContactOffice, getContactHeader } from '@/lib/directus';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const [texts, office, contactHeader] = await Promise.all([
    getContactTexts(),
    getContactOffice(),
    getContactHeader(),
  ]);
  return <ContactContent texts={texts} office={office} contactHeader={contactHeader} />;
}
