// Teachers prototype mock data and types
// Supports comprehensive professor profiles, multi-community affiliations, courses taught, 5-metric stats, and reviews.


export interface TeacherCourseAffiliation {
  courseOfferingId: number;
  courseId: string;
  courseName: string;
  courseAbbr: string;
  communityId: string;
  communityName: string;
  studyYearId: number;
  studyYearDisplayName: string;
  semester: 1 | 2;
  creditPoints: number;
  passingDifficulty: "easy" | "medium" | "hard";
  syllabusAdvice?: string;
}

export interface TeacherCommunityAffiliation {
  communityId: string;
  communityName: string;
  role: string; // e.g. "Titular Curs", "Indrumator Laborator", "Profesor Coordonator"
  memberCount: number;
  bannerGradient: string;
}

export interface DetailedMetricRating {
  metricId: number;
  metricName: string;
  description: string;
  score: number; // 1.0 to 5.0
  percentage: number;
}

export interface TeacherStudentReview {
  id: string;
  studentName: string;
  studentRole: string; // e.g. "Student Anul 1", "Absolvent 2025"
  courseName: string;
  courseAbbr: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  metricScores: {
    teaching: number;
    punctuality: number;
    communication: number;
    knowledge: number;
    fairness: number;
  };
}

export interface DetailedTeacher {
  id: string;
  firstName: string;
  lastName: string;
  academicTitle: string; // e.g. "Prof. Univ. Dr.", "Conf. Univ. Dr.", "Lect. Univ. Dr."
  department: string;
  faculty: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  bio: string;
  officeHours: string;
  officeLocation: string;
  
  // Aggregate stats
  averageRating: number;
  ratingsCount: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  
  // 5-Metric Breakdown
  metrics: DetailedMetricRating[];
  
  // Affiliations
  communityIds: string[];
  communities: TeacherCommunityAffiliation[];
  coursesTaught: TeacherCourseAffiliation[];
  
  // Reviews
  reviews: TeacherStudentReview[];
}

export const DETAILED_TEACHERS: DetailedTeacher[] = [
  {
    id: "t-dragulici",
    firstName: "Daniel",
    lastName: "Dragulici",
    academicTitle: "Conf. Univ. Dr.",
    department: "Departamentul de Informatica",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "daniel.dragulici@fmi.unibuc.ro",
    avatarInitials: "DD",
    avatarColor: "bg-emerald-600",
    bio: "Specialist in arhitectura sistemelor de calcul, limbaje de asamblare RISC (MIPS32/64) si sisteme de operare de tip POSIX. Pasiune pentru proiecte practice aplicate si optimizari hardware-software.",
    officeHours: "Miercuri 14:00 - 16:00 (Corp FMI / Online)",
    officeLocation: "Cabinet 318, Corp FMI, Str. Academiei 14",
    averageRating: 4.6,
    ratingsCount: 42,
    ratingDistribution: {
      5: 28,
      4: 11,
      3: 3,
      2: 0,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Claritate in predare si explicarea conceptelor complexe", score: 4.8, percentage: 96 },
      { metricId: 2, metricName: "Punctuality", description: "Respectarea orarului si predarea notelor la timp", score: 4.9, percentage: 98 },
      { metricId: 3, metricName: "Communication", description: "Disponibilitate pe email si suport la proiecte", score: 4.4, percentage: 88 },
      { metricId: 4, metricName: "Knowledge", description: "Expertiza si profunzime in arhitecturi moderne", score: 4.9, percentage: 98 },
      { metricId: 5, metricName: "Fairness", description: "Corectitudinea evaluarii si respectarea baremului", score: 4.5, percentage: 90 },
    ],
    communityIds: ["fmi-info-id", "fmi-mate-info-if", "fmi-cti"],
    communities: [
      {
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        role: "Titular Curs & Coordonator Proiecte",
        memberCount: 342,
        bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
      },
      {
        communityId: "fmi-mate-info-if",
        communityName: "FMI - Matematica-Informatica IF",
        role: "Titular Curs ASC",
        memberCount: 518,
        bannerGradient: "from-blue-600 via-indigo-700 to-slate-900",
      },
      {
        communityId: "fmi-cti",
        communityName: "FMI - Calculatoare si Tehnologia Informatiei",
        role: "Coordonator Laborator Sisteme de Operare",
        memberCount: 295,
        bannerGradient: "from-amber-600 via-orange-700 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 1,
        courseId: "c-asc",
        courseName: "Arhitectura sistemelor de calcul",
        courseAbbr: "ASC",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "easy",
        syllabusAdvice: "Proiectul MIPS valoreaza 60%. O nota >= 5 la proiect asigura trecerea si scuteste studentul de examenul scris.",
      },
      {
        courseOfferingId: 3,
        courseId: "c-itbi",
        courseName: "Instrumente si tehnici de baza in Informatica",
        courseAbbr: "ITBI",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 1,
        creditPoints: 4,
        passingDifficulty: "easy",
        syllabusAdvice: "Proiect practic Linux / Bash / Git. Minim 5 la proiect pentru promovare rapida.",
      },
      {
        courseOfferingId: 18,
        courseId: "c-so",
        courseName: "Sisteme de operare",
        courseAbbr: "SO",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 2,
        studyYearDisplayName: "Anul 2 (2026-2027)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "Apeluri de sistem POSIX, gestiunea memoriei virtuale si threaduri pthreads.",
      },
    ],
    reviews: [
      {
        id: "rev-dd-1",
        studentName: "David Iosub",
        studentRole: "Student Anul 1 ID",
        courseName: "Arhitectura sistemelor de calcul",
        courseAbbr: "ASC",
        rating: 5,
        title: "Foarte clar si orientat spre practica",
        comment: "Explica arhitectura pe intelesul tuturor. Daca faceti proiectul MIPS serios, treceti fara emotii si scapati de examenul scris de sesiune!",
        createdAt: "2026-02-05T14:30:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 4, knowledge: 5, fairness: 5 },
      },
      {
        id: "rev-dd-2",
        studentName: "Maria Teodorescu",
        studentRole: "Student Anul 1 ID",
        courseName: "Arhitectura sistemelor de calcul",
        courseAbbr: "ASC",
        rating: 5,
        title: "Proiectul valoreaza 60%, profitati din plin!",
        comment: "Raspunde prompt pe mail si accepta imbunatatiri la simulatorul MARS daca le argumentati bine. La examenul scris aveti voie cu materiale scrise de mana.",
        createdAt: "2026-01-22T10:15:00Z",
        isVerified: true,
        metricScores: { teaching: 4, punctuality: 5, communication: 5, knowledge: 5, fairness: 5 },
      },
      {
        id: "rev-dd-3",
        studentName: "Andrei V.",
        studentRole: "Student Anul 2 CTI",
        courseName: "Sisteme de operare",
        courseAbbr: "SO",
        rating: 4,
        title: "Laboratoare solide de C/POSIX",
        comment: "Explicatii foarte clare despre pipe-uri si memorie partajata. Barem transparent de notare.",
        createdAt: "2025-12-18T16:00:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 4, communication: 4, knowledge: 5, fairness: 4 },
      },
    ],
  },
  {
    id: "t-dinu",
    firstName: "Liviu",
    lastName: "Dinu",
    academicTitle: "Prof. Univ. Dr.",
    department: "Centrul de Inteligenta Artificiala & NLP",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "liviu.dinu@fmi.unibuc.ro",
    avatarInitials: "LD",
    avatarColor: "bg-blue-600",
    bio: "Director al Centrului de Cercetare in Tehnologii ale Limbajului Natural. Peste 25 de ani de experienta in algoritmi fundamentali, lingvistica computationala si structuri de date avansate.",
    officeHours: "Marti 11:00 - 13:00",
    officeLocation: "Laboratorul de Inteligenta Artificiala, Sala 312",
    averageRating: 4.8,
    ratingsCount: 68,
    ratingDistribution: {
      5: 56,
      4: 10,
      3: 2,
      2: 0,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Claritate in predare si implicare la cursuri", score: 4.9, percentage: 98 },
      { metricId: 2, metricName: "Punctuality", description: "Punctualitate desavarsita la cursuri si examene", score: 5.0, percentage: 100 },
      { metricId: 3, metricName: "Communication", description: "Deschidere la intrebari si dialog academic", score: 4.7, percentage: 94 },
      { metricId: 4, metricName: "Knowledge", description: "Cunostinte profunde de algoritmica si NLP", score: 5.0, percentage: 100 },
      { metricId: 5, metricName: "Fairness", description: "Corectitudine impecabila la corectura", score: 4.8, percentage: 96 },
    ],
    communityIds: ["fmi-info-id", "unibuc-master-ai", "fmi-mate-info-if"],
    communities: [
      {
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        role: "Titular Curs Programarea Algoritmilor",
        memberCount: 342,
        bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
      },
      {
        communityId: "unibuc-master-ai",
        communityName: "Master Inteligenta Artificiala & Data Science",
        role: "Conducator de Doctorat & Titular NLP",
        memberCount: 186,
        bannerGradient: "from-purple-600 via-violet-800 to-slate-900",
      },
      {
        communityId: "fmi-mate-info-if",
        communityName: "FMI - Matematica-Informatica IF",
        role: "Titular Algoritmi Fundamentali",
        memberCount: 518,
        bannerGradient: "from-blue-600 via-indigo-700 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 4,
        courseId: "c-pa",
        courseName: "Programarea algoritmilor",
        courseAbbr: "PA",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 1,
        creditPoints: 6,
        passingDifficulty: "easy",
        syllabusAdvice: "Fundamente solide in Python 3. Examenul scris este bine structurat si testeaza gandirea algoritmica.",
      },
      {
        courseOfferingId: 12,
        courseId: "c-sdd",
        courseName: "Structuri de date",
        courseAbbr: "SDD",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 2,
        creditPoints: 5,
        passingDifficulty: "easy",
        syllabusAdvice: "Temele colective ofera start cu nota 4 garantat. Arbori AVL si tabele de dispersie.",
      },
      {
        courseOfferingId: 13,
        courseId: "c-af",
        courseName: "Algoritmi fundamentali",
        courseAbbr: "AF",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 2,
        studyYearDisplayName: "Anul 2 (2026-2027)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "Fluxuri in retele si algoritmi pe grafuri de complexitate O(V+E).",
      },
    ],
    reviews: [
      {
        id: "rev-ld-1",
        studentName: "David Iosub",
        studentRole: "Student Anul 1 ID",
        courseName: "Programarea algoritmilor",
        courseAbbr: "PA",
        rating: 5,
        title: "Cursuri interactive si exemple de top",
        comment: "Materialele sunt structurate impecabil in Python 3. Examenul este corect si testeaza gandirea algoritmica.",
        createdAt: "2026-02-01T16:00:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 5, knowledge: 5, fairness: 5 },
      },
      {
        id: "rev-ld-2",
        studentName: "Alexandra M.",
        studentRole: "Masterand AI",
        courseName: "Natural Language Processing",
        courseAbbr: "NLP",
        rating: 5,
        title: "Cel mai bun profesor de NLP din Romania",
        comment: "Pasiune autentica pentru cercetare si sprijin extraordinar pentru studentii pasionati de LLMs si procesare de limbaj.",
        createdAt: "2026-01-15T12:00:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 5, knowledge: 5, fairness: 5 },
      },
    ],
  },
  {
    id: "t-leustean",
    firstName: "Ioana",
    lastName: "Leustean",
    academicTitle: "Prof. Univ. Dr.",
    department: "Departamentul de Informatica",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "ioana.leustean@fmi.unibuc.ro",
    avatarInitials: "IL",
    avatarColor: "bg-purple-600",
    bio: "Cercetator in logica matematica, algebre multivalued si semantica limbajelor de programare. Preda cursuri fundamentale de logica, automate si programare functionala in Haskell.",
    officeHours: "Joi 12:00 - 14:00",
    officeLocation: "Cabinet 220, Corp FMI",
    averageRating: 4.7,
    ratingsCount: 51,
    ratingDistribution: {
      5: 39,
      4: 9,
      3: 3,
      2: 0,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Rigoare matematica si eleganta in demonstratii", score: 4.8, percentage: 96 },
      { metricId: 2, metricName: "Punctuality", description: "Punctualitate la consultatii si raspunsuri", score: 4.9, percentage: 98 },
      { metricId: 3, metricName: "Communication", description: "Ghidare atenta pentru intelegerea formalismelor", score: 4.6, percentage: 92 },
      { metricId: 4, metricName: "Knowledge", description: "Stapanire absoluta a logicii formale si Haskell", score: 5.0, percentage: 100 },
      { metricId: 5, metricName: "Fairness", description: "Barem generos daca se lucreaza temele pe parcurs", score: 4.8, percentage: 96 },
    ],
    communityIds: ["fmi-info-id", "fmi-mate-info-if", "unibuc-master-ai"],
    communities: [
      {
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        role: "Titular Curs LFA & LMC",
        memberCount: 342,
        bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
      },
      {
        communityId: "fmi-mate-info-if",
        communityName: "FMI - Matematica-Informatica IF",
        role: "Titular Programare Functionala",
        memberCount: 518,
        bannerGradient: "from-blue-600 via-indigo-700 to-slate-900",
      },
      {
        communityId: "unibuc-master-ai",
        communityName: "Master Inteligenta Artificiala & Data Science",
        role: "Profesor Coordonator Metode Formale",
        memberCount: 186,
        bannerGradient: "from-purple-600 via-violet-800 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 9,
        courseId: "c-lfa",
        courseName: "Limbaje formale si automate",
        courseAbbr: "LFA",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 2,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "Automate finite, gramatici regulate si masini Turing. Trebuie minim 5 la tema si teorie.",
      },
      {
        courseOfferingId: 10,
        courseId: "c-lmc",
        courseName: "Logica matematica si computationala",
        courseAbbr: "LMC",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 2,
        creditPoints: 5,
        passingDifficulty: "easy",
        syllabusAdvice: "Daca faceti temele colective, porniti din start cu nota 4. Trebuie sa luati doar 0.5p la examen ca sa treceti!",
      },
      {
        courseOfferingId: 16,
        courseId: "c-pf",
        courseName: "Programare functionala",
        courseAbbr: "PF",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 2,
        studyYearDisplayName: "Anul 2 (2026-2027)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "Haskell, lambda calcul, functii de ordin superior, monade si functii recursive.",
      },
    ],
    reviews: [
      {
        id: "rev-il-1",
        studentName: "Bogdan S.",
        studentRole: "Student Anul 1 ID",
        courseName: "Logica matematica si computationala",
        courseAbbr: "LMC",
        rating: 5,
        title: "Temele colective sunt aur curat",
        comment: "Doamna profesoara explica exceptional sistemele de deductie naturala si arborii semantici. Sistemul cu nota 4 din teme colective reduce complet stresul de examen.",
        createdAt: "2026-06-10T14:00:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 5, knowledge: 5, fairness: 5 },
      },
    ],
  },
  {
    id: "t-munteanu",
    firstName: "Radu",
    lastName: "Munteanu",
    academicTitle: "Lect. Univ. Dr.",
    department: "Departamentul de Matematica",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "radu.munteanu@fmi.unibuc.ro",
    avatarInitials: "RM",
    avatarColor: "bg-indigo-600",
    bio: "Pasionat de analiza functionala, calcul diferential si teoria probabilitatilor aplicate in algoritmi stocastici.",
    officeHours: "Luni 10:00 - 12:00",
    officeLocation: "Sala 214 Corp FMI",
    averageRating: 4.2,
    ratingsCount: 35,
    ratingDistribution: {
      5: 18,
      4: 10,
      3: 5,
      2: 2,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Exemple matematice riguroase", score: 4.3, percentage: 86 },
      { metricId: 2, metricName: "Punctuality", description: "Punctualitate la seminarii", score: 4.6, percentage: 92 },
      { metricId: 3, metricName: "Communication", description: "Explicatii suplimentare la cerere", score: 4.1, percentage: 82 },
      { metricId: 4, metricName: "Knowledge", description: "Cunostinte vaste de analiza matematica", score: 4.8, percentage: 96 },
      { metricId: 5, metricName: "Fairness", description: "Corectare exacta pe barem", score: 4.2, percentage: 84 },
    ],
    communityIds: ["fmi-info-id", "fmi-mate-info-if"],
    communities: [
      {
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        role: "Titular CDI & PS",
        memberCount: 342,
        bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
      },
      {
        communityId: "fmi-mate-info-if",
        communityName: "FMI - Matematica-Informatica IF",
        role: "Cadru Didactic Asociat",
        memberCount: 518,
        bannerGradient: "from-blue-600 via-indigo-700 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 2,
        courseId: "c-cdi",
        courseName: "Calcul diferential si integral",
        courseAbbr: "CDI",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "Urmariti playlist-ul de pe YouTube cu rezolvarile de seminarii si fisele de lucru.",
      },
      {
        courseOfferingId: 15,
        courseId: "c-ps",
        courseName: "Probabilitati si statistica",
        courseAbbr: "PS",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 2,
        studyYearDisplayName: "Anul 2 (2026-2027)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "Variabile aleatoare, teste de ipoteza si distributii normale / Poisson.",
      },
    ],
    reviews: [
      {
        id: "rev-rm-1",
        studentName: "Cristian D.",
        studentRole: "Student Anul 1 ID",
        courseName: "Calcul diferential si integral",
        courseAbbr: "CDI",
        rating: 4,
        title: "Materia este grea, dar seminariile ajuta mult",
        comment: "Examenul scris este solicitant, dar daca faceti problemele din culegere si urmariti exercitiile lucrate la tabla se ia nota mare.",
        createdAt: "2026-01-26T18:00:00Z",
        isVerified: true,
        metricScores: { teaching: 4, punctuality: 5, communication: 4, knowledge: 5, fairness: 4 },
      },
    ],
  },
  {
    id: "t-tataram",
    firstName: "Monica",
    lastName: "Tataram",
    academicTitle: "Conf. Univ. Dr.",
    department: "Departamentul de Informatica",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "monica.tataram@fmi.unibuc.ro",
    avatarInitials: "MT",
    avatarColor: "bg-teal-600",
    bio: "Specialist in baze de date relationale, SQL ANSI, optimizarea interogarilor si sisteme avansate SGBD Oracle / PostgreSQL.",
    officeHours: "Miercuri 10:00 - 12:00",
    officeLocation: "Sala 301 Corp FMI",
    averageRating: 4.3,
    ratingsCount: 44,
    ratingDistribution: {
      5: 22,
      4: 15,
      3: 5,
      2: 2,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Modele relationale si normalizari", score: 4.4, percentage: 88 },
      { metricId: 2, metricName: "Punctuality", description: "Respectarea termenelor la proiecte", score: 4.5, percentage: 90 },
      { metricId: 3, metricName: "Communication", description: "Feedback la proiectele de baze de date", score: 4.2, percentage: 84 },
      { metricId: 4, metricName: "Knowledge", description: "Cunostinte de top despre SQL si tranzactii ACID", score: 4.8, percentage: 96 },
      { metricId: 5, metricName: "Fairness", description: "Test practic live pe calculator", score: 4.4, percentage: 88 },
    ],
    communityIds: ["fmi-info-id", "fmi-mate-info-if"],
    communities: [
      {
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        role: "Titular Baze de Date",
        memberCount: 342,
        bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
      },
      {
        communityId: "fmi-mate-info-if",
        communityName: "FMI - Matematica-Informatica IF",
        role: "Titular SGBD",
        memberCount: 518,
        bannerGradient: "from-blue-600 via-indigo-700 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 7,
        courseId: "c-bd",
        courseName: "Baze de date",
        courseAbbr: "BD",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 2,
        creditPoints: 5,
        passingDifficulty: "easy",
        syllabusAdvice: "Nota se obtine pe baza prezentarii proiectului relational. Trebuie sa stiti sa executati interogari live in timpul prezentarii.",
      },
      {
        courseOfferingId: 17,
        courseId: "c-sgbd",
        courseName: "Sisteme de gestiune a bazelor de date",
        courseAbbr: "SGBD",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 2,
        studyYearDisplayName: "Anul 2 (2026-2027)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "PL/SQL, indecsi, planuri de executie si blocaje concurente.",
      },
    ],
    reviews: [
      {
        id: "rev-mt-1",
        studentName: "Vlad P.",
        studentRole: "Student Anul 1 ID",
        courseName: "Baze de date",
        courseAbbr: "BD",
        rating: 5,
        title: "Proiect foarte util pentru cariera",
        comment: "Daca stiti sa faceti JOIN-uri si subcereri in timpul prezentarii proiectului, luati nota 10 garantat!",
        createdAt: "2026-06-15T11:00:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 4, communication: 4, knowledge: 5, fairness: 5 },
      },
    ],
  },
  {
    id: "t-cherciu",
    firstName: "Mihail",
    lastName: "Cherciu",
    academicTitle: "Lect. Univ. Dr.",
    department: "Departamentul de Informatica",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "mihail.cherciu@fmi.unibuc.ro",
    avatarInitials: "MC",
    avatarColor: "bg-amber-600",
    bio: "Pasiune pentru programarea orientata pe obiecte in C++, design patterns si dezvoltarea jocurilor 2D/3D.",
    officeHours: "Vineri 11:00 - 13:00",
    officeLocation: "Sala 304 Corp FMI",
    averageRating: 4.5,
    ratingsCount: 29,
    ratingDistribution: {
      5: 19,
      4: 7,
      3: 3,
      2: 0,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Concepte OOP explicate intuitiv", score: 4.6, percentage: 92 },
      { metricId: 2, metricName: "Punctuality", description: "Prezentari la timp", score: 4.5, percentage: 90 },
      { metricId: 3, metricName: "Communication", description: "Deschidere la idei creative de proiecte", score: 4.7, percentage: 94 },
      { metricId: 4, metricName: "Knowledge", description: "Standarde moderne C++20 / C++23", score: 4.8, percentage: 96 },
      { metricId: 5, metricName: "Fairness", description: "Apreciaza efortul si originalitatea", score: 4.6, percentage: 92 },
    ],
    communityIds: ["fmi-info-id", "fmi-cti"],
    communities: [
      {
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        role: "Titular Curs Programare Orientata pe Obiecte",
        memberCount: 342,
        bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
      },
      {
        communityId: "fmi-cti",
        communityName: "FMI - Calculatoare si Tehnologia Informatiei",
        role: "Coordonator Laborator C++",
        memberCount: 295,
        bannerGradient: "from-amber-600 via-orange-700 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 11,
        courseId: "c-poo",
        courseName: "Programare orientata pe obiecte",
        courseAbbr: "POO",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 2,
        creditPoints: 5,
        passingDifficulty: "easy",
        syllabusAdvice: "Nota se obtine pe baza unui proiect complet C++. Prezentare de 3-5 minute cu explicarea conceptelor OOP.",
      },
    ],
    reviews: [
      {
        id: "rev-mc-1",
        studentName: "Eduard N.",
        studentRole: "Student Anul 1 ID",
        courseName: "Programare orientata pe obiecte",
        courseAbbr: "POO",
        rating: 5,
        title: "Cel mai relaxat si constructiv curs de programare",
        comment: "Domnul profesor incurajeaza proiectele practice. Poti face orice tip de joc sau aplicatie in C++ daca respecti principiile OOP.",
        createdAt: "2026-06-20T15:30:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 5, knowledge: 5, fairness: 5 },
      },
    ],
  },
  {
    id: "t-ciocan",
    firstName: "Irina",
    lastName: "Ciocan",
    academicTitle: "Lect. Univ. Dr.",
    department: "Departamentul de Informatica",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "irina.ciocan@fmi.unibuc.ro",
    avatarInitials: "IC",
    avatarColor: "bg-rose-600",
    bio: "Specialista in tehnologii web moderne (React, TypeScript, CSS Grid/Flexbox) si dezvoltare fullstack de aplicatii scalabile.",
    officeHours: "Joi 14:00 - 16:00",
    officeLocation: "Laborator Web, Corp FMI",
    averageRating: 4.4,
    ratingsCount: 27,
    ratingDistribution: {
      5: 16,
      4: 8,
      3: 3,
      2: 0,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Tehnologii web practice si exemple live", score: 4.5, percentage: 90 },
      { metricId: 2, metricName: "Punctuality", description: "Punctualitate la consultatii", score: 4.7, percentage: 94 },
      { metricId: 3, metricName: "Communication", description: "Ajutor constant la cod si buguri", score: 4.6, percentage: 92 },
      { metricId: 4, metricName: "Knowledge", description: "Tehnologii web de ultima generatie", score: 4.8, percentage: 96 },
      { metricId: 5, metricName: "Fairness", description: "Punctaj suplimentar pentru design curat", score: 4.5, percentage: 90 },
    ],
    communityIds: ["fmi-info-id", "fmi-cti"],
    communities: [
      {
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        role: "Titular Tehnici Web & DAW",
        memberCount: 342,
        bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
      },
      {
        communityId: "fmi-cti",
        communityName: "FMI - Calculatoare si Tehnologia Informatiei",
        role: "Coordonator Proiecte Frontend",
        memberCount: 295,
        bannerGradient: "from-amber-600 via-orange-700 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 6,
        courseId: "c-tw",
        courseName: "Tehnici web",
        courseAbbr: "TW",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 1,
        studyYearDisplayName: "Anul 1 (2025-2026)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "easy",
        syllabusAdvice: "Daca obtineti nota 10 din prezentarea proiectului personal, nu mai trebuie sa va prezentati la examen.",
      },
      {
        courseOfferingId: 14,
        courseId: "c-daw",
        courseName: "Dezvoltarea aplicatiilor web",
        courseAbbr: "DAW",
        communityId: "fmi-info-id",
        communityName: "FMI - Informatica ID",
        studyYearId: 2,
        studyYearDisplayName: "Anul 2 (2026-2027)",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "easy",
        syllabusAdvice: "Dezvoltare fullstack moderna cu framework-uri reactive si baze de date document / relationale.",
      },
    ],
    reviews: [
      {
        id: "rev-ic-1",
        studentName: "Ioan C.",
        studentRole: "Student Anul 1 ID",
        courseName: "Tehnici web",
        courseAbbr: "TW",
        rating: 5,
        title: "Proiectul personal iti da libertate totala",
        comment: "Am facut o aplicatie cu Node.js si WebSocket. Doamna profesoara a apreciat foarte mult arhitectura si am luat nota 10 din prezentare!",
        createdAt: "2026-02-08T17:00:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 5, knowledge: 5, fairness: 5 },
      },
    ],
  },
  {
    id: "t-radulescu",
    firstName: "Elena",
    lastName: "Radulescu",
    academicTitle: "Conf. Univ. Dr.",
    department: "Centrul de Inteligenta Artificiala",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "elena.radulescu@unibuc.ro",
    avatarInitials: "ER",
    avatarColor: "bg-violet-600",
    bio: "Cercetari in invatare automata, modele generative LLM, Computer Vision si sisteme autonome multi-agent.",
    officeHours: "Luni 16:00 - 18:00",
    officeLocation: "Laboratorul AI & NLP, Corp FMI",
    averageRating: 4.9,
    ratingsCount: 38,
    ratingDistribution: {
      5: 35,
      4: 3,
      3: 0,
      2: 0,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Slide-uri si demo-uri interactive cu PyTorch", score: 5.0, percentage: 100 },
      { metricId: 2, metricName: "Punctuality", description: "Punctualitate maxima la cursuri", score: 4.9, percentage: 98 },
      { metricId: 3, metricName: "Communication", description: "Comunicare excelenta cu studentii", score: 4.8, percentage: 96 },
      { metricId: 4, metricName: "Knowledge", description: "Cercetare de varf publicata la NeurIPS/ICLR", score: 5.0, percentage: 100 },
      { metricId: 5, metricName: "Fairness", description: "Evaluare pe baza de articole si cod pe GitHub", score: 4.9, percentage: 98 },
    ],
    communityIds: ["unibuc-master-ai"],
    communities: [
      {
        communityId: "unibuc-master-ai",
        communityName: "Master Inteligenta Artificiala & Data Science",
        role: "Coordonator Program Masterat",
        memberCount: 186,
        bannerGradient: "from-purple-600 via-violet-800 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 101,
        courseId: "c-dl",
        courseName: "Deep Learning & Neural Architectures",
        courseAbbr: "DL",
        communityId: "unibuc-master-ai",
        communityName: "Master Inteligenta Artificiala & Data Science",
        studyYearId: 1,
        studyYearDisplayName: "Master Anul 1",
        semester: 1,
        creditPoints: 6,
        passingDifficulty: "medium",
        syllabusAdvice: "Implementari PyTorch de Transformers, Attention Mechanisms si difuzie generativa.",
      },
    ],
    reviews: [
      {
        id: "rev-er-1",
        studentName: "Marius T.",
        studentRole: "Masterand AI",
        courseName: "Deep Learning & Neural Architectures",
        courseAbbr: "DL",
        rating: 5,
        title: "Cel mai bun curs practic de Machine Learning",
        comment: "Cursul reflecta ultimele descoperiri din AI. Proiectele pe GPU sunt evaluate profesional.",
        createdAt: "2026-01-20T19:00:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 5, knowledge: 5, fairness: 5 },
      },
    ],
  },
  {
    id: "t-popescu",
    firstName: "Alexandru",
    lastName: "Popescu",
    academicTitle: "Prof. Univ. Dr.",
    department: "Departamentul de Informatica",
    faculty: "Facultatea de Matematica si Informatica (UniBuc)",
    email: "alexandru.popescu@fmi.unibuc.ro",
    avatarInitials: "AP",
    avatarColor: "bg-blue-700",
    bio: "Specialist in sisteme distribuite, cloud computing, algoritmi de consens (Raft, Paxos) si securitate cibernetica.",
    officeHours: "Marti 15:00 - 17:00",
    officeLocation: "Sala 218 Corp FMI",
    averageRating: 4.6,
    ratingsCount: 31,
    ratingDistribution: {
      5: 21,
      4: 8,
      3: 2,
      2: 0,
      1: 0,
    },
    metrics: [
      { metricId: 1, metricName: "Teaching ability", description: "Arhitecturi distribuite pe intelesul tuturor", score: 4.7, percentage: 94 },
      { metricId: 2, metricName: "Punctuality", description: "Punctualitate la curs", score: 4.8, percentage: 96 },
      { metricId: 3, metricName: "Communication", description: "Raspunsuri tehnice detaliate", score: 4.5, percentage: 90 },
      { metricId: 4, metricName: "Knowledge", description: "Experienta industriala si academica in Cloud", score: 4.9, percentage: 98 },
      { metricId: 5, metricName: "Fairness", description: "Teste automate de evaluare pentru teme", score: 4.6, percentage: 92 },
    ],
    communityIds: ["fmi-mate-info-if", "fmi-cti"],
    communities: [
      {
        communityId: "fmi-mate-info-if",
        communityName: "FMI - Matematica-Informatica IF",
        role: "Titular Sisteme Distribuite",
        memberCount: 518,
        bannerGradient: "from-blue-600 via-indigo-700 to-slate-900",
      },
      {
        communityId: "fmi-cti",
        communityName: "FMI - Calculatoare si Tehnologia Informatiei",
        role: "Titular Cloud Computing & Securitate",
        memberCount: 295,
        bannerGradient: "from-amber-600 via-orange-700 to-slate-900",
      },
    ],
    coursesTaught: [
      {
        courseOfferingId: 201,
        courseId: "c-sd",
        courseName: "Sisteme Distribuite",
        courseAbbr: "SD",
        communityId: "fmi-mate-info-if",
        communityName: "FMI - Matematica-Informatica IF",
        studyYearId: 3,
        studyYearDisplayName: "Anul 3 IF",
        semester: 1,
        creditPoints: 5,
        passingDifficulty: "medium",
        syllabusAdvice: "RPC, microservicii si algoritmi de consens distribuit in Go sau Rust.",
      },
    ],
    reviews: [
      {
        id: "rev-ap-1",
        studentName: "Razvan G.",
        studentRole: "Student Anul 3 IF",
        courseName: "Sisteme Distribuite",
        courseAbbr: "SD",
        rating: 5,
        title: "Laboratoare excelente cu Docker si Go",
        comment: "Subiecte foarte moderne si relevante pentru joburile de backend/DevOps.",
        createdAt: "2026-01-18T14:20:00Z",
        isVerified: true,
        metricScores: { teaching: 5, punctuality: 5, communication: 4, knowledge: 5, fairness: 5 },
      },
    ],
  },
];

// Helper to filter teachers by communityId
export function getTeachersByCommunity(communityId: string): DetailedTeacher[] {
  if (!communityId || communityId === "all") {
    return DETAILED_TEACHERS;
  }
  return DETAILED_TEACHERS.filter((t) => t.communityIds.includes(communityId));
}

// Helper to find teacher by ID
export function getTeacherById(id: string): DetailedTeacher | undefined {
  return DETAILED_TEACHERS.find((t) => t.id === id);
}

// Helper to search teachers by query
export function searchTeachers(
  teachers: DetailedTeacher[],
  query: string
): DetailedTeacher[] {
  if (!query.trim()) return teachers;
  const q = query.toLowerCase().trim();
  return teachers.filter(
    (t) =>
      t.firstName.toLowerCase().includes(q) ||
      t.lastName.toLowerCase().includes(q) ||
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.coursesTaught.some(
        (c) =>
          c.courseName.toLowerCase().includes(q) ||
          c.courseAbbr.toLowerCase().includes(q)
      ) ||
      t.communities.some((c) => c.communityName.toLowerCase().includes(q))
  );
}
