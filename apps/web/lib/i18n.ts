/**
 * Revizr i18n — English (en-GB) and Welsh (cy) string dictionaries.
 *
 * Covers all UI chrome strings. Question content language is controlled by
 * exam paper source language, not this toggle (per IA rule §7 point 4).
 *
 * Welsh strings follow government Welsh Language Standards.
 * Silent fallback to English when a Welsh string is missing (F13 flow spec).
 */

export type Locale = "en-GB" | "cy";

export interface Strings {
  // Navigation
  navHome: string;
  navMyTopics: string;
  navHistory: string;
  navProgress: string;
  navAccount: string;
  navSignOut: string;

  // Auth
  authGetStarted: string;
  authSignIn: string;
  authSignInTitle: string;
  authAlreadyHaveAccount: string;
  authForgotPassword: string;
  authResetPassword: string;
  authCreateAccount: string;
  authEmailLabel: string;
  authPasswordLabel: string;
  authNameLabel: string;
  authPasswordHint: string;
  authTermsConsent: string;

  // Onboarding
  onboardingWelcomeHeading: string;
  onboardingWelcomeSubheading: string;
  onboardingWelcomeFreeToTry: string;
  onboardingWhoSigningUp: string;
  onboardingImAStudent: string;
  onboardingImAParent: string;
  onboardingStudentDescription: string;
  onboardingParentDescription: string;
  onboardingTellUsAboutYou: string;
  onboardingFirstName: string;
  onboardingFirstNamePlaceholder: string;
  onboardingYearGroup: string;
  onboardingYearGroupSelect: string;
  onboardingUnder13Notice: string;
  onboardingContinue: string;
  onboardingExamSetupHeading: string;
  onboardingExamBoard: string;
  onboardingYourSubjects: string;
  onboardingAddMoreLater: string;
  onboardingDiagnosticChoiceHeading: string;
  onboardingUploadReport: string;
  onboardingUploadReportDescription: string;
  onboardingUploadReportTime: string;
  onboardingTakeQuiz: string;
  onboardingTakeQuizDescription: string;
  onboardingTakeQuizTime: string;
  onboardingBothFree: string;

  // Parent registration
  parentWelcomeHeading: string;
  parentWelcomeSubheading: string;
  parentCreateAccount: string;
  parentConsentReviewHeading: string;
  parentConsentConfirmHeading: string;
  parentConsentConfirm1: string;
  parentConsentConfirm2: string;
  parentConsentActivate: string;
  parentConsentDoneHeading: string;

  // Processing
  processingHeading: string;
  processingBody: string;
  processingStillWorking: string;
  processingTakingLonger: string;
  processingTimeout: string;

  // Practice session
  sessionQuestion: string;
  sessionSubmitAnswer: string;
  sessionSkip: string;
  sessionMarkScheme: string;
  sessionCorrect: string;
  sessionNotQuite: string;
  sessionNextQuestion: string;
  sessionEndSession: string;
  sessionComplete: string;
  sessionQuestionsAttempted: string;
  sessionScore: string;
  sessionTime: string;
  sessionTopicsCovered: string;
  sessionStartAnother: string;
  sessionBackToTopics: string;
  sessionHowDidYouDo: string;
  sessionBeHonest: string;
  sessionYourAnswer: string;
  sessionExaminerTips: string;

  // Weakness map
  weaknessMapHeading: string;
  weaknessMapTopicsNeedPractice: string;
  statusCriticalLabel: string;
  statusWeakLabel: string;
  statusModerateLabel: string;
  statusStrongLabel: string;
  statusImprovingLabel: string;
  statusNeutralLabel: string;
  startPractice: string;
  continuePractice: string;
  practiceAnyway: string;
  unlockToContinue: string;
  questionsReady: string;

  // Parent dashboard
  parentDashboardHeading: string;
  parentYourChildren: string;
  parentLastSession: string;
  parentViewProgress: string;
  parentOnTrack: string;
  parentImproving: string;
  parentNeedsAttention: string;
  parentNotStarted: string;
  parentFallingBehind: string;
  parentAddChild: string;
  parentHowDoing: string;

  // Account / Settings
  accountSettings: string;
  accountSubscription: string;
  accountPrivacy: string;
  accountLanguage: string;
  accountLanguageEnglish: string;
  accountLanguageWelsh: string;
  accountDataRights: string;
  accountDownloadData: string;
  accountDeleteAccount: string;
  accountDeleteWarning: string;

  // Subscription
  subscriptionPlan: string;
  subscriptionUpgrade: string;
  subscriptionManage: string;
  subscriptionFree: string;
  subscriptionMonthly: string;
  subscriptionAnnual: string;
  subscriptionUnlock: string;
  subscriptionSeePlans: string;

  // Errors / Generic
  errorGeneral: string;
  errorNetwork: string;
  errorRequired: string;
  errorEmailFormat: string;
  errorEmailConflict: string;
  errorInvalidCredentials: string;
  errorTryAgain: string;
  errorOffline: string;
  errorOfflineBody: string;
  loading: string;
}

const en: Strings = {
  // Navigation
  navHome: "Home",
  navMyTopics: "My Topics",
  navHistory: "History",
  navProgress: "Progress",
  navAccount: "Account",
  navSignOut: "Sign out",

  // Auth
  authGetStarted: "Get started — free",
  authSignIn: "Sign in",
  authSignInTitle: "Sign in to Revizr",
  authAlreadyHaveAccount: "Already have an account?",
  authForgotPassword: "Forgot password?",
  authResetPassword: "Reset your password",
  authCreateAccount: "Create account",
  authEmailLabel: "Email address",
  authPasswordLabel: "Password",
  authNameLabel: "Your name",
  authPasswordHint: "At least 10 characters, including uppercase, lowercase, and a number",
  authTermsConsent: "I agree to the Terms of Service and Privacy Policy",

  // Onboarding
  onboardingWelcomeHeading: "Revision that knows exactly what you need",
  onboardingWelcomeSubheading:
    "Real past paper questions, targeted at your weak spots.",
  onboardingWelcomeFreeToTry: "Free to try.",
  onboardingWhoSigningUp: "Who's signing up today?",
  onboardingImAStudent: "I'm a student",
  onboardingImAParent: "I'm a parent",
  onboardingStudentDescription: "I'm revising for an exam",
  onboardingParentDescription: "Setting up for my child",
  onboardingTellUsAboutYou: "Tell us about yourself",
  onboardingFirstName: "Your first name",
  onboardingFirstNamePlaceholder: "e.g. Amara",
  onboardingYearGroup: "What year are you in?",
  onboardingYearGroupSelect: "Select year group",
  onboardingUnder13Notice:
    "Children under 13 need a parent or guardian to confirm their account. We'll send them an email.",
  onboardingContinue: "Continue",
  onboardingExamSetupHeading: "Which exam are you preparing for?",
  onboardingExamBoard: "Exam board",
  onboardingYourSubjects: "Your subjects",
  onboardingAddMoreLater: "You can add more later",
  onboardingDiagnosticChoiceHeading: "How do you want us to find your weak spots?",
  onboardingUploadReport: "Upload your school report",
  onboardingUploadReportDescription:
    "We'll read your teacher's comments and build your topic map from that.",
  onboardingUploadReportTime: "Takes: under 2 mins",
  onboardingTakeQuiz: "Take a short quiz",
  onboardingTakeQuizDescription:
    "Answer a few questions and we'll map your topics for you.",
  onboardingTakeQuizTime: "Takes: about 10–20 min",
  onboardingBothFree: "Both options are free.",

  // Parent registration
  parentWelcomeHeading: "Welcome to Revizr for parents",
  parentWelcomeSubheading:
    "You'll have your own dashboard showing your child's progress — in plain English, no jargon.",
  parentCreateAccount: "Create my account",
  parentConsentReviewHeading: "Review your child's account",
  parentConsentConfirmHeading: "Confirm your consent",
  parentConsentConfirm1:
    "I confirm that I am the parent or guardian of this child and I give consent for Revizr to process their personal data as described above.",
  parentConsentConfirm2:
    "I understand that I can withdraw consent and delete this child's data at any time from Account Settings.",
  parentConsentActivate: "Confirm and activate account",
  parentConsentDoneHeading: "Account is ready",

  // Processing
  processingHeading: "Building your topic map…",
  processingBody:
    "We're reading your subjects and finding where you need the most practice.",
  processingStillWorking: "Still working — almost there",
  processingTakingLonger: "Taking a little longer than usual. Thanks for your patience.",
  processingTimeout:
    "This is taking longer than expected. We'll email you when your map is ready.",

  // Practice session
  sessionQuestion: "Question",
  sessionSubmitAnswer: "Submit answer",
  sessionSkip: "Skip this question",
  sessionMarkScheme: "Mark scheme",
  sessionCorrect: "Correct!",
  sessionNotQuite: "Not quite",
  sessionNextQuestion: "Next question",
  sessionEndSession: "End session",
  sessionComplete: "Session complete",
  sessionQuestionsAttempted: "Questions",
  sessionScore: "Score",
  sessionTime: "Time",
  sessionTopicsCovered: "Topics covered",
  sessionStartAnother: "Start another session",
  sessionBackToTopics: "Back to My Topics",
  sessionHowDidYouDo: "How did you do?",
  sessionBeHonest:
    "Be honest — this helps us find the right questions for you.",
  sessionYourAnswer: "Your answer",
  sessionExaminerTips: "Examiner tips",

  // Weakness map
  weaknessMapHeading: "My Topics",
  weaknessMapTopicsNeedPractice: "topics need practice",
  statusCriticalLabel: "Most needs work",
  statusWeakLabel: "Needs practice",
  statusModerateLabel: "Building confidence",
  statusStrongLabel: "Looking good",
  statusImprovingLabel: "Improving",
  statusNeutralLabel: "Not yet assessed",
  startPractice: "Start practice",
  continuePractice: "Continue practice",
  practiceAnyway: "Practise anyway",
  unlockToContinue: "Unlock to continue",
  questionsReady: "questions ready",

  // Parent dashboard
  parentDashboardHeading: "Your children",
  parentYourChildren: "Your children",
  parentLastSession: "Last session",
  parentViewProgress: "View progress",
  parentOnTrack: "On track",
  parentImproving: "Improving",
  parentNeedsAttention: "Needs attention",
  parentNotStarted: "Not started yet",
  parentFallingBehind: "Falling behind",
  parentAddChild: "Add another child",
  parentHowDoing: "How they are doing",

  // Account / Settings
  accountSettings: "Account settings",
  accountSubscription: "Subscription",
  accountPrivacy: "Privacy & data",
  accountLanguage: "Language",
  accountLanguageEnglish: "English",
  accountLanguageWelsh: "Welsh (Cymraeg)",
  accountDataRights: "Your data rights",
  accountDownloadData: "Download my data",
  accountDeleteAccount: "Delete my account",
  accountDeleteWarning:
    "Deleting your account will cancel your subscription and permanently remove your data. This cannot be undone.",

  // Subscription
  subscriptionPlan: "Your plan",
  subscriptionUpgrade: "Upgrade",
  subscriptionManage: "Manage subscription",
  subscriptionFree: "Free",
  subscriptionMonthly: "Monthly — £19.99/month",
  subscriptionAnnual: "Annual — £179/year",
  subscriptionUnlock: "Unlock your full question pack",
  subscriptionSeePlans: "See plans",

  // Errors / Generic
  errorGeneral: "Something went wrong. Please try again.",
  errorNetwork: "Network error. Check your connection and try again.",
  errorRequired: "This field is required.",
  errorEmailFormat: "Enter a valid email address.",
  errorEmailConflict:
    "An account with this email already exists. Sign in instead?",
  errorInvalidCredentials: "Email or password is incorrect.",
  errorTryAgain: "Try again",
  errorOffline: "You're offline",
  errorOfflineBody:
    "Your progress is saved. Reconnect to continue.",
  loading: "Loading…",
};

const cy: Partial<Strings> = {
  // Navigation
  navHome: "Cartref",
  navMyTopics: "Fy Nhopiciau",
  navHistory: "Hanes",
  navProgress: "Cynnydd",
  navAccount: "Cyfrif",
  navSignOut: "Allgofnodi",

  // Auth
  authGetStarted: "Dechrau — am ddim",
  authSignIn: "Mewngofnodi",
  authSignInTitle: "Mewngofnodi i Revizr",
  authAlreadyHaveAccount: "Eisoes â chyfrif?",
  authForgotPassword: "Wedi anghofio cyfrinair?",
  authResetPassword: "Ailosod eich cyfrinair",
  authCreateAccount: "Creu cyfrif",
  authEmailLabel: "Cyfeiriad e-bost",
  authPasswordLabel: "Cyfrinair",
  authNameLabel: "Eich enw",
  authContinue: "Parhau",

  // Onboarding
  onboardingWelcomeHeading: "Adolygu sy'n gwybod yn union beth sydd ei angen arnoch",
  onboardingWelcomeSubheading:
    "Cwestiynau papur hen arholiad go iawn, wedi'u targedu at eich mannau gwan.",
  onboardingWelcomeFreeToTry: "Am ddim i'w roi ar brawf.",
  onboardingWhoSigningUp: "Pwy sy'n cofrestru heddiw?",
  onboardingImAStudent: "Myfyriwr ydw i",
  onboardingImAParent: "Rhiant ydw i",
  onboardingStudentDescription: "Rwy'n adolygu ar gyfer arholiad",
  onboardingParentDescription: "Gosod i fyny ar gyfer fy mhlentyn",
  onboardingContinue: "Parhau",

  // Processing
  processingHeading: "Adeiladu eich map topig…",
  processingBody:
    "Rydym yn darllen eich pynciau ac yn darganfod ble mae angen y mwyaf o ymarfer arnoch.",

  // Weakness map
  weaknessMapHeading: "Fy Nhopiciau",
  startPractice: "Dechrau ymarfer",
  continuePractice: "Parhau ymarfer",
  practiceAnyway: "Ymarfer beth bynnag",

  // Errors
  errorGeneral: "Aeth rhywbeth o'i le. Rhowch gynnig arall arni.",
  errorTryAgain: "Rhoi cynnig arall arni",
  loading: "Yn llwytho…",
};

const dictionaries: Record<Locale, Strings> = {
  "en-GB": en,
  cy: { ...en, ...cy } as Strings,
};

/**
 * Returns the string dictionary for the given locale.
 * Falls back to en-GB for any missing Welsh strings.
 */
export function getStrings(locale: Locale = "en-GB"): Strings {
  return dictionaries[locale] ?? dictionaries["en-GB"];
}

/**
 * Lightweight hook-friendly helper. Returns a translation function scoped
 * to the given locale.
 */
export function createT(locale: Locale) {
  const strings = getStrings(locale);
  return function t(key: keyof Strings): string {
    return strings[key] ?? (en[key] as string) ?? key;
  };
}
