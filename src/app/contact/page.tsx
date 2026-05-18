import { getPageTexts, getContactAddresses } from '@/lib/directus';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const [texts, addresses] = await Promise.all([
    getPageTexts('contact'),
    getContactAddresses(),
  ]);
  return <ContactContent texts={texts} addresses={addresses} />;
}
