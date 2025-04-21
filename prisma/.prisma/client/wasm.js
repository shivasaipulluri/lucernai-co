
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  fullName: 'fullName',
  isPremium: 'isPremium',
  dailyResetDate: 'dailyResetDate',
  dailyBasicTailoringsUsed: 'dailyBasicTailoringsUsed',
  dailyPersonalizedTailoringsUsed: 'dailyPersonalizedTailoringsUsed',
  dailyAggressiveTailoringsUsed: 'dailyAggressiveTailoringsUsed',
  dailyCoverLettersUsed: 'dailyCoverLettersUsed',
  dailyLinkedinOptimizationsUsed: 'dailyLinkedinOptimizationsUsed',
  dailyInterviewSessionsUsed: 'dailyInterviewSessionsUsed',
  analyticsTimeRange: 'analyticsTimeRange',
  analyticsViewMode: 'analyticsViewMode',
  resumeTemplate: 'resumeTemplate',
  preferredTailoringMode: 'preferredTailoringMode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ResumeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeText: 'resumeText',
  jobDescription: 'jobDescription',
  modifiedResume: 'modifiedResume',
  tailoringMode: 'tailoringMode',
  version: 'version',
  label: 'label',
  atsScore: 'atsScore',
  jdScore: 'jdScore',
  goldenPassed: 'goldenPassed',
  isRefinement: 'isRefinement',
  isSaved: 'isSaved',
  originalResumeId: 'originalResumeId',
  wasManuallyEdited: 'wasManuallyEdited',
  scoresStale: 'scoresStale',
  finalModifiedSections: 'finalModifiedSections',
  atsWarnings: 'atsWarnings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ResumeEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  eventType: 'eventType',
  resumeText: 'resumeText',
  jobDescription: 'jobDescription',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.AnalyticsEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventType: 'eventType',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.TailoringAnalyticsScalarFieldEnum = {
  id: 'id',
  resumeId: 'resumeId',
  userId: 'userId',
  tailoringMode: 'tailoringMode',
  iterations: 'iterations',
  atsScore: 'atsScore',
  jdScore: 'jdScore',
  goldenPassed: 'goldenPassed',
  isRefinement: 'isRefinement',
  createdAt: 'createdAt',
  modifiedSections: 'modifiedSections'
};

exports.Prisma.ScrubbedResumeScalarFieldEnum = {
  id: 'id',
  resumeId: 'resumeId',
  cleanText: 'cleanText',
  createdAt: 'createdAt'
};

exports.Prisma.PromptArchiveScalarFieldEnum = {
  id: 'id',
  resumeId: 'resumeId',
  content: 'content',
  response: 'response',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ResumeInteractionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  action: 'action',
  createdAt: 'createdAt'
};

exports.Prisma.ResumeTagScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  tag: 'tag'
};

exports.Prisma.ResumeMetadataScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  contentSnippet: 'contentSnippet',
  tailoringMode: 'tailoringMode',
  iterations: 'iterations',
  passedRules: 'passedRules',
  atsScore: 'atsScore',
  jdScore: 'jdScore',
  createdAt: 'createdAt'
};

exports.Prisma.TailoringPromptScalarFieldEnum = {
  id: 'id',
  resumeId: 'resumeId',
  tailoringMode: 'tailoringMode',
  prompt: 'prompt',
  attempt: 'attempt',
  version: 'version',
  createdAt: 'createdAt'
};

exports.Prisma.TailoringProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  status: 'status',
  progress: 'progress',
  currentAttempt: 'currentAttempt',
  maxAttempts: 'maxAttempts',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TailoringAttemptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  attemptNumber: 'attemptNumber',
  atsScore: 'atsScore',
  jdScore: 'jdScore',
  goldenPassed: 'goldenPassed',
  feedback: 'feedback',
  suggestions: 'suggestions',
  atsFeedback: 'atsFeedback',
  jdFeedback: 'jdFeedback',
  createdAt: 'createdAt',
  modifiedSectionsSent: 'modifiedSectionsSent',
  modifiedSectionsReceived: 'modifiedSectionsReceived',
  promptTokens: 'promptTokens',
  goldenRuleFeedback: 'goldenRuleFeedback',
  iteration: 'iteration',
  modifiedSections: 'modifiedSections',
  score: 'score'
};

exports.Prisma.ResumeFeedbackScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  feedbackType: 'feedbackType',
  feedbackPoints: 'feedbackPoints',
  sourceVersion: 'sourceVersion',
  createdAt: 'createdAt'
};

exports.Prisma.ManualEditScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  editedText: 'editedText',
  createdAt: 'createdAt'
};

exports.Prisma.ManualScoringScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  atsScore: 'atsScore',
  jdScore: 'jdScore',
  atsFeedback: 'atsFeedback',
  jdFeedback: 'jdFeedback',
  createdAt: 'createdAt'
};

exports.Prisma.CoverLetterScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  jobDescription: 'jobDescription',
  content: 'content',
  tone: 'tone',
  atsScore: 'atsScore',
  jdScore: 'jdScore',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LinkedInOptimizationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobDescription: 'jobDescription',
  originalAbout: 'originalAbout',
  optimizedAbout: 'optimizedAbout',
  tone: 'tone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InterviewSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobDescription: 'jobDescription',
  selectedTypes: 'selectedTypes',
  questions: 'questions',
  answers: 'answers',
  needsReview: 'needsReview',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ResumeExportScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  templateId: 'templateId',
  format: 'format',
  createdAt: 'createdAt'
};

exports.Prisma.JobDescriptionIntelligenceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resumeId: 'resumeId',
  role: 'role',
  seniority: 'seniority',
  keywords: 'keywords',
  responsibilities: 'responsibilities',
  qualifications: 'qualifications',
  categories: 'categories',
  createdAt: 'createdAt'
};

exports.Prisma.ResumeSectionRationaleScalarFieldEnum = {
  id: 'id',
  resumeId: 'resumeId',
  userId: 'userId',
  sectionName: 'sectionName',
  rationale: 'rationale',
  createdAt: 'createdAt'
};

exports.Prisma.ContactSubmissionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  subject: 'subject',
  message: 'message',
  createdAt: 'createdAt',
  isRead: 'isRead'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  User: 'User',
  Resume: 'Resume',
  ResumeEvent: 'ResumeEvent',
  AnalyticsEvent: 'AnalyticsEvent',
  TailoringAnalytics: 'TailoringAnalytics',
  ScrubbedResume: 'ScrubbedResume',
  PromptArchive: 'PromptArchive',
  ResumeInteraction: 'ResumeInteraction',
  ResumeTag: 'ResumeTag',
  ResumeMetadata: 'ResumeMetadata',
  TailoringPrompt: 'TailoringPrompt',
  TailoringProgress: 'TailoringProgress',
  TailoringAttempt: 'TailoringAttempt',
  ResumeFeedback: 'ResumeFeedback',
  ManualEdit: 'ManualEdit',
  ManualScoring: 'ManualScoring',
  CoverLetter: 'CoverLetter',
  LinkedInOptimization: 'LinkedInOptimization',
  InterviewSession: 'InterviewSession',
  ResumeExport: 'ResumeExport',
  JobDescriptionIntelligence: 'JobDescriptionIntelligence',
  ResumeSectionRationale: 'ResumeSectionRationale',
  ContactSubmission: 'ContactSubmission'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
