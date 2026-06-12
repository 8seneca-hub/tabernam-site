// Static fallback dictionary for CV page text. Education + experience entries
// now live in their own Directus collections (cv_education, cv_experience).
// Blur-preview labels (china/languages/skills sections) are hardcoded in
// CVSection because the user can't actually read them under the blur.
export const CV_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'cv.section.education': 'Education',
    'cv.section.experience': 'Work experience',

    'cv.cta.viewFull': 'View full CV',
    'cv.contact.title': 'Get in touch',
    'cv.contact.intro': 'If you are interested in my CV, please contact me:',
    'cv.contact.cta': 'Contact page',
    'cv.modal.title': 'Request the full CV',
    'cv.modal.intro': 'Send a short note to Tibor and he will share the full CV with you directly.',
    'cv.modal.field.name': 'Name',
    'cv.modal.field.email': 'Email',
    'cv.modal.field.company': 'Company',
    'cv.modal.field.message': 'Message',
    'cv.modal.messagePlaceholder': 'A line about why you’d like to see the full CV…',
    'cv.modal.cancel': 'Cancel',
    'cv.modal.submit': 'Send inquiry',
    'cv.modal.close': 'Close',
    'cv.modal.subject': 'Request — full CV (Tibor Buček)',
    'cv.modal.defaultBody': 'I would like to receive the full CV.',
  },
  sk: {
    'cv.section.education': 'Vzdelanie',
    'cv.section.experience': 'Pracovné skúsenosti',

    'cv.cta.viewFull': 'Zobraziť celé CV',
    'cv.contact.title': 'Kontakt',
    'cv.contact.intro': 'Ak vás zaujíma moje CV, kontaktujte ma:',
    'cv.contact.cta': 'Kontaktná stránka',
    'cv.modal.title': 'Vyžiadať celé CV',
    'cv.modal.intro': 'Pošlite Tiborovi krátku správu a on vám pošle celé CV priamo.',
    'cv.modal.field.name': 'Meno',
    'cv.modal.field.email': 'E-mail',
    'cv.modal.field.company': 'Spoločnosť',
    'cv.modal.field.message': 'Správa',
    'cv.modal.messagePlaceholder': 'Krátka poznámka, prečo by ste chceli vidieť celé CV…',
    'cv.modal.cancel': 'Zrušiť',
    'cv.modal.submit': 'Odoslať žiadosť',
    'cv.modal.close': 'Zavrieť',
    'cv.modal.subject': 'Žiadosť — celé CV (Tibor Buček)',
    'cv.modal.defaultBody': 'Rád by som dostal celé CV.',
  },
};
