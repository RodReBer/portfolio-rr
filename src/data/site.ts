export const LANGS = ["es", "en"] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "es";

export interface NavigationItem {
  id: "projects" | "experience" | "about" | "contact";
  label: string;
  href: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string; // "YYYY-MM"
  endDate: string | null; // "YYYY-MM", o null si es el puesto actual
  description: string;
}

export interface SiteCopy {
  meta: {
    title: string;
    description: string;
  };
  nav: readonly NavigationItem[];
  language: {
    label: string;
    switchTo: string;
  };
  hero: {
    eyebrow: string;
    greeting: string;
    name: string;
    years: string;
    role: string;
    description: string;
    viewProjects: string;
    contact: string;
    portraitAlt: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    viewCaseStudy: string;
    visitWebsite: string;
    imageAlt: string;
  };
  experience: {
    eyebrow: string;
    title: string;
    description: string;
    present: string;
    items: readonly ExperienceItem[];
  };
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    description: string;
    strengthsTitle: string;
    strengths: readonly string[];
    primaryTechnologiesTitle: string;
    primaryTechnologies: readonly string[];
    moreTechnologiesSummary: string;
    moreTechnologies: readonly string[];
  };
  contact: {
    // Texto de la sección (lo usa HomePage)
    eyebrow: string;
    title: string;
    description: string;
    availability: string;
    responseTime: string;
    // Formulario (lo usa Contact.astro) — única fuente del copy del form
    nameLabel: string;
    emailLabel: string;
    subjectLabel: string;
    messageLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    success: string;
    // Mensajes de error (el cliente los muestra según la validación nativa)
    errorRequired: string;
    errorTooShort: string;
    errorEmail: string;
    errorGeneric: string;
    errorRecaptcha: string;
  };
  cube: {
    title: string;
    instructions: string;
    play: string;
    pause: string;
    scramble: string;
    solve: string;
    reset: string;
    load: string;
    loading: string;
    fallback: string;
    statusReady: string;
    statusPlaying: string;
    statusPaused: string;
    statusScrambling: string;
    statusSolving: string;
  };
  projectDetail: {
    eyebrow: string;
    back: string;
    overview: string;
    features: string;
    visitWebsite: string;
    previous: string;
    next: string;
    imageAlt: string;
  };
  footer: {
    tagline: string;
    rights: string;
  };
}

export interface ProjectContent {
  title: string;
  summary: string;
  features: readonly string[];
}

export interface ProjectDefinition {
  slug: string;
  accent: string;
  image: string;
  logo: string;
  website: string;
  brand: string;
  brandSecondary: string;
  content: Readonly<Record<Lang, ProjectContent>>;
}

export interface LocalizedProject extends ProjectContent {
  slug: string;
  accent: string;
  image: string;
  logo: string;
  website: string;
  brand: string;
  brandSecondary: string;
  href: string;
}

export const SITE_COPY: Readonly<Record<Lang, SiteCopy>> = {
  es: {
    meta: {
      title: "Rodrigo Rey — Desarrollador web y de software",
      description:
        "Portfolio de Rodrigo Rey, desarrollador web y de software con más de 4 años de experiencia creando aplicaciones digitales.",
    },
    nav: [
      { id: "projects", label: "Proyectos", href: "#projects" },
      { id: "experience", label: "Experiencia", href: "#experience" },
      { id: "about", label: "Sobre mí", href: "#about" },
      { id: "contact", label: "Contacto", href: "#contact" },
    ],
    language: {
      label: "Idioma",
      switchTo: "View in English",
    },
    hero: {
      eyebrow: "Disponible para nuevos proyectos",
      greeting: "Hola, soy",
      name: "Rodrigo Rey",
      years: "+4 años de experiencia",
      role: "Desarrollador web y de software",
      description:
        "Creo aplicaciones únicas, claras y sólidas para convertir ideas en experiencias digitales que funcionan.",
      viewProjects: "Ver proyectos",
      contact: "Hablemos",
      portraitAlt: "Retrato de Rodrigo Rey",
    },
    projects: {
      eyebrow: "Trabajo seleccionado",
      title: "Proyectos que resuelven necesidades reales",
      description:
        "Una selección de plataformas institucionales, comerciales y comunitarias desarrolladas para organizaciones uruguayas.",
      viewCaseStudy: "Ver proyecto",
      visitWebsite: "Visitar sitio",
      imageAlt: "Vista del proyecto",
    },
    experience: {
      eyebrow: "Trayectoria",
      title: "Experiencia laboral",
      description:
        "Desarrollo de productos web y móviles, desde el trabajo independiente hasta equipos de producto.",
      present: "Actualidad",
      items: [
        {
          company: "Interfase Global",
          role: "Desarrollador Fullstack SSR",
          startDate: "2026-08",
          endDate: null,
          description:
            "Desarrollo de aplicaciones empresariales con HCL Domino y React.",
        },
        {
          company: "Dynamia",
          role: "Desarrollador Fullstack Jr.",
          startDate: "2025-07",
          endDate: "2026-07",
          description:
            "Desarrollo de una aplicación móvil en React Native y de aplicaciones web con React, Vite y TanStack, cuidando la arquitectura y aplicando patrones de diseño. Participé en múltiples proyectos integrando APIs y diseñando interfaces, en contacto directo con el cliente, además del mantenimiento de sitios existentes.",
        },
        {
          company: "Freelance",
          role: "Desarrollador Fullstack",
          startDate: "2023-01",
          endDate: null,
          description:
            "Soluciones web y móviles a medida, adaptadas a la necesidad de cada cliente y construidas con la tecnología que mejor se ajuste al proyecto.",
        },
      ],
    },
    about: {
      eyebrow: "Sobre mí",
      title: "Tecnología, criterio y trabajo en equipo",
      intro:
        "Soy estudiante avanzado de Ingeniería en Sistemas, apasionado por la tecnología y la resolución de problemas.",
      description:
        "Combino una base técnica en crecimiento con comunicación y colaboración. Me motiva participar en proyectos que generen un impacto positivo y estén alineados con objetivos de negocio.",
      strengthsTitle: "Cómo trabajo",
      strengths: [
        "Resolución de problemas",
        "Comunicación clara",
        "Colaboración en equipo",
      ],
      primaryTechnologiesTitle: "Tecnologías principales",
      primaryTechnologies: [
        "TypeScript",
        "React",
        "Astro",
        "Next.js",
        "Node.js",
        "Docker",
      ],
      moreTechnologiesSummary: "Ver otras tecnologías",
      moreTechnologies: [
        "JavaScript",
        "Python",
        "C#",
        ".NET",
        "PHP",
        "Laravel",
        "HTML",
        "CSS",
        "Sass",
        "Tailwind CSS",
        "Bootstrap",
        "Express",
        "Firebase",
        "MongoDB",
        "MySQL",
        "Microsoft SQL Server",
        "AWS",
        "Cloudflare",
        "Git",
      ],
    },
    contact: {
      eyebrow: "Contacto",
      title: "Construyamos algo que encaje",
      description:
        "Contame sobre tu proyecto, equipo o desafío. Puedo ayudarte a llevarlo de una idea a una experiencia digital concreta.",
      availability: "Disponible para nuevos proyectos y oportunidades",
      responseTime: "Respuesta estimada: 24–48 horas",
      nameLabel: "Nombre",
      emailLabel: "Email",
      subjectLabel: "Asunto",
      messageLabel: "Mensaje",
      namePlaceholder: "Tu nombre",
      emailPlaceholder: "tu@email.com",
      subjectPlaceholder: "¿En qué puedo ayudarte?",
      messagePlaceholder: "Contame brevemente sobre el proyecto...",
      submit: "Enviar mensaje",
      sending: "Enviando…",
      success: "¡Gracias! Tu mensaje fue enviado. Te responderé pronto.",
      errorRequired: "Completá este campo.",
      errorTooShort: "Todavía es muy corto.",
      errorEmail: "Ingresá un email válido.",
      errorGeneric: "No pude enviar el mensaje. Probá de nuevo en un rato.",
      errorRecaptcha:
        "No se pudo iniciar la verificación de seguridad. Revisá tu conexión e intentá otra vez.",
    },
    cube: {
      title: "Cubo de Rubik interactivo",
      instructions:
        "Arrastrá horizontalmente para girar el cubo. También podés usar las flechas del teclado.",
      play: "Reproducir demostración",
      pause: "Pausar demostración",
      scramble: "Mezclar cubo",
      solve: "Resolver cubo",
      reset: "Restablecer vista",
      load: "Activar cubo 3D",
      loading: "Cargando cubo 3D…",
      fallback: "La vista 3D no está disponible. Se muestra una versión estática.",
      statusReady: "Cubo listo",
      statusPlaying: "Demostración en curso",
      statusPaused: "Demostración pausada",
      statusScrambling: "Mezclando el cubo",
      statusSolving: "Resolviendo el cubo",
    },
    projectDetail: {
      eyebrow: "Proyecto seleccionado",
      back: "Volver a proyectos",
      overview: "Descripción",
      features: "Funcionalidades",
      visitWebsite: "Visitar sitio web",
      previous: "Proyecto anterior",
      next: "Proyecto siguiente",
      imageAlt: "Captura del proyecto",
    },
    footer: {
      tagline: "Creando experiencias digitales",
      rights: "Todos los derechos reservados.",
    },
  },
  en: {
    meta: {
      title: "Rodrigo Rey — Web and software developer",
      description:
        "Portfolio of Rodrigo Rey, a web and software developer with 4+ years of experience creating digital applications.",
    },
    nav: [
      { id: "projects", label: "Projects", href: "#projects" },
      { id: "experience", label: "Experience", href: "#experience" },
      { id: "about", label: "About", href: "#about" },
      { id: "contact", label: "Contact", href: "#contact" },
    ],
    language: {
      label: "Language",
      switchTo: "Ver en español",
    },
    hero: {
      eyebrow: "Available for new projects",
      greeting: "Hi, I'm",
      name: "Rodrigo Rey",
      years: "4+ years of experience",
      role: "Web and software developer",
      description:
        "I create distinctive, clear and reliable applications that turn ideas into digital experiences that work.",
      viewProjects: "View projects",
      contact: "Let's talk",
      portraitAlt: "Portrait of Rodrigo Rey",
    },
    projects: {
      eyebrow: "Selected work",
      title: "Projects built around real needs",
      description:
        "A selection of institutional, commercial and community platforms developed for Uruguayan organizations.",
      viewCaseStudy: "View project",
      visitWebsite: "Visit website",
      imageAlt: "Project preview",
    },
    experience: {
      eyebrow: "Career",
      title: "Work experience",
      description:
        "Web and mobile product development, from independent work to product teams.",
      present: "Present",
      items: [
        {
          company: "Interfase Global",
          role: "Semi-Senior Fullstack Developer",
          startDate: "2026-08",
          endDate: null,
          description:
            "Building enterprise applications with HCL Domino and React.",
        },
        {
          company: "Dynamia",
          role: "Junior Fullstack Developer",
          startDate: "2025-07",
          endDate: "2026-07",
          description:
            "Development of a React Native mobile app and web applications with React, Vite and TanStack, with care for architecture and design patterns. Worked across multiple projects integrating APIs and designing interfaces, in direct contact with the client, along with maintaining existing websites.",
        },
        {
          company: "Freelance",
          role: "Fullstack Developer",
          startDate: "2023-01",
          endDate: null,
          description:
            "Custom web and mobile solutions, tailored to each client's needs and built with whatever technology best fits the project.",
        },
      ],
    },
    about: {
      eyebrow: "About me",
      title: "Technology, sound judgment and teamwork",
      intro:
        "I am an advanced Systems Engineering student with a passion for technology and problem solving.",
      description:
        "I combine a growing technical foundation with communication and collaboration. I am motivated to contribute to projects that make a positive impact and align with business goals.",
      strengthsTitle: "How I work",
      strengths: [
        "Problem solving",
        "Clear communication",
        "Team collaboration",
      ],
      primaryTechnologiesTitle: "Core technologies",
      primaryTechnologies: [
        "TypeScript",
        "React",
        "Astro",
        "Next.js",
        "Node.js",
        "Docker",
      ],
      moreTechnologiesSummary: "View other technologies",
      moreTechnologies: [
        "JavaScript",
        "Python",
        "C#",
        ".NET",
        "PHP",
        "Laravel",
        "HTML",
        "CSS",
        "Sass",
        "Tailwind CSS",
        "Bootstrap",
        "Express",
        "Firebase",
        "MongoDB",
        "MySQL",
        "Microsoft SQL Server",
        "AWS",
        "Cloudflare",
        "Git",
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Let's build something that fits",
      description:
        "Tell me about your project, team or challenge. I can help take it from an idea to a tangible digital experience.",
      availability: "Available for new projects and opportunities",
      responseTime: "Estimated response time: 24–48 hours",
      nameLabel: "Name",
      emailLabel: "Email",
      subjectLabel: "Subject",
      messageLabel: "Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@email.com",
      subjectPlaceholder: "How can I help?",
      messagePlaceholder: "Tell me briefly about the project...",
      submit: "Send message",
      sending: "Sending…",
      success: "Thank you! Your message was sent. I'll get back to you soon.",
      errorRequired: "Please fill in this field.",
      errorTooShort: "This is still too short.",
      errorEmail: "Enter a valid email.",
      errorGeneric: "I couldn't send your message. Please try again in a bit.",
      errorRecaptcha:
        "The security check could not start. Check your connection and try again.",
    },
    cube: {
      title: "Interactive Rubik's Cube",
      instructions:
        "Drag horizontally to rotate the cube. You can also use the arrow keys.",
      play: "Play demonstration",
      pause: "Pause demonstration",
      scramble: "Scramble cube",
      solve: "Solve cube",
      reset: "Reset view",
      load: "Enable 3D cube",
      loading: "Loading 3D cube…",
      fallback: "The 3D view is unavailable. A static version is shown.",
      statusReady: "Cube ready",
      statusPlaying: "Demonstration playing",
      statusPaused: "Demonstration paused",
      statusScrambling: "Scrambling the cube",
      statusSolving: "Solving the cube",
    },
    projectDetail: {
      eyebrow: "Selected project",
      back: "Back to projects",
      overview: "Overview",
      features: "Features",
      visitWebsite: "Visit website",
      previous: "Previous project",
      next: "Next project",
      imageAlt: "Project screenshot",
    },
    footer: {
      tagline: "Building digital experiences",
      rights: "All rights reserved.",
    },
  },
};

export const PROJECTS: readonly ProjectDefinition[] = [
  {
    slug: "capdi",
    accent: "#0057B8",
    image: "/projects/capdi.webp",
    logo: "/projects/icons/capdi-logo.webp",
    website: "https://capdi.com.uy",
    brand: "Capdi",
    brandSecondary: "",
    content: {
      es: {
        title: "Capdi",
        summary:
          "Sitio para una escuela taller dirigida a jóvenes y adultos con capacidades diferentes.",
        features: ["Presentación institucional de la escuela taller y su propósito."],
      },
      en: {
        title: "Capdi",
        summary:
          "Website for a workshop school serving young people and adults with different abilities.",
        features: ["Institutional presentation of the workshop school and its purpose."],
      },
    },
  },
  {
    slug: "reina-reyes",
    accent: "#FFD500",
    image: "/projects/reina-reyes.webp",
    logo: "/projects/icons/reina-logo.webp",
    website: "https://reinareyes.edu.uy",
    brand: "Colegio y Liceo",
    brandSecondary: "Reina Reyes",
    content: {
      es: {
        title: "Colegio y Liceo Reina Reyes",
        summary:
          "Plataforma institucional donde las familias pueden inscribir alumnos, explorar oportunidades laborales y mantenerse en contacto con la institución.",
        features: [
          "Inscripción de alumnos.",
          "Publicación de oportunidades laborales.",
          "Información para mantener conectada a la comunidad educativa.",
        ],
      },
      en: {
        title: "Colegio y Liceo Reina Reyes",
        summary:
          "Institutional platform where families can enroll students, explore job opportunities and stay connected with the school community.",
        features: [
          "Student enrollment.",
          "Job opportunity listings.",
          "Information that keeps the school community connected.",
        ],
      },
    },
  },
  {
    slug: "lerogo",
    accent: "#FF6B1A",
    image: "/projects/lerogo.webp",
    logo: "/projects/icons/lerogosrl-logo.webp",
    website: "https://lerogosrl.com",
    brand: "Lerogo",
    brandSecondary: "SRL",
    content: {
      es: {
        title: "Lerogo",
        summary:
          "Sitio portfolio que exhibe proyectos de construcción realizados y presenta la oferta de servicios de la empresa.",
        features: [
          "Galería de proyectos de construcción realizados.",
          "Presentación de los servicios de la empresa.",
        ],
      },
      en: {
        title: "Lerogo",
        summary:
          "Portfolio website showcasing completed construction projects and the company's range of services.",
        features: [
          "Gallery of completed construction projects.",
          "Presentation of the company's services.",
        ],
      },
    },
  },
  {
    slug: "crece600",
    accent: "#009B5A",
    image: "/projects/crece.webp",
    logo: "/projects/icons/crece-logo.webp",
    website: "https://crece600.uy",
    brand: "Crece",
    brandSecondary: "Robert Silva",
    content: {
      es: {
        title: "Crece 600",
        summary:
          "Plataforma política donde los ciudadanos pueden presentar propuestas de ley, donar y sumarse al sector de Robert Silva.",
        features: [
          "Recepción de propuestas de ley ciudadanas.",
          "Donaciones y adhesión al movimiento.",
          "Panel administrativo para publicar proyectos, archivos y contenido.",
        ],
      },
      en: {
        title: "Crece 600",
        summary:
          "Political platform where citizens can submit law proposals, donate and join Robert Silva's movement.",
        features: [
          "Citizen law proposal submissions.",
          "Donations and movement registration.",
          "Admin panel for publishing projects, files and content.",
        ],
      },
    },
  },
];

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && LANGS.includes(value as Lang);
}

export function normalizeLang(value: unknown): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

export function resolvePreferredLang(
  cookieLang: string | undefined,
  acceptLanguage: string | null,
): Lang {
  // 1) Si el visitante ya eligió idioma (cookie), respetarlo.
  if (isLang(cookieLang)) return cookieLang;

  // 2) Si no, mirar solo el primer idioma que pide el navegador. Alcanza para
  //    2 idiomas: si prefiere inglés usamos "en", si no, el idioma por defecto.
  const preferred = acceptLanguage?.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return preferred === "en" ? "en" : DEFAULT_LANG;
}

export function getSiteCopy(lang: Lang): SiteCopy {
  return SITE_COPY[lang];
}

// Nota: este módulo también lo importan los tests de node:test, que corren fuera
// de Astro, así que no puede usar `getRelativeLocaleUrl` de "astro:i18n" (módulo
// virtual). La ruta se arma a mano; el resultado es idéntico al del helper nativo
// con la config i18n actual (prefixDefaultLocale + trailingSlash directory).
export function getProjectHref(lang: Lang, slug: string): string {
  return `/${lang}/projects/${slug}/`;
}

export function getProjects(lang: Lang): LocalizedProject[] {
  return PROJECTS.map((project) => ({
    slug: project.slug,
    accent: project.accent,
    image: project.image,
    logo: project.logo,
    website: project.website,
    brand: project.brand,
    brandSecondary: project.brandSecondary,
    href: getProjectHref(lang, project.slug),
    ...project.content[lang],
  }));
}

export function getProject(
  lang: Lang,
  slug: string,
): LocalizedProject | undefined {
  return getProjects(lang).find((project) => project.slug === slug);
}

export function getAdjacentProjects(
  lang: Lang,
  slug: string,
): { previous: LocalizedProject; next: LocalizedProject } | undefined {
  const projects = getProjects(lang);
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) return undefined;

  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  if (!previous || !next) return undefined;

  return {
    previous,
    next,
  };
}

export function getAlternatePath(path: string, targetLang: Lang): string {
  const match = path.match(/^(\/)(?:es|en)(?=\/|$)/);
  if (match) return path.replace(/^\/(?:es|en)(?=\/|$)/, `/${targetLang}`);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${targetLang}${normalizedPath === "/" ? "/" : normalizedPath}`;
}
