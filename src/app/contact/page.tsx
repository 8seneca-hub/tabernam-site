import { getPageTexts, getContactOffices } from '@/lib/directus';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const [texts, offices] = await Promise.all([
    getPageTexts('contact'),
    getContactOffices(),
  ]);
  return <ContactContent texts={texts} offices={offices} />;
}
