import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Configuration
const NUM_USERS = 5
const RESUMES_PER_USER = 3
const COVER_LETTERS_PER_RESUME = 2
const LINKEDIN_OPTIMIZATIONS_PER_USER = 2
const INTERVIEW_SESSIONS_PER_USER = 2

// Utility to generate random date in the past (up to maxDays ago)
const randomPastDate = (maxDays = 30) => {
  const pastDate = new Date()
  pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * maxDays))
  return pastDate
}

// Utility to pick a random item from an array
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Utility to generate a random boolean with a bias
const randomBoolean = (trueBias = 0.5) => {
  return Math.random() < trueBias;
};

// Utility to generate a random score (0-100)
const randomScore = (min = 60, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Sample data
const tailoringModes = ['basic', 'personalized', 'aggressive'];
const tones = ['professional', 'enthusiastic', 'confident', 'conversational'];
const interviewTypes = ['Behavioral', 'Technical', 'Role-Specific', 'Case-Based'];
const exportFormats = ['pdf', 'docx'];
const templateIds = ['classic-serif', 'modern-sans', 'executive', 'minimalist', 'two-column', 'creative'];

// Sample resume text
const generateResumeText = () => {
  return `${faker.person.fullName()}
${faker.location.streetAddress()}
${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}
${faker.internet.email()} | ${faker.phone.number()}

PROFESSIONAL SUMMARY
${faker.person.jobTitle()} with ${faker.number.int({ min: 2, max: 15 })} years of experience in ${faker.person.jobArea()}.

SKILLS
${faker.person.jobDescriptor()}, ${faker.person.jobType()}, ${faker.hacker.noun()}, ${faker.hacker.verb()}, ${faker.hacker.adjective()}

EXPERIENCE
${faker.person.jobTitle()}
${faker.company.name()}, ${faker.location.city()}, ${faker.location.state()}
${faker.date.past({ years: 5 }).toLocaleDateString()} - Present
• ${faker.company.buzzPhrase()}
• ${faker.company.buzzPhrase()}
• ${faker.company.buzzPhrase()}

${faker.person.jobTitle()}
${faker.company.name()}, ${faker.location.city()}, ${faker.location.state()}
${faker.date.past({ years: 8 }).toLocaleDateString()} - ${faker.date.past({ years: 5 }).toLocaleDateString()}
• ${faker.company.buzzPhrase()}
• ${faker.company.buzzPhrase()}

EDUCATION
${faker.person.jobArea()} Degree
${faker.company.name()} University, ${faker.location.city()}, ${faker.location.state()}
${faker.date.past({ years: 10 }).getFullYear()}`;
};

// Sample job description
const generateJobDescription = () => {
  const jobTitle = faker.person.jobTitle();
  const company = faker.company.name();
  
  return `${jobTitle} at ${company}

About the Role:
${company} is seeking a talented ${jobTitle} to join our team. This is a ${randomItem(['full-time', 'part-time', 'contract']) as string} position based in ${faker.location.city()}.

Responsibilities:
• ${faker.company.buzzPhrase()}
• ${faker.company.buzzPhrase()}
• ${faker.company.buzzPhrase()}
• ${faker.company.buzzPhrase()}
• ${faker.company.buzzPhrase()}

Requirements:
• ${faker.number.int({ min: 1, max: 10 })}+ years of experience in ${faker.person.jobArea()}
• Proficiency in ${faker.hacker.noun()}, ${faker.hacker.verb()}, and ${faker.hacker.adjective()}
• Bachelor's degree in ${faker.person.jobArea()} or related field
• Strong ${faker.hacker.adjective()} and ${faker.hacker.adjective()} skills
• Experience with ${faker.hacker.noun()} and ${faker.hacker.noun()}

Benefits:
• Competitive salary
• Health, dental, and vision insurance
• 401(k) matching
• Flexible work arrangements
• Professional development opportunities

${company} is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.`;
};

// Generate JD Intelligence categories
const generateJDCategories = () => {
  return {
    technical: [
      faker.hacker.noun(),
      faker.hacker.verb(),
      faker.hacker.adjective(),
      faker.hacker.noun(),
    ],
    soft: [
      'Communication',
      'Teamwork',
      'Problem-solving',
      'Adaptability',
    ],
    certifications: [
      faker.company.buzzNoun(),
      faker.company.buzzNoun(),
    ]
  };
};

// Main seeding function
async function seed() {
  console.log('🌱 Starting database seeding...');
  
  // Clear existing data (optional - uncomment if needed)
  console.log('🧹 Clearing existing data...');
  await prisma.$transaction([
    prisma.resumeExport.deleteMany({}),
    prisma.jobDescriptionIntelligence.deleteMany({}),
    prisma.interviewSession.deleteMany({}),
    prisma.linkedInOptimization.deleteMany({}),
    prisma.coverLetter.deleteMany({}),
    prisma.manualScoring.deleteMany({}),
    prisma.manualEdit.deleteMany({}),
    prisma.resumeFeedback.deleteMany({}),
    prisma.tailoringAttempt.deleteMany({}),
    prisma.tailoringProgress.deleteMany({}),
    prisma.tailoringPrompt.deleteMany({}),
    prisma.resumeMetadata.deleteMany({}),
    prisma.resumeTag.deleteMany({}),
    prisma.resumeInteraction.deleteMany({}),
    prisma.promptArchive.deleteMany({}),
    prisma.scrubbedResume.deleteMany({}),
    prisma.tailoringAnalytics.deleteMany({}),
    prisma.analyticsEvent.deleteMany({}),
    prisma.resumeEvent.deleteMany({}),
    prisma.resume.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
  
  console.log('👤 Creating users...');
  const users = [];
  
  // Create test users
  for (let i = 0; i < NUM_USERS; i++) {
    const isPremium = i === 0 || randomBoolean(0.3); // First user is premium, others random
    
    const user = await prisma.user.create({
      data: {
        email: i === 0 ? 'test@example.com' : faker.internet.email(),
        fullName: faker.person.fullName(),
        isPremium,
        dailyResetDate: randomPastDate(3),
        dailyBasicTailoringsUsed: faker.number.int({ min: 0, max: 5 }),
        dailyPersonalizedTailoringsUsed: faker.number.int({ min: 0, max: 3 }),
        dailyAggressiveTailoringsUsed: faker.number.int({ min: 0, max: 2 }),
        dailyCoverLettersUsed: faker.number.int({ min: 0, max: 3 }),
        dailyLinkedinOptimizationsUsed: faker.number.int({ min: 0, max: 2 }),
        dailyInterviewSessionsUsed: faker.number.int({ min: 0, max: 2 }),
        analyticsTimeRange: randomItem(['7days', '30days', 'all']),
        analyticsViewMode: randomItem(['compact', 'detailed']),
        resumeTemplate: randomItem(templateIds),
      },
    });
    
    users.push(user);
    console.log(`  Created user: ${user.email} (${isPremium ? 'Premium' : 'Free'})`);
  }
  
  console.log('📄 Creating resumes and related data...');
  
  // For each user, create resumes and related data
  for (const user of users) {
    console.log(`  Processing user: ${user.email}`);
    
    for (let i = 0; i < RESUMES_PER_USER; i++) {
      const resumeText = generateResumeText();
      const jobDescription = generateJobDescription();
      const tailoringMode = randomItem(tailoringModes);
      const version = faker.number.int({ min: 1, max: 3 });
      const atsScore = randomScore();
      const jdScore = randomScore();
      const goldenPassed = randomBoolean(0.7);
      const isRefinement = version > 1;
      const wasManuallyEdited = randomBoolean(0.3);
      const scoresStale = wasManuallyEdited && randomBoolean(0.5);
      const isSaved = randomBoolean(0.7);
      
      // Create resume
      const resume = await prisma.resume.create({
        data: {
          userId: user.id,
          resumeText,
          jobDescription,
          modifiedResume: resumeText + '\n\n[TAILORED VERSION]',
          tailoringMode,
          version,
          atsScore,
          jdScore,
          goldenPassed,
          isRefinement,
          wasManuallyEdited,
          scoresStale,
          isSaved,
          originalResumeId: isRefinement ? faker.string.uuid() : null,
          createdAt: randomPastDate(30),
          updatedAt: randomPastDate(15),
        },
      });
      
      console.log(`    Created resume: ${resume.id} (v${version})`);
      
      // Create scrubbed resume
      await prisma.scrubbedResume.create({
        data: {
          resumeId: resume.id,
          cleanText: resumeText.replace(/\d+/g, 'X'),
          createdAt: randomPastDate(30),
        },
      });
      
      // Create resume event
      await prisma.resumeEvent.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          eventType: 'upload',
          resumeText,
          jobDescription,
          metadata: { source: 'web', tailoringMode },
          createdAt: randomPastDate(30),
        },
      });
      
      // Create analytics event
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventType: 'resume_tailored',
          metadata: { resumeId: resume.id, tailoringMode },
          createdAt: randomPastDate(30),
        },
      });
      
      // Create tailoring analytics
      await prisma.tailoringAnalytics.create({
        data: {
          resumeId: resume.id,
          userId: user.id,
          tailoringMode,
          iterations: faker.number.int({ min: 1, max: 3 }),
          atsScore,
          jdScore,
          goldenPassed,
          isRefinement,
          createdAt: randomPastDate(30),
        },
      });
      
      // Create prompt archive
      await prisma.promptArchive.create({
        data: {
          resumeId: resume.id,
          content: `Tailor this resume for ${jobDescription.substring(0, 50)}...`,
          response: 'Here is your tailored resume...',
          metadata: { model: 'gemini-1.5-flash', temperature: 0.7 },
          createdAt: randomPastDate(30),
        },
      });
      
      // Create resume interaction
      await prisma.resumeInteraction.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          action: randomItem(['view', 'download', 'edit', 'share']),
          createdAt: randomPastDate(30),
        },
      });
      
      // Create resume tag
      await prisma.resumeTag.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          tag: randomItem(['tech', 'finance', 'marketing', 'healthcare']),
        },
      });
      
      // Create resume metadata
      await prisma.resumeMetadata.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          contentSnippet: resumeText.substring(0, 100),
          tailoringMode,
          iterations: faker.number.int({ min: 1, max: 3 }),
          passedRules: goldenPassed,
          atsScore,
          jdScore,
          createdAt: randomPastDate(30),
        },
      });
      
      // Create tailoring prompt
      await prisma.tailoringPrompt.create({
        data: {
          resumeId: resume.id,
          tailoringMode,
          prompt: `Tailor this resume for ${jobDescription.substring(0, 50)}...`,
          attempt: 1,
          version,
          createdAt: randomPastDate(30),
        },
      });
      
      // Create tailoring progress
      await prisma.tailoringProgress.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          status: 'completed',
          progress: 100,
          currentAttempt: 3,
          maxAttempts: 3,
          createdAt: randomPastDate(30),
          updatedAt: randomPastDate(15),
        },
      });
      
      // Create tailoring attempt
      await prisma.tailoringAttempt.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          attemptNumber: 1,
          atsScore,
          jdScore,
          goldenPassed,
          feedback: 'Improve keyword matching and add more quantifiable achievements.',
          suggestions: 'Consider adding more technical skills relevant to the job description.',
          atsFeedback: 'Good keyword matching but could use more industry-specific terminology.',
          jdFeedback: 'Well-aligned with job requirements but could emphasize leadership more.',
          createdAt: randomPastDate(30),
        },
      });
      
      // Create resume feedback
      await prisma.resumeFeedback.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          feedbackType: 'ai_feedback',
          feedbackPoints: [
            'Add more quantifiable achievements',
            'Improve keyword matching',
            'Enhance technical skills section'
          ],
          sourceVersion: version > 1 ? version - 1 : null,
          createdAt: randomPastDate(30),
        },
      });
      
      // Create manual edit if applicable
      if (wasManuallyEdited) {
        await prisma.manualEdit.create({
          data: {
            userId: user.id,
            resumeId: resume.id,
            editedText: resumeText + '\n\n[MANUALLY EDITED]',
            createdAt: randomPastDate(15),
          },
        });
        
        // Create manual scoring if applicable
        await prisma.manualScoring.create({
          data: {
            userId: user.id,
            resumeId: resume.id,
            atsScore: randomScore(),
            jdScore: randomScore(),
            atsFeedback: 'Improved keyword matching after manual edits.',
            jdFeedback: 'Better alignment with job requirements after edits.',
            createdAt: randomPastDate(15),
          },
        });
      }
      
      // Create JD intelligence
      await prisma.jobDescriptionIntelligence.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          role: jobDescription.split('\n')[0].split(' at ')[0],
          seniority: randomItem(['Entry-level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager']),
          keywords: [
            faker.hacker.noun(),
            faker.hacker.verb(),
            faker.hacker.adjective(),
            faker.hacker.noun(),
            faker.hacker.verb(),
          ],
          responsibilities: [
            faker.company.buzzPhrase(),
            faker.company.buzzPhrase(),
            faker.company.buzzPhrase(),
          ],
          qualifications: [
            `${faker.number.int({ min: 1, max: 10 })}+ years of experience in ${faker.person.jobArea()}`,
            `Proficiency in ${faker.hacker.noun()}`,
            `Bachelor's degree in ${faker.person.jobArea()}`,
          ],
          categories: generateJDCategories(),
          createdAt: randomPastDate(30),
        },
      });
      
      // Create resume export
      await prisma.resumeExport.create({
        data: {
          userId: user.id,
          resumeId: resume.id,
          templateId: randomItem(templateIds),
          format: randomItem(exportFormats),
          createdAt: randomPastDate(15),
        },
      });
      
      // Create cover letters for this resume
      for (let j = 0; j < COVER_LETTERS_PER_RESUME; j++) {
        const tone = randomItem(tones);
        
        await prisma.coverLetter.create({
          data: {
            userId: user.id,
            resumeId: resume.id,
            jobDescription,
            content: `Dear Hiring Manager,

I am writing to express my interest in the ${jobDescription.split('\n')[0]} position. With my background in ${faker.person.jobArea()}, I believe I am well-qualified for this role.

${faker.lorem.paragraph(3)}

${faker.lorem.paragraph(2)}

Thank you for your consideration. I look forward to the opportunity to discuss how my skills and experience align with your needs.

Sincerely,
${faker.person.fullName()}`,
            tone,
            atsScore: randomScore(),
            jdScore: randomScore(),
            version: faker.number.int({ min: 1, max: 2 }),
            createdAt: randomPastDate(25),
            updatedAt: randomPastDate(10),
          },
        });
      }
    }
    
    // Create LinkedIn optimizations for this user
    for (let i = 0; i < LINKEDIN_OPTIMIZATIONS_PER_USER; i++) {
      const jobDescription = generateJobDescription();
      const tone = randomItem(tones);
      const originalAbout = faker.lorem.paragraphs(2);
      
      await prisma.linkedInOptimization.create({
        data: {
          userId: user.id,
          jobDescription,
          originalAbout,
          optimizedAbout: `${faker.lorem.paragraph(1)}

${faker.lorem.paragraph(2)}

${faker.lorem.paragraph(1)}`,
          tone,
          createdAt: randomPastDate(20),
          updatedAt: randomPastDate(5),
        },
      });
    }
    
    // Create interview sessions for this user
    for (let i = 0; i < INTERVIEW_SESSIONS_PER_USER; i++) {
      const jobDescription = generateJobDescription();
      const selectedTypes = [
        randomItem(interviewTypes),
        randomItem(interviewTypes),
      ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
      
      // Generate questions
      const questions = [];
      for (let j = 0; j < 6; j++) {
        questions.push({
          id: j + 1,
          type: randomItem(selectedTypes),
          question: faker.lorem.sentence() + '?',
        });
      }
      
      // Generate answers (for some questions)
      const answers = [];
      for (let j = 0; j < 4; j++) {
        answers.push({
          questionId: j + 1,
          answer: faker.lorem.paragraph(2),
        });
      }
      
      // Generate needs review
      const needsReview = [2, 5]; // Questions that need review
      
      await prisma.interviewSession.create({
        data: {
          userId: user.id,
          jobDescription,
          selectedTypes,
          questions,
          answers,
          needsReview,
          createdAt: randomPastDate(15),
          updatedAt: randomPastDate(3),
        },
      });
    }
  }
  
  console.log('✅ Database seeding completed successfully!');
}

// Execute the seeding function
seed()
  .catch((error) => {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma client connection
    await prisma.$disconnect();
  });
