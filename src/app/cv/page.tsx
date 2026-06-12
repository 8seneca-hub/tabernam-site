import { getCvEducation, getCvExperience, getCvTexts } from '@/lib/directus';
import CVContent from './CVContent';

export default async function CVPage() {
  const [texts, education, experience] = await Promise.all([
    getCvTexts(),
    getCvEducation(),
    getCvExperience(),
  ]);
  return <CVContent texts={texts} education={education} experience={experience} />;
}
