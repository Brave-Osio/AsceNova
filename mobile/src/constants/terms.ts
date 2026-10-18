// Draft legal copy written from what the codebase actually does (schema, auth, AI integration).
// It has NOT been reviewed by counsel; have it reviewed before launch. This is a copy of the web app's
// src/constants/terms.ts (separate package): keep the two in sync.
//
// Statements are limited to behavior verified in server/ and src/. Anything the code does not do
// (consent records, 2FA, per-view audit of personal data) is listed as a gap, never described as a feature.

/** Block types a section can contain. `gap` renders as a highlighted "not implemented yet" callout. */
export type TermsBlock =
  | { kind: 'p'; text: string }
  | { kind: 'list'; title?: string; items: string[] }
  | { kind: 'gap'; title: string; items: string[] };

export interface TermsSection {
  id: string;
  heading: string;
  blocks: TermsBlock[];
}

export const TERMS_TITLE = 'Terms and Conditions';
export const TERMS_SUBTITLE = 'Terms of use, privacy, and data protection information';
export const TERMS_LAST_UPDATED = 'October 19, 2026';

/**
 * Optional privacy contact, set via EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL. Deliberately has no default: no
 * contact channel is configured in this project, so none is published until the team sets one.
 */
export const PRIVACY_CONTACT_EMAIL: string | undefined = process.env.EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL?.trim() || undefined;

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'about',
    heading: 'A. About ASCENOVA',
    blocks: [
      {
        kind: 'p',
        text: 'ASCENOVA is a fitness and workout tracking application. It helps you build a workout plan and nutrition targets, log your daily activity and body weight, set goals, join challenges, earn XP, ranks and achievements, compare consistency on a leaderboard, and ask an AI-assisted fitness coach questions.',
      },
      {
        kind: 'p',
        text: 'By creating an account you agree to these Terms and Conditions. If you do not agree, please do not create an account or use the service.',
      },
      {
        kind: 'list',
        title: 'Your responsibilities when using ASCENOVA',
        items: [
          'Enter information that is accurate and truthful. Your plans, targets and progress are only as good as the data you provide.',
          'Do not submit false progress data to gain XP or ranks, harass other users, or try to disrupt or gain unauthorized access to the service.',
          'Use the service at your own risk. ASCENOVA provides general fitness guidance, not medical advice. Consult a qualified professional before starting any exercise or nutrition program, especially if you have a health condition or injury or are pregnant.',
        ],
      },
    ],
  },
  {
    id: 'information-collected',
    heading: 'B. Information Collected',
    blocks: [
      { kind: 'p', text: 'This list reflects the data the application is built to store. It is based on the current database schema and forms.' },
      {
        kind: 'list',
        title: 'Account information',
        items: [
          'Your login username (stored in the email field of your account) and a password, which is stored only as a salted bcrypt hash, never as readable text.',
          'If you sign in with Google, an identifier for your Google account.',
          'An optional recovery Gmail address used only to send password reset links. It is not verified by the application.',
          'Account role (user or administrator), account status, and creation date.',
        ],
      },
      {
        kind: 'list',
        title: 'Fitness profile',
        items: [
          'Full name, age, and optionally gender.',
          'Height, current weight, and optional goal weight.',
          'Fitness goal, fitness level, equipment access, activity level, preferred workout days per week, preferred split style, preferred workout time, and optional sleep target.',
        ],
      },
      {
        kind: 'list',
        title: 'Activity and progress',
        items: [
          'Generated workout plans, exercises and nutrition targets (calories, macros, water).',
          'Daily logs: body weight, habit checkboxes (workout, water, protein, sleep, steps) and optional notes. Water and workout log records.',
          'Goals and their notes, challenge participation and progress, XP history, rank history, streaks, achievements and in-app notifications.',
        ],
      },
      {
        kind: 'list',
        title: 'AI fitness coach',
        items: [
          'The messages you send to the coach and its replies.',
          'With each reply, a snapshot of the profile, plan and progress context that was used to produce it (see section G).',
        ],
      },
      {
        kind: 'list',
        title: 'Technical information',
        items: [
          'Session records: a hash of your refresh token, its expiry and revocation time, plus the IP address and browser or device user-agent seen when the session was created.',
          'Password reset requests: a hash of the reset token, its expiry and whether it was used.',
          'Basic AI usage counts (request and token totals) used by administrators to monitor quota. These do not include message content.',
          'In your browser: a refresh-token cookie (httpOnly) and small preferences such as your theme and whether the sidebar is collapsed. Your short-lived access token is kept in memory only.',
        ],
      },
      {
        kind: 'p',
        text: 'The current version does not ask for payment card details, precise location, contacts, photos, or medical records, and it no longer collects food preferences, allergies or medical restrictions.',
      },
    ],
  },
  {
    id: 'storage',
    heading: 'C. Data Storage and Handling',
    blocks: [
      {
        kind: 'p',
        text: 'Your information is processed by ASCENOVA\'s backend API and stored in a PostgreSQL database accessed through Prisma. The project is configured for a Supabase-hosted Postgres database and for deployment behind Vercel. We use your information for legitimate application purposes: managing your account, building and showing your plans, tracking progress, running challenges and the leaderboard, and answering your requests to the AI coach.',
      },
      {
        kind: 'list',
        title: 'Who can see your information',
        items: [
          'You, through your signed-in account. Backend queries for your data are scoped to your user ID.',
          'Other signed-in users see only your leaderboard entry (name, rank, XP, streak) and, if you share a challenge, your name or login username and your challenge progress.',
          'Administrators (accounts with the admin role) can use the admin panel to see aggregate platform statistics and a minimal account list: a system-generated user ID, your login username, role, status, join date, XP and rank, and counts of check-ins and completed workouts. The server returns only those fields. The panel does not show your recovery Gmail, full name, profile or health details, passwords, session tokens or chat conversations. Administrative actions are recorded in an append-only audit log.',
          'Coaches (accounts with the coach role, assigned to you by an administrator) can open a read-only progress dashboard for you: your login username, rank, XP, streaks, check-in and workout counts, which daily habits you completed over the last 30 days (workout, water, protein, sleep, steps), your fitness goal and level, and the type, status and target date of your goals. The server returns only those fields. Coaches do not see your weight or body measurements, notes, step or sleep numbers, goal targets, recovery Gmail, full name, birthday, workout plan, or chat conversations. Administrators can open the same dashboard for any account. Each time a coach or administrator opens a client list or dashboard, it is recorded in the audit log.',
          'Anyone with direct access to the project\'s database or hosting accounts (for example the developers) can technically reach stored data. Access to those accounts is controlled outside this application.',
        ],
      },
      {
        kind: 'p',
        text: 'Encryption in transit, encryption at rest and network-level protections are provided by the hosting and database providers, not by ASCENOVA\'s own application code. They depend on how those services are configured, and we have not independently verified them from within this codebase. We therefore do not promise any specific level of infrastructure protection here.',
      },
    ],
  },
  {
    id: 'retention',
    heading: 'D. Data Retention',
    blocks: [
      {
        kind: 'p',
        text: 'ASCENOVA keeps your information for as long as it is needed to provide the features you use, maintain your account and workout history, support security, and meet legal obligations. Different kinds of data may be kept for different lengths of time. No fixed retention period is promised in these Terms.',
      },
      {
        kind: 'list',
        title: 'What happens today',
        items: [
          'Workout, log, goal, challenge, chat and achievement history stays on your account while the account exists.',
          'Refresh-token sessions expire after a configured period (30 days by default) and are revoked when you log out. Reset tokens expire and become unusable after one use.',
          'Self-service deletion: in Settings you can permanently delete your account after typing DELETE and re-entering your password (or confirming with Google). This immediately signs you out everywhere and erases your profile, plans, logs, weight and water history, XP, ranks, achievements, goals, notifications, chat messages and sign-in details. A random-ID placeholder row with no name, email or credentials remains so that shared records such as a challenge you started are not destroyed for other participants.',
          'When an administrator deletes an account, it is soft-deleted first: it can no longer sign in or use the API, and its data is permanently erased by the retention job after the soft-delete period (30 days by default).',
          'A retention job runs automatically every night. It permanently removes expired or revoked session tokens and used or expired reset tokens (after a 7-day grace period), and deletes AI chat messages older than 90 days.',
          'Administrator and coach actions (sign-ins, suspensions, role changes, coach assignments, coach and administrator views of client dashboards, deletions, achievement edits, exports) are recorded in an append-only audit log containing IDs, times and outcomes, never passwords, tokens or message content.',
        ],
      },
      {
        kind: 'gap',
        title: 'Limits of deletion and retention',
        items: [
          'Retention periods (30 days for administrator-deleted accounts, 90 days for chat messages) are the current defaults and may be changed by the operators. Data that passed these periods before the nightly job was switched on is removed on its first runs, in batches, so removal may take a few days.',
          'Backup retention and deletion delays are determined by the database host. Deleted data can persist in backups until they expire on the host\'s own schedule, which this application neither controls nor documents. We do not claim backups are erased immediately.',
          'Text sent to the AI provider to generate plans or coach replies is processed under that provider\'s own terms. The application cannot delete it from the provider\'s systems.',
          'Audit log entries are kept and store only opaque IDs; usernames shown next to them are looked up from the live account and disappear once an account is erased.',
        ],
      },
    ],
  },
  {
    id: 'security',
    heading: 'E. Security Measures',
    blocks: [
      { kind: 'p', text: 'No online service can be completely secure. The lists below separate what is implemented in the code from what is recommended or depends on configuration.' },
      {
        kind: 'list',
        title: 'Safeguards implemented in the application',
        items: [
          'Passwords are hashed with bcrypt (cost configurable, 12 by default) and password hashes are never returned by the API.',
          'On every API request the server re-checks that your account still exists, is active and not deleted, so a suspended or deleted account loses access immediately.',
          'Role-based authorization: all admin routes require the admin role, which is re-read from the database on each request. Administrators cannot suspend, delete or change the role of their own account through the admin panel, and the last remaining administrator cannot delete their account.',
          'Refresh tokens are random values; only their SHA-256 hash is stored. They rotate on use, reuse of a revoked token revokes your other sessions, and logout revokes the token. On the web the token is in an httpOnly, SameSite=Lax cookie that is marked Secure in production, and the access token is held only in memory. The mobile app keeps its refresh token in the device\'s secure storage.',
          'Password reset tokens are random, stored only as hashes, time-limited and single-use. Reset links are sent only to the recovery Gmail you saved, and only when email delivery is configured.',
          'All request bodies are validated on the server with Zod schemas, and database access goes through Prisma, which uses parameterized queries.',
          'Registration, login and forgot-password requests are rate limited (20 attempts per 15 minutes per IP address).',
          'Cross-origin access is restricted to an allow-list of configured frontend origins.',
          'Secrets (JWT signing secret, database URLs, AI API key, email credentials) live in server environment variables, are validated at startup, and are never sent to the browser.',
          'Unexpected server errors return a generic message to the client and are logged on the server instead of exposing internal details.',
        ],
      },
      {
        kind: 'gap',
        title: 'Recommended, optional or not verified',
        items: [
          'Access-token lifetime is optional configuration. If it is not set, access tokens do not expire on their own. Setting a short lifetime is recommended.',
          'HTTPS and encryption at rest depend on the hosting and database configuration. The application does not itself enforce HTTPS or set security headers such as HSTS or a content security policy.',
          'Only authentication routes are rate limited. Rate limits for other API routes are not implemented.',
          'The recovery Gmail address and login username are not email-verified, and there is no two-factor authentication.',
          'The audit log records administrative actions and coach/administrator views of client dashboards, not every page view by ordinary users. Administrators cannot view personal profile or chat data through the admin panel at all.',
          'Database access restrictions (who holds the database credentials, network rules) are managed outside the application and are not verified here.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    heading: 'F. Respect for Data Privacy',
    blocks: [
      {
        kind: 'p',
        text: 'We treat personal and fitness-related information as sensitive. ASCENOVA aims to:',
      },
      {
        kind: 'list',
        items: [
          'collect and process information only for the legitimate, disclosed purposes described in these Terms;',
          'avoid collecting more personal information than the features need (for example, optional fields such as gender, goal weight and sleep target are optional);',
          'limit access to authorized individuals and system components according to their permissions;',
          'not sell your personal data and not disclose it to unrelated third parties without an appropriate legal basis or your authorization;',
          'handle requests about your personal information in line with applicable law and the application\'s actual capabilities;',
          'tell you clearly how your data is used and protected; and',
          'apply appropriate safeguards when third-party service providers process information on our behalf.',
        ],
      },
      {
        kind: 'p',
        text: 'Where it applies, ASCENOVA aims to follow the principles of transparency, legitimate purpose and proportionality in the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and its implementing rules, including taking reasonable organizational, physical and technical measures to protect personal data and respecting data-subject rights. This is a statement of intent. ASCENOVA is not certified, registered or legally approved as compliant with that law, and nothing here should be read as such a claim.',
      },
    ],
  },
  {
    id: 'ai-third-parties',
    heading: 'G. AI Fitness Coach and Third-Party Services',
    blocks: [
      {
        kind: 'p',
        text: 'The AI coach and AI-generated workout plans use Google Gemini through the Gemini API. The model is set in the server configuration (gemini-2.5-flash by default). Requests are made from ASCENOVA\'s backend, so the API key is never exposed to your browser.',
      },
      {
        kind: 'list',
        title: 'What is sent to the AI provider',
        items: [
          'For coach chat: your message, up to your last 10 chat turns, and a text summary of your context: your name, age, gender if provided, height and weight, goal, fitness level, equipment and activity level, your active plan, your rank, XP, streak and achievements, your last seven daily logs (weight and habits), today\'s water intake and your active goals.',
          'For plan generation: your age, gender, height, weight, goal, fitness level, equipment access, workout frequency and recent adherence. Your name and login username are not included.',
          'A copy of the context used for each coach reply is stored in ASCENOVA\'s database alongside the reply.',
        ],
      },
      {
        kind: 'p',
        text: 'Google processes this information under its own terms and privacy policies, which we do not control. We have not verified how Google retains the data or whether it is used to improve its models, so we make no promise on those points. Please do not put information in coach messages that you would not want processed by an external provider.',
      },
      {
        kind: 'p',
        text: 'AI output can be wrong. If AI plan generation is unavailable, ASCENOVA may supply a pre-made backup plan chosen to fit your stats, which does not involve the AI provider. If the coach is unavailable, you will see an error and can retry. AI guidance is not medical advice and does not replace a doctor, physiotherapist or dietitian. Stop any exercise that causes pain.',
      },
      {
        kind: 'list',
        title: 'Other third-party services',
        items: [
          'Google Sign-In (optional): used to verify your Google identity token when you choose to sign in with Google.',
          'Gmail SMTP (optional): used to send password reset emails to your recovery Gmail when configured.',
          'Supabase and Vercel: the database and hosting providers the project is set up to use.',
          'Google Fonts: the web app loads its typeface from Google Fonts, so your browser contacts Google servers when a page loads.',
        ],
      },
    ],
  },
  {
    id: 'responsibilities',
    heading: 'H. User Responsibilities and Account Security',
    blocks: [
      {
        kind: 'p',
        text: 'You are responsible for keeping your password confidential, for activity on your account, for giving accurate information, and for telling us promptly if you suspect unauthorized access. We may suspend accounts that abuse the service, other users, the leaderboard or challenges.',
      },
      {
        kind: 'list',
        title: 'Account security features available today',
        items: [
          'Change your password while signed in (Settings).',
          'Save a recovery Gmail (Settings) and use "Forgot password" to receive a time-limited reset link. Accounts without a saved recovery address, and Google-only accounts, cannot receive reset links this way.',
          'Log out to revoke the current session\'s refresh token. Resetting your password also revokes your other sessions.',
        ],
      },
      {
        kind: 'p',
        text: 'There is currently no screen listing your active sessions and no two-factor authentication.',
      },
    ],
  },
  {
    id: 'rights',
    heading: 'I. User Rights and Contact Information',
    blocks: [
      {
        kind: 'list',
        title: 'Your rights over your personal information',
        items: [
          'Access: you can see most of your data in the app (profile, logs, plans, goals, challenges, chat history, progress).',
          'Correction: you can edit your profile and preferences in Settings and update your recovery Gmail and password.',
          'Deletion and other requests: you may ask for your account and data to be deleted, or exercise other data-subject rights that apply to you under the law. Deletion is self-service in Settings (see section D for exactly what it erases and what it cannot). For other requests, contact the operators.',
        ],
      },
      {
        kind: 'p',
        text: PRIVACY_CONTACT_EMAIL
          ? `Send privacy requests and questions to ${PRIVACY_CONTACT_EMAIL}.`
          : 'No privacy contact has been configured for this deployment yet, so none is listed here. The operators of this deployment must set one (the EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL setting) before launch. Until then, please contact whoever provided you access to ASCENOVA.',
      },
    ],
  },
  {
    id: 'updates',
    heading: 'J. Updates and Acceptance',
    blocks: [
      {
        kind: 'p',
        text: 'We may update these Terms and the privacy information in them as the system evolves or legal requirements change. The "Last updated" date at the top of this page shows when they last changed.',
      },
      {
        kind: 'gap',
        title: 'How acceptance and changes work today',
        items: [
          'When you register you must tick a box agreeing to these Terms. The tick is checked in your browser; the application does not store a record of when or which version you accepted.',
          'The application has no mechanism that notifies users of changes or asks them to accept revised terms. Continuing to use ASCENOVA after an update is the only signal of continued agreement, and material changes should be announced through the channel the operators choose.',
        ],
      },
    ],
  },
];
