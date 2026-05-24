import { getPageTexts, getContactAddresses, getContactOffices } from '@/lib/directus';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const [texts, addresses, offices] = await Promise.all([
    getPageTexts('contact'),
    getContactAddresses(),
    getContactOffices(),
  ]);
  return <ContactContent texts={texts} addresses={addresses} offices={offices} />;
}
