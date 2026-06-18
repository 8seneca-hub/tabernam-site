import { getCvEducation, getCvExperience, getCvExtras, getCvTexts } from '@/lib/directus';
import CVContent from './CVContent';

export default async function CVPage() {
  const [texts, education, experience, extras] = await Promise.all([
    getCvTexts(),
    getCvEducation(),
    getCvExperience(),
    getCvExtras(),
  ]);
  return (
    <CVContent
      texts={texts}
      education={education}
      experience={experience}
      extras={extras}
    />
  );
}
