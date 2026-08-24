// Throwaway prototype mock data - Perfectly mirrors the PostgreSQL database schema + future schema recommendations
// Can be deleted safely along with the /prototypes folder when backend integration is ready.

export type StudyYearEnum = "YEAR_1" | "YEAR_2" | "YEAR_3" | "YEAR_4";
export type ResourceTypeEnum = "MATERIAL_FILE" | "MATERIAL_LINK" | "ASSIGNMENT" | "EXAM" | "LECTURE";
export type MaterialLinkTypeEnum = "VIDEO" | "DRIVE" | "GITHUB" | "OTHER";
export type LectureLocationEnum = "ONLINE" | "IN_PERSON" | "HYBRID";
export type AttachmentTypeEnum = "MATERIAL_FILE" | "MATERIAL_LINK";
export type NotificationUrgency = "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH";

export interface MockUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "COMMUNITY_OWNER" | "COMMUNITY_ADMIN" | "COMMUNITY_MEMBER";
  avatarUrl?: string;
  enrolledCommunityIds?: string[];
  currentStudyYearByCommunity?: Record<string, number>;
}

export interface MockRatingMetric {
  id: number;
  name: string;
  description: string;
}

export interface MockTeacherRatingValue {
  ratingMetricId: number;
  metricName: string;
  value: number; // 1 to 5
}

export interface MockTeacherRating {
  id: number;
  userId: string;
  userName: string;
  teacherId: string;
  teacherName?: string;
  courseName?: string;
  title: string;
  description: string;
  createdAt: string;
  metricValues: MockTeacherRatingValue[];
}

export interface MockTeacher {
  id: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  ratingsCount: number;
  ratings?: MockTeacherRating[];
  department?: string;
  email?: string;
  avatarInitials?: string;
  studyYearsTaught?: number[];
  coursesTaughtNames?: string[];
}

export interface MockMaterialFile {
  id: string;
  storageKey: string;
  mediaType: string;
  size: number; // in bytes
  downloadUrl?: string;
  fileContentSnippet?: string;
  extension?: string;
}

export interface MockMaterialLink {
  id: string;
  url: string;
  linkType: MaterialLinkTypeEnum;
}

export interface MockAttachment {
  id: string;
  parentResourceId: string;
  attachmentType: AttachmentTypeEnum;
  title: string;
  url?: string;
  mediaType?: string;
}

export interface MockAssignment {
  id: string;
  dueDate: string;
  estimatedDurationMinutes?: number;
  gradeWeight: number; // 0 to 100
  attachments?: MockAttachment[];
}

export interface MockExam {
  id: string;
  scheduledDate: string;
  estimatedDurationMinutes?: number;
  gradeWeight: number; // 0 to 100
  attachments?: MockAttachment[];
  roomOrPlatform?: string;
}

export interface MockLecture {
  id: string;
  startTime: string;
  endTime: string;
  location: LectureLocationEnum;
  roomDetails?: string;
  meetingUrl?: string;
  attachments?: MockAttachment[];
}

export interface MockResource {
  id: string;
  folderId: string | null;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  type: ResourceTypeEnum;
  description?: string | null;
  fileData?: MockMaterialFile;
  linkData?: MockMaterialLink;
  assignmentData?: MockAssignment;
  examData?: MockExam;
  lectureData?: MockLecture;
  tags?: string[];
  viewsCount?: number;
  isStarred?: boolean;
  filePath?: string; // e.g. "curs/curs_01_introducere.pdf"
}

export interface MockTreeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  resource?: MockResource;
  children?: MockTreeItem[];
  extension?: string;
  size?: number;
  updatedAt?: string;
}

export interface MockFolder {
  id: string;
  name: string;
  courseOfferingId: number;
  parentFolderId: string | null;
  ownerId: string;
  createdAt: string;
  resources: MockResource[];
  subfolderIds?: string[];
}

export interface MockPost {
  id: string;
  ownerId: string;
  ownerName: string;
  courseOfferingId: number;
  title: string;
  description: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  commentsCount?: number;
}

export interface MockCourseOffering {
  id: number;
  courseId: string;
  courseName: string;
  courseAbbr: string;
  studyYearId: number;
  studyYearName: StudyYearEnum;
  semester: 1 | 2;
  description: string | null; // e.g., tips for passing, syllabus note
  createdAt: string;
  teachers: MockTeacher[];
  folders: MockFolder[];
  posts: MockPost[];
  materialDifficulty?: "easy" | "medium" | "hard";
  passingDifficulty?: "easy" | "medium" | "hard";
  creditPoints?: number;
}

export interface MockStudyYear {
  id: number;
  studyYearName: StudyYearEnum;
  displayName: string;
  communityId: string;
  courseOfferings: MockCourseOffering[];
  createdAt: string;
}

export interface MockCommunity {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  owner: MockUser;
  createdAt: string;
  studyYears: MockStudyYear[];
  tags: string[];
  bannerGradient: string;
  iconName: string;
  isJoined?: boolean;
}

export interface MockNotification {
  id: string;
  resourceId: string;
  title: string;
  courseAbbr: string;
  courseName: string;
  type: "LECTURE" | "EXAM" | "ASSIGNMENT";
  urgency: NotificationUrgency;
  urgencyLabel: string;
  targetDate: string;
  gradeWeight?: number;
  locationOrRoom?: string;
  description?: string;
  isRead: boolean;
  isStarred: boolean;
}

export const MOCK_RATING_METRICS: MockRatingMetric[] = [
  { id: 1, name: "Teaching ability", description: "Evaluates the teacher's ability to effectively deliver content and engage students" },
  { id: 2, name: "Punctuality", description: "Evaluates the teacher's ability to meet student needs on time" },
  { id: 3, name: "Communication", description: "Evaluates the teacher's ability to effectively communicate with students" },
  { id: 4, name: "Knowledge", description: "Evaluates the teacher's depth of knowledge in the subject area" },
  { id: 5, name: "Fairness", description: "Evaluates the teacher's ability to treat all students fairly and without bias" },
];

export const MOCK_TEACHERS: Record<string, MockTeacher> = {
  dragulici: {
    id: "t-dragulici",
    firstName: "Daniel",
    lastName: "Dragulici",
    averageRating: 4.6,
    ratingsCount: 42,
    department: "Departamentul de Informatica",
    email: "daniel.dragulici@fmi.unibuc.ro",
    avatarInitials: "DD",
    studyYearsTaught: [1, 2],
    coursesTaughtNames: ["Arhitectura sistemelor de calcul (ASC)", "Instrumente si tehnici de baza (ITBI)", "Sisteme de operare (SO)"],
    ratings: [
      {
        id: 1,
        userId: "u-david",
        userName: "David Iosub",
        teacherId: "t-dragulici",
        teacherName: "Prof. Daniel Dragulici",
        courseName: "Arhitectura sistemelor de calcul (ASC)",
        title: "Foarte clar si orientat spre practica",
        description: "Explica arhitectura pe intelesul tuturor. Daca faceti proiectul MIPS serios, treceti fara emotii si scapati de examen!",
        createdAt: "2026-02-05T14:30:00Z",
        metricValues: [
          { ratingMetricId: 1, metricName: "Teaching ability", value: 5 },
          { ratingMetricId: 2, metricName: "Punctuality", value: 5 },
          { ratingMetricId: 3, metricName: "Communication", value: 4 },
          { ratingMetricId: 4, metricName: "Knowledge", value: 5 },
          { ratingMetricId: 5, metricName: "Fairness", value: 4 },
        ],
      },
      {
        id: 2,
        userId: "u-maria",
        userName: "Maria T.",
        teacherId: "t-dragulici",
        teacherName: "Prof. Daniel Dragulici",
        courseName: "Arhitectura sistemelor de calcul (ASC)",
        title: "Proiectul valoreaza 60%, profitati!",
        description: "Raspunde prompt pe mail si accepta imbunatatiri la proiect daca le argumentati bine.",
        createdAt: "2026-01-22T10:15:00Z",
        metricValues: [
          { ratingMetricId: 1, metricName: "Teaching ability", value: 4 },
          { ratingMetricId: 2, metricName: "Punctuality", value: 5 },
          { ratingMetricId: 3, metricName: "Communication", value: 5 },
          { ratingMetricId: 4, metricName: "Knowledge", value: 5 },
          { ratingMetricId: 5, metricName: "Fairness", value: 5 },
        ],
      },
    ],
  },
  dinu: {
    id: "t-dinu",
    firstName: "Liviu",
    lastName: "Dinu",
    averageRating: 4.8,
    ratingsCount: 68,
    department: "Centrul de Inteligenta Artificiala",
    email: "liviu.dinu@fmi.unibuc.ro",
    avatarInitials: "LD",
    studyYearsTaught: [1, 2],
    coursesTaughtNames: ["Programarea algoritmilor (PA)", "Structuri de date (SDD)", "Algoritmi fundamentali (AF)"],
    ratings: [
      {
        id: 3,
        userId: "u-david",
        userName: "David Iosub",
        teacherId: "t-dinu",
        teacherName: "Prof. Liviu Dinu",
        courseName: "Programarea algoritmilor (PA)",
        title: "Cursuri interactive si exemple de top",
        description: "Materialele sunt structurate impecabil in Python 3. Examenul este corect si testeaza gandirea algoritmica.",
        createdAt: "2026-02-01T16:00:00Z",
        metricValues: [
          { ratingMetricId: 1, metricName: "Teaching ability", value: 5 },
          { ratingMetricId: 2, metricName: "Punctuality", value: 5 },
          { ratingMetricId: 3, metricName: "Communication", value: 5 },
          { ratingMetricId: 4, metricName: "Knowledge", value: 5 },
          { ratingMetricId: 5, metricName: "Fairness", value: 5 },
        ],
      },
    ],
  },
  munteanu: {
    id: "t-munteanu",
    firstName: "Radu",
    lastName: "Munteanu",
    averageRating: 4.2,
    ratingsCount: 35,
    department: "Departamentul de Matematica",
    email: "radu.munteanu@fmi.unibuc.ro",
    avatarInitials: "RM",
    studyYearsTaught: [1, 2],
    coursesTaughtNames: ["Calcul diferential si integral (CDI)", "Probabilitati si statistica (PS)"],
  },
  leustean: {
    id: "t-leustean",
    firstName: "Ioana",
    lastName: "Leustean",
    averageRating: 4.7,
    ratingsCount: 51,
    department: "Departamentul de Informatica",
    email: "ioana.leustean@fmi.unibuc.ro",
    avatarInitials: "IL",
    studyYearsTaught: [1, 2],
    coursesTaughtNames: ["Limbaje formale si automate (LFA)", "Logica matematica (LMC)", "Programare functionala (PF)"],
  },
  cherciu: {
    id: "t-cherciu",
    firstName: "Mihail",
    lastName: "Cherciu",
    averageRating: 4.1,
    ratingsCount: 29,
    department: "Departamentul de Informatica",
    email: "mihail.cherciu@fmi.unibuc.ro",
    avatarInitials: "MC",
    studyYearsTaught: [1],
    coursesTaughtNames: ["Programare orientata pe obiecte (POO)"],
  },
  tataram: {
    id: "t-tataram",
    firstName: "Monica",
    lastName: "Tataram",
    averageRating: 3.9,
    ratingsCount: 44,
    department: "Departamentul de Informatica",
    email: "monica.tataram@fmi.unibuc.ro",
    avatarInitials: "MT",
    studyYearsTaught: [1, 2],
    coursesTaughtNames: ["Baze de date (BD)", "Sisteme de gestiune a bazelor de date (SGBD)"],
  },
  gica: {
    id: "t-gica",
    firstName: "Alexandru",
    lastName: "Gica",
    averageRating: 4.5,
    ratingsCount: 38,
    department: "Departamentul de Matematica",
    email: "alexandru.gica@fmi.unibuc.ro",
    avatarInitials: "AG",
    studyYearsTaught: [1],
    coursesTaughtNames: ["Structuri algebrice in informatica (SAIF)"],
  },
  muresean: {
    id: "t-muresean",
    firstName: "Claudia",
    lastName: "Muresean",
    averageRating: 4.4,
    ratingsCount: 30,
    department: "Departamentul de Matematica",
    email: "claudia.muresean@fmi.unibuc.ro",
    avatarInitials: "CM",
    studyYearsTaught: [1],
    coursesTaughtNames: ["Geometrie si algebra liniara (GAL)"],
  },
  ciocan: {
    id: "t-ciocan",
    firstName: "Irina",
    lastName: "Ciocan",
    averageRating: 4.3,
    ratingsCount: 27,
    department: "Departamentul de Informatica",
    email: "irina.ciocan@fmi.unibuc.ro",
    avatarInitials: "IC",
    studyYearsTaught: [1, 2],
    coursesTaughtNames: ["Tehnici web (TW)", "Dezvoltarea aplicatiilor web (DAW)"],
  },
};

export const MOCK_CURRENT_USER: MockUser = {
  id: "u-david",
  username: "iosub_david",
  email: "david.iosub@unihub.edu",
  fullName: "David Iosub",
  role: "COMMUNITY_OWNER",
  enrolledCommunityIds: ["fmi-info-id", "unibuc-master-ai"],
  currentStudyYearByCommunity: {
    "fmi-info-id": 1,
    "unibuc-master-ai": 1,
  },
};

// ASC Course Offering Folders & Resources
const ASC_FOLDERS: MockFolder[] = [
  {
    id: "35f6d7f5-545b-51a6-acaa-175d69b0de5c",
    name: "Materiale Curs & Laborator",
    courseOfferingId: 1,
    parentFolderId: null,
    ownerId: "u-david",
    createdAt: "2026-07-01T09:00:00Z",
    resources: [
      {
        id: "28a48535-ba57-5f18-862d-f4862a3fa70c",
        folderId: "35f6d7f5-545b-51a6-acaa-175d69b0de5c",
        ownerId: "u-david",
        ownerName: "David Iosub",
        createdAt: "2026-07-01T09:08:16Z",
        updatedAt: "2026-07-01T09:08:16Z",
        title: "Materiale Curs ASC (GitHub Repo)",
        type: "MATERIAL_LINK",
        description: "Toate slide-urile, codurile demonstrative MIPS si sintezele de curs in format Markdown.",
        linkData: {
          id: "28a48535-ba57-5f18-862d-f4862a3fa70c",
          url: "https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ASC/curs",
          linkType: "GITHUB",
        },
        tags: ["GitHub", "Curs", "Slide-uri"],
        viewsCount: 312,
        isStarred: true,
        filePath: "curs/repo_materiale_curs.md",
      },
      {
        id: "9d381713-8928-5ff1-a613-3c1773e4b7c8",
        folderId: "35f6d7f5-545b-51a6-acaa-175d69b0de5c",
        ownerId: "u-david",
        ownerName: "David Iosub",
        createdAt: "2026-07-01T09:10:27Z",
        updatedAt: "2026-07-01T09:10:27Z",
        title: "Materiale Laborator MIPS & Ghid Mars Simulator",
        type: "MATERIAL_LINK",
        description: "Tutoriale pas cu pas pentru instalarea simulatorului Mars, setul de instructiuni MIPS32 si exercitii rezolvate.",
        linkData: {
          id: "9d381713-8928-5ff1-a613-3c1773e4b7c8",
          url: "https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ASC/laborator",
          linkType: "GITHUB",
        },
        tags: ["Laborator", "MIPS", "MARS"],
        viewsCount: 245,
        isStarred: false,
        filePath: "laborator/ghid_mars_simulator.md",
      },
      {
        id: "asc-cheatsheet-file",
        folderId: "35f6d7f5-545b-51a6-acaa-175d69b0de5c",
        ownerId: "u-david",
        ownerName: "David Iosub",
        createdAt: "2026-07-05T11:20:00Z",
        updatedAt: "2026-07-05T11:20:00Z",
        title: "MIPS Architecture Cheatsheet (Quick Reference).pdf",
        type: "MATERIAL_FILE",
        description: "Foaie de referinta rapida cu registrele MIPS, syscalls si conventiile de apelare functii.",
        fileData: {
          id: "asc-cheatsheet-file",
          storageKey: "asc/cheatsheet_v2.pdf",
          mediaType: "application/pdf",
          size: 1420500, // ~1.4 MB
          downloadUrl: "#",
          extension: "pdf",
          fileContentSnippet: "MIPS32 Register Map:\n$zero (0): Constant 0\n$v0-$v1 (2-3): Return values\n$a0-$a3 (4-7): Function arguments\n$t0-$t9 (8-15, 24-25): Temporary registers\n$s0-$s7 (16-23): Saved registers (Preserve on stack)\n$sp (29): Stack pointer\n$ra (31): Return address",
        },
        tags: ["PDF", "Cheatsheet", "Exam-Allowed"],
        viewsCount: 480,
        isStarred: true,
        filePath: "curs/cheatsheet_mips.pdf",
      },
      {
        id: "asc-sample-code",
        folderId: "35f6d7f5-545b-51a6-acaa-175d69b0de5c",
        ownerId: "u-david",
        ownerName: "David Iosub",
        createdAt: "2026-07-06T14:10:00Z",
        updatedAt: "2026-07-06T14:10:00Z",
        title: "lab_02_array_sum.asm",
        type: "MATERIAL_FILE",
        description: "Cod de asamblare demonstrativ pentru parcurgerea si sumarea unui vector in MIPS.",
        fileData: {
          id: "asc-sample-code",
          storageKey: "asc/lab_02_array_sum.asm",
          mediaType: "text/plain",
          size: 2450,
          extension: "asm",
          fileContentSnippet: ".data\n  vector: .word 10, 20, 30, 40, 50\n  n: .word 5\n  msg: .asciiz \"Suma este: \"\n.text\n.globl main\nmain:\n  la $t0, vector\n  lw $t1, n\n  li $t2, 0 # sum\nloop:\n  beqz $t1, done\n  lw $t3, ($t0)\n  add $t2, $t2, $t3\n  addi $t0, $t0, 4\n  addi $t1, $t1, -1\n  j loop\ndone:\n  li $v0, 4\n  la $a0, msg\n  syscall\n  li $v0, 1\n  move $a0, $t2\n  syscall\n  li $v0, 10\n  syscall",
        },
        tags: ["MIPS", "Assembly", "Laborator"],
        viewsCount: 190,
        filePath: "laborator/lab_02_array_sum.asm",
      },
    ],
  },
  {
    id: "eb68cae4-f8ef-5276-970d-7f5761d64057",
    name: "Examene & Subiecte Anterioare",
    courseOfferingId: 1,
    parentFolderId: null,
    ownerId: "u-david",
    createdAt: "2026-07-01T09:00:00Z",
    resources: [
      {
        id: "35a42333-1447-52fd-a99a-873257c56963",
        folderId: "eb68cae4-f8ef-5276-970d-7f5761d64057",
        ownerId: "u-david",
        ownerName: "David Iosub",
        createdAt: "2026-07-01T09:11:18Z",
        updatedAt: "2026-07-01T09:11:18Z",
        title: "Examen Scris Sesiunea Iarna 2026",
        type: "EXAM",
        description: "Examenul scris pe baza materiei de curs. IMPORTANT: Aveti voie cu materiale scrise de mana la examen!",
        examData: {
          id: "35a42333-1447-52fd-a99a-873257c56963",
          scheduledDate: "2026-01-20T18:00:00Z",
          estimatedDurationMinutes: 120,
          gradeWeight: 40,
          roomOrPlatform: "Amfiteatrul Spiru Haret / Corp FMI",
          attachments: [
            {
              id: "c2fb173f-3658-571e-adee-4eda7c7a4b25",
              parentResourceId: "35a42333-1447-52fd-a99a-873257c56963",
              attachmentType: "MATERIAL_LINK",
              title: "Exemple Subiecte Examene Anii Trecuti",
              url: "https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ASC/examen",
            },
          ],
        },
        tags: ["Examen", "Open-Notes", "Sesiune"],
        viewsCount: 520,
        isStarred: true,
        filePath: "examene/examen_scris_2026.exam",
      },
    ],
  },
  {
    id: "3974654c-e940-5b4d-a7e3-76657f118864",
    name: "Teme & Proiect MIPS",
    courseOfferingId: 1,
    parentFolderId: null,
    ownerId: "u-david",
    createdAt: "2026-07-01T09:00:00Z",
    resources: [
      {
        id: "51365991-3559-541f-8060-2f8338c06bd6",
        folderId: "3974654c-e940-5b4d-a7e3-76657f118864",
        ownerId: "u-david",
        ownerName: "David Iosub",
        createdAt: "2026-07-01T09:13:38Z",
        updatedAt: "2026-07-01T09:13:38Z",
        title: "Proiect MIPS Assembly (Criptare / Procesare Imagini)",
        type: "ASSIGNMENT",
        description: "Implementarea algoritmului cerut in limbaj de asamblare MIPS32. Daca obtineti nota >= 5 la acest proiect, promovarea este asigurata si nu este obligatoriu examenul scris!",
        assignmentData: {
          id: "51365991-3559-541f-8060-2f8338c06bd6",
          dueDate: "2026-01-20T18:00:00Z",
          estimatedDurationMinutes: 1200,
          gradeWeight: 60,
          attachments: [
            {
              id: "mips-starter-zip",
              parentResourceId: "51365991-3559-541f-8060-2f8338c06bd6",
              attachmentType: "MATERIAL_FILE",
              title: "Enunt_Proiect_MIPS_2025_2026.pdf",
              mediaType: "application/pdf",
            },
          ],
        },
        tags: ["Proiect", "60% Pondere", "Scapare-Examen"],
        viewsCount: 610,
        isStarred: true,
        filePath: "teme/enunt_proiect_mips.assign",
      },
    ],
  },
  {
    id: "asc-lectures-folder",
    name: "Inregistrari Curs & Consultatii",
    courseOfferingId: 1,
    parentFolderId: null,
    ownerId: "u-david",
    createdAt: "2026-07-01T09:00:00Z",
    resources: [
      {
        id: "asc-weekly-lecture",
        folderId: "asc-lectures-folder",
        ownerId: "u-david",
        ownerName: "David Iosub",
        createdAt: "2026-07-01T09:00:00Z",
        updatedAt: "2026-07-01T09:00:00Z",
        title: "Curs Saptamanal ASC - Structura Procesoare & Pipeline",
        type: "LECTURE",
        description: "Sedinta de curs live saptamanala. Discutii pe arhitectura Von Neumann, instructiuni si pipeline execution.",
        lectureData: {
          id: "asc-weekly-lecture",
          startTime: "2026-10-15T16:00:00Z",
          endTime: "2026-10-15T18:00:00Z",
          location: "ONLINE",
          meetingUrl: "https://meet.google.com/unihub-asc-live",
          roomDetails: "Google Meet FMI ID",
        },
        tags: ["Live", "Curs", "Online"],
        isStarred: true,
        filePath: "inregistrari/curs_live_saptamanal.lec",
      },
    ],
  },
];

const ASC_POSTS: MockPost[] = [
  {
    id: "post-asc-1",
    ownerId: "u-david",
    ownerName: "David Iosub",
    courseOfferingId: 1,
    title: "Cum sa luati 10 la ASC fara stres: Sfaturi pentru Proiectul MIPS",
    description: "Salutare tuturor! Am grupat cele mai frecvente greseli de alocare de memorie pe stiva in simulatorul Mars. Asigurati-va ca salvati registrele $s0-$s7 in prolog si le restaurati in epilog!",
    likesCount: 28,
    createdAt: "2026-01-10T14:20:00Z",
    updatedAt: "2026-01-10T14:20:00Z",
    isLiked: true,
    commentsCount: 9,
  },
  {
    id: "post-asc-2",
    ownerId: "u-andrei",
    ownerName: "Andrei Popa",
    courseOfferingId: 1,
    title: "Se poate folosi simulatorul MARS pe Apple Silicon Mac (M1/M2/M3)?",
    description: "Da! Rulati `java -jar Mars4_5.jar` din terminal cu Java 17+ si functioneaza perfect nativ fara nicio eroare.",
    likesCount: 14,
    createdAt: "2026-01-12T09:45:00Z",
    updatedAt: "2026-01-12T09:45:00Z",
    commentsCount: 4,
  },
];

// Helper to convert Course Offering folders to VS Code style Directory Tree Items
export function buildVsCodeTreeFromOffering(offering: MockCourseOffering): MockTreeItem {
  const rootItem: MockTreeItem = {
    id: `root-${offering.courseAbbr.toLowerCase()}`,
    name: `${offering.courseAbbr.toLowerCase()}-workspace`,
    type: "folder",
    path: offering.courseAbbr.toLowerCase(),
    children: [],
  };

  for (const folder of offering.folders) {
    const folderSlug = folder.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const folderItem: MockTreeItem = {
      id: folder.id,
      name: folderSlug,
      type: "folder",
      path: `${offering.courseAbbr.toLowerCase()}/${folderSlug}`,
      children: [],
    };

    for (const res of folder.resources) {
      let ext = "txt";
      if (res.type === "MATERIAL_FILE" && res.fileData?.extension) {
        ext = res.fileData.extension;
      } else if (res.type === "MATERIAL_LINK" && res.linkData?.linkType === "GITHUB") {
        ext = "md";
      } else if (res.type === "MATERIAL_LINK" && res.linkData?.linkType === "VIDEO") {
        ext = "video";
      } else if (res.type === "ASSIGNMENT") {
        ext = "assign";
      } else if (res.type === "EXAM") {
        ext = "exam";
      } else if (res.type === "LECTURE") {
        ext = "lec";
      }

      const fileName = res.filePath
        ? res.filePath.split("/").pop() || `${res.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${ext}`
        : `${res.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${ext}`;

      folderItem.children?.push({
        id: res.id,
        name: fileName,
        type: "file",
        path: `${offering.courseAbbr.toLowerCase()}/${folderSlug}/${fileName}`,
        extension: ext,
        resource: res,
        size: res.fileData?.size || 1024,
        updatedAt: res.updatedAt,
      });
    }

    rootItem.children?.push(folderItem);
  }

  return rootItem;
}

// Complete Course Offerings for Year 1
export const MOCK_COURSE_OFFERINGS_YEAR_1: MockCourseOffering[] = [
  {
    id: 1,
    courseId: "c-asc",
    courseName: "Arhitectura sistemelor de calcul",
    courseAbbr: "ASC",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 1,
    description: "Daca luati minim 5 la proiect, nu este necesar sa va prezentati la examen. Proiectul MIPS valoreaza 60%, iar examenul scris 40%.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.dragulici],
    folders: ASC_FOLDERS,
    posts: ASC_POSTS,
    materialDifficulty: "hard",
    passingDifficulty: "easy",
    creditPoints: 5,
  },
  {
    id: 2,
    courseId: "c-cdi",
    courseName: "Calcul diferential si integral",
    courseAbbr: "CDI",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 1,
    description: "Curs de analiza matematica clasica. Recomandam urmarirea playlist-ului YouTube cu seminariile rezolvate.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.munteanu],
    folders: [],
    posts: [],
    materialDifficulty: "hard",
    passingDifficulty: "medium",
    creditPoints: 5,
  },
  {
    id: 3,
    courseId: "c-itbi",
    courseName: "Instrumente si tehnici de baza in Informatica",
    courseAbbr: "ITBI",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 1,
    description: "Daca luati minim 5 la proiect (Bash / Linux scripts / Git), nu este necesar sa va prezentati la examen.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.dragulici],
    folders: [],
    posts: [],
    materialDifficulty: "easy",
    passingDifficulty: "easy",
    creditPoints: 4,
  },
  {
    id: 4,
    courseId: "c-pa",
    courseName: "Programarea algoritmilor",
    courseAbbr: "PA",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 1,
    description: "Fundamente de programare in Python si structuri de baza. Examenul scris reprezinta 100% din nota.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.dinu],
    folders: [],
    posts: [],
    materialDifficulty: "easy",
    passingDifficulty: "easy",
    creditPoints: 6,
  },
  {
    id: 5,
    courseId: "c-saif",
    courseName: "Structuri algebrice in informatica",
    courseAbbr: "SAIF",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 1,
    description: "La sfarsitul fiecarei lectii se da un test pentru puncte bonus (pana la 3.2p). Este foarte usor sa treceti daca acumulati bonusurile!",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.gica],
    folders: [],
    posts: [],
    materialDifficulty: "medium",
    passingDifficulty: "easy",
    creditPoints: 5,
  },
  {
    id: 6,
    courseId: "c-tw",
    courseName: "Tehnici web",
    courseAbbr: "TW",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 1,
    description: "Daca obtineti nota 10 din prezentarea proiectului personal, nu mai trebuie sa va prezentati la examen. Altfel: min 5 la proiect + min 5 la examen scris.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.ciocan],
    folders: [],
    posts: [],
    materialDifficulty: "easy",
    passingDifficulty: "easy",
    creditPoints: 5,
  },
  // Semester 2
  {
    id: 7,
    courseId: "c-bd",
    courseName: "Baze de date",
    courseAbbr: "BD",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 2,
    description: "Nota se obtine pe baza prezentarii proiectului SQL/relational. Ca sa luati 5, trebuie sa stiti sa executati interogari live in timpul prezentarii.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.tataram],
    folders: [],
    posts: [],
    materialDifficulty: "easy",
    passingDifficulty: "easy",
    creditPoints: 5,
  },
  {
    id: 8,
    courseId: "c-gal",
    courseName: "Geometrie si algebra liniara",
    courseAbbr: "GAL",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 2,
    description: "Spatii vectoriale, transformari liniare, valori proprii si geometrie analitica.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.muresean],
    folders: [],
    posts: [],
    materialDifficulty: "medium",
    passingDifficulty: "medium",
    creditPoints: 5,
  },
  {
    id: 9,
    courseId: "c-lfa",
    courseName: "Limbaje formale si automate",
    courseAbbr: "LFA",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 2,
    description: "Automate finite, gramatici regulate, automate pushdown si masini Turing. Trebuie minim 5 la tema, teorie si probleme.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.leustean],
    folders: [],
    posts: [],
    materialDifficulty: "medium",
    passingDifficulty: "medium",
    creditPoints: 5,
  },
  {
    id: 10,
    courseId: "c-lmc",
    courseName: "Logica matematica si computationala",
    courseAbbr: "LMC",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 2,
    description: "Daca faceti temele colective, porniti din start cu nota 4. Trebuie sa luati doar 0.5p la examen ca sa treceti!",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.leustean],
    folders: [],
    posts: [],
    materialDifficulty: "medium",
    passingDifficulty: "easy",
    creditPoints: 5,
  },
  {
    id: 11,
    courseId: "c-poo",
    courseName: "Programare orientata pe obiecte",
    courseAbbr: "POO",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 2,
    description: "Nota se obtine pe baza unui proiect complet C++. Prezentare de 3-5 minute cu explicarea conceptelor OOP.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.cherciu],
    folders: [],
    posts: [],
    materialDifficulty: "easy",
    passingDifficulty: "easy",
    creditPoints: 5,
  },
  {
    id: 12,
    courseId: "c-sdd",
    courseName: "Structuri de date",
    courseAbbr: "SDD",
    studyYearId: 1,
    studyYearName: "YEAR_1",
    semester: 2,
    description: "Arbori, tabele de dispersie, heap-uri, grafuri. Temele colective ofera start cu nota 4.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.dinu],
    folders: [],
    posts: [],
    materialDifficulty: "medium",
    passingDifficulty: "easy",
    creditPoints: 5,
  },
];

// Complete Course Offerings for Year 2
export const MOCK_COURSE_OFFERINGS_YEAR_2: MockCourseOffering[] = [
  {
    id: 13,
    courseId: "c-af",
    courseName: "Algoritmi fundamentali",
    courseAbbr: "AF",
    studyYearId: 2,
    studyYearName: "YEAR_2",
    semester: 1,
    description: "Fluxuri in retele, arbori de acoperire, algoritmi pe grafuri si complexitati computationale.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.dinu],
    folders: [],
    posts: [],
    creditPoints: 5,
  },
  {
    id: 14,
    courseId: "c-daw",
    courseName: "Dezvoltarea aplicatiilor web",
    courseAbbr: "DAW",
    studyYearId: 2,
    studyYearName: "YEAR_2",
    semester: 1,
    description: "Dezvoltare fullstack moderna (React / Node / Spring) si arhitecturi RESTful.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.ciocan],
    folders: [],
    posts: [],
    creditPoints: 5,
  },
  {
    id: 15,
    courseId: "c-ps",
    courseName: "Probabilitati si statistica",
    courseAbbr: "PS",
    studyYearId: 2,
    studyYearName: "YEAR_2",
    semester: 1,
    description: "Variabile aleatoare, distributii, intervale de incredere si teste de ipoteza.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.munteanu],
    folders: [],
    posts: [],
    creditPoints: 5,
  },
  {
    id: 16,
    courseId: "c-pf",
    courseName: "Programare functionala",
    courseAbbr: "PF",
    studyYearId: 2,
    studyYearName: "YEAR_2",
    semester: 1,
    description: "Haskell, lambda calcul, functii de ordin superior, monade si structuri imutabile.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.leustean],
    folders: [],
    posts: [],
    creditPoints: 5,
  },
  {
    id: 17,
    courseId: "c-sgbd",
    courseName: "Sisteme de gestiune a bazelor de date",
    courseAbbr: "SGBD",
    studyYearId: 2,
    studyYearName: "YEAR_2",
    semester: 1,
    description: "PL/SQL, optimizari de planuri de executie, indecsi, tranzactii si blocaje ACID.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.tataram],
    folders: [],
    posts: [],
    creditPoints: 5,
  },
  {
    id: 18,
    courseId: "c-so",
    courseName: "Sisteme de operare",
    courseAbbr: "SO",
    studyYearId: 2,
    studyYearName: "YEAR_2",
    semester: 1,
    description: "Procese, thread-uri, apeluri de sistem POSIX, comunicatie inter-procese (IPC) si gestiunea memoriei virtuale.",
    createdAt: "2026-07-01T00:00:00Z",
    teachers: [MOCK_TEACHERS.dragulici],
    folders: [],
    posts: [],
    creditPoints: 5,
  },
];

export const MOCK_COMMUNITIES: MockCommunity[] = [
  {
    id: "fmi-info-id",
    name: "FMI - Informatica ID",
    description: "Comunitatea oficiala a studentilor FMI Informatica Invatamant la Distanta. Resurse centralizate, sfaturi de la colegi, calendare de examene si materiale de laborator.",
    memberCount: 342,
    owner: MOCK_CURRENT_USER,
    createdAt: "2025-10-01T08:00:00Z",
    tags: ["FMI", "Informatica", "ID", "Bucuresti"],
    bannerGradient: "from-teal-600 via-emerald-700 to-slate-900",
    iconName: "Code2",
    isJoined: true,
    studyYears: [
      {
        id: 1,
        studyYearName: "YEAR_1",
        displayName: "Anul 1 (2025-2026)",
        communityId: "fmi-info-id",
        courseOfferings: MOCK_COURSE_OFFERINGS_YEAR_1,
        createdAt: "2025-10-01T08:00:00Z",
      },
      {
        id: 2,
        studyYearName: "YEAR_2",
        displayName: "Anul 2 (2026-2027)",
        communityId: "fmi-info-id",
        courseOfferings: MOCK_COURSE_OFFERINGS_YEAR_2,
        createdAt: "2026-10-01T08:00:00Z",
      },
      {
        id: 3,
        studyYearName: "YEAR_3",
        displayName: "Anul 3 (Licenta)",
        communityId: "fmi-info-id",
        courseOfferings: [],
        createdAt: "2026-10-01T08:00:00Z",
      },
    ],
  },
  {
    id: "fmi-mate-info-if",
    name: "FMI - Matematica-Informatica IF",
    description: "Comunitatea studentilor la zi din cadrul Facultatii de Matematica si Informatica.",
    memberCount: 518,
    owner: {
      id: "u-admin2",
      username: "alex_fmi",
      email: "alex@fmi.unibuc.ro",
      fullName: "Alexandru Popescu",
      role: "COMMUNITY_ADMIN",
    },
    createdAt: "2025-09-15T10:00:00Z",
    tags: ["FMI", "Matematica", "Zi", "IF"],
    bannerGradient: "from-blue-600 via-indigo-700 to-slate-900",
    iconName: "Binary",
    isJoined: false,
    studyYears: [],
  },
  {
    id: "unibuc-master-ai",
    name: "Master Inteligenta Artificiala & Data Science",
    description: "Discutii pe teme de cercetare, LLMs, Computer Vision si proiecte de masterat.",
    memberCount: 186,
    owner: {
      id: "u-ai-lead",
      username: "elena_ai",
      email: "elena@unibuc.ro",
      fullName: "Elena Radulescu",
      role: "COMMUNITY_ADMIN",
    },
    createdAt: "2025-11-01T12:00:00Z",
    tags: ["Master", "AI", "NLP", "Machine Learning"],
    bannerGradient: "from-purple-600 via-violet-800 to-slate-900",
    iconName: "Sparkles",
    isJoined: true,
    studyYears: [],
  },
  {
    id: "fmi-cti",
    name: "FMI - Calculatoare si Tehnologia Informatiei",
    description: "Hub academic pentru studentii programului de Calculatoare si Tehnologia Informatiei (4 ani).",
    memberCount: 295,
    owner: {
      id: "u-cti",
      username: "cti_rep",
      email: "cti@fmi.unibuc.ro",
      fullName: "Radu Ionescu",
      role: "COMMUNITY_ADMIN",
    },
    createdAt: "2025-10-10T10:00:00Z",
    tags: ["FMI", "CTI", "Hardware", "Inginerie"],
    bannerGradient: "from-amber-600 via-orange-700 to-slate-900",
    iconName: "Cpu",
    isJoined: false,
    studyYears: [],
  },
];

// Starred notifications for Starred Lectures, Exams, and Assignment Deadlines
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif-1",
    resourceId: "51365991-3559-541f-8060-2f8338c06bd6",
    title: "Proiect MIPS Assembly - Predare Finala",
    courseAbbr: "ASC",
    courseName: "Arhitectura sistemelor de calcul",
    type: "ASSIGNMENT",
    urgency: "ONE_DAY",
    urgencyLabel: "1 Day Before Deadline (Tomorrow 18:00)",
    targetDate: "2026-01-20T18:00:00Z",
    gradeWeight: 60,
    description: "Predarea proiectului practic MIPS. Nota >= 5 garanteaza promovarea fara examen!",
    isRead: false,
    isStarred: true,
  },
  {
    id: "notif-2",
    resourceId: "35a42333-1447-52fd-a99a-873257c56963",
    title: "Examen Scris Sesiune Iarna",
    courseAbbr: "ASC",
    courseName: "Arhitectura sistemelor de calcul",
    type: "EXAM",
    urgency: "ONE_DAY",
    urgencyLabel: "1 Day Before Exam (Tomorrow 18:00)",
    targetDate: "2026-01-20T18:00:00Z",
    gradeWeight: 40,
    locationOrRoom: "Amfiteatrul Spiru Haret",
    description: "Aveti voie cu materiale scrise de mana!",
    isRead: false,
    isStarred: true,
  },
  {
    id: "notif-3",
    resourceId: "asc-weekly-lecture",
    title: "Curs Live - Structura Procesoare & Pipeline",
    courseAbbr: "ASC",
    courseName: "Arhitectura sistemelor de calcul",
    type: "LECTURE",
    urgency: "ONE_DAY",
    urgencyLabel: "1 Day Before Lecture (Tomorrow 16:00)",
    targetDate: "2026-10-15T16:00:00Z",
    locationOrRoom: "Google Meet FMI",
    description: "Live session cu Prof. Daniel Dragulici.",
    isRead: true,
    isStarred: true,
  },
  {
    id: "notif-4",
    resourceId: "15ed5abc-0370-5d4d-8ea2-875c4902de23",
    title: "Examen Scris Analiza Matematica",
    courseAbbr: "CDI",
    courseName: "Calcul diferential si integral",
    type: "EXAM",
    urgency: "ONE_WEEK",
    urgencyLabel: "1 Week Before Exam (In 7 Days)",
    targetDate: "2026-01-25T12:00:00Z",
    gradeWeight: 100,
    locationOrRoom: "Sala 214 Corp FMI",
    description: "Examen individual scris. Fara materiale.",
    isRead: false,
    isStarred: true,
  },
  {
    id: "notif-5",
    resourceId: "1d6b133b-ca8b-5fa1-b27b-2181c48eec4d",
    title: "Examen Scris Programarea Algoritmilor",
    courseAbbr: "PA",
    courseName: "Programarea algoritmilor",
    type: "EXAM",
    urgency: "ONE_MONTH",
    urgencyLabel: "1 Month Before Exam (In 30 Days)",
    targetDate: "2026-01-31T10:00:00Z",
    gradeWeight: 100,
    locationOrRoom: "Amfiteatrul Titeica",
    description: "Examen grila + probleme de algoritmica.",
    isRead: true,
    isStarred: true,
  },
];

// Helper functions for easy querying in prototypes
export function getCommunityById(id: string): MockCommunity | undefined {
  return MOCK_COMMUNITIES.find((c) => c.id === id) || MOCK_COMMUNITIES[0];
}

export function getStudyYear(communityId: string, yearId: number | string): MockStudyYear | undefined {
  const community = getCommunityById(communityId);
  if (!community) return undefined;
  const numId = typeof yearId === "string" ? parseInt(yearId, 10) : yearId;
  return community.studyYears.find((y) => y.id === numId) || community.studyYears[0];
}

export function getCourseOffering(communityId: string, yearId: number | string, offeringId: number | string): MockCourseOffering | undefined {
  const year = getStudyYear(communityId, yearId);
  if (!year) return undefined;
  const numOfferingId = typeof offeringId === "string" ? parseInt(offeringId, 10) : offeringId;
  return year.courseOfferings.find((co) => co.id === numOfferingId) || year.courseOfferings[0];
}

export function getProfessorsForStudyYear(yearId: number | string): MockTeacher[] {
  const numYear = typeof yearId === "string" ? parseInt(yearId, 10) : yearId;
  return Object.values(MOCK_TEACHERS).filter((t) =>
    t.studyYearsTaught?.includes(numYear)
  );
}

export function getUserRatings(): MockTeacherRating[] {
  return Object.values(MOCK_TEACHERS)
    .flatMap((t) => t.ratings || [])
    .filter((r) => r.userId === "u-david");
}
