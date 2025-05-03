import { v4 as uuidv4 } from "uuid"
import type { ResumeData } from "@/types/resume"

export const defaultResumeData: ResumeData = {
  id: uuidv4(),
  title: "My Professional Resume",
  sections: [
    {
      id: uuidv4(),
      type: "contact",
      title: "Contact Information",
      content: "John Doe\njohndoe@example.com\n(555) 123-4567\nNew York, NY\nLinkedIn: linkedin.com/in/johndoe",
      isVisible: true,
      order: 0,
    },
    {
      id: uuidv4(),
      type: "summary",
      title: "Professional Summary",
      content:
        "Experienced software engineer with 5+ years of experience in full-stack development. Proficient in JavaScript, React, Node.js, and cloud technologies. Passionate about creating efficient, scalable, and user-friendly applications.",
      isVisible: true,
      order: 1,
    },
    {
      id: uuidv4(),
      type: "experience",
      title: "Work Experience",
      content: [
        {
          id: uuidv4(),
          title: "Senior Software Engineer",
          organization: "Tech Solutions Inc.",
          location: "New York, NY",
          startDate: "2020-01",
          endDate: "",
          current: true,
          description: "Lead developer for enterprise web applications",
          bullets: [
            "Developed and maintained multiple React-based web applications",
            "Implemented CI/CD pipelines using GitHub Actions",
            "Reduced application load time by 40% through code optimization",
            "Mentored junior developers and conducted code reviews",
          ],
        },
        {
          id: uuidv4(),
          title: "Software Developer",
          organization: "Digital Innovations",
          location: "Boston, MA",
          startDate: "2017-06",
          endDate: "2019-12",
          current: false,
          description: "Full-stack developer for client projects",
          bullets: [
            "Built responsive web applications using React and Node.js",
            "Collaborated with design team to implement UI/UX improvements",
            "Integrated third-party APIs and services",
            "Participated in agile development processes",
          ],
        },
      ],
      isVisible: true,
      order: 2,
    },
    {
      id: uuidv4(),
      type: "education",
      title: "Education",
      content: [
        {
          id: uuidv4(),
          title: "Bachelor of Science in Computer Science",
          organization: "University of Technology",
          location: "Cambridge, MA",
          startDate: "2013-09",
          endDate: "2017-05",
          current: false,
          description: "GPA: 3.8/4.0",
          bullets: [
            "Dean's List: All semesters",
            "Senior Project: Developed a machine learning algorithm for predictive text",
            "Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development",
          ],
        },
      ],
      isVisible: true,
      order: 3,
    },
    {
      id: uuidv4(),
      type: "skills",
      title: "Skills",
      content:
        "Programming Languages: JavaScript, TypeScript, Python, Java\nFrontend: React, Redux, HTML5, CSS3, SASS\nBackend: Node.js, Express, Django\nDatabases: MongoDB, PostgreSQL, MySQL\nTools: Git, Docker, AWS, Azure\nMethodologies: Agile, Scrum, TDD",
      isVisible: true,
      order: 4,
    },
  ],
  style: {
    fontFamily: "Inter",
    fontSize: "medium",
    color: "blue",
    spacing: "normal",
    theme: "light",
  },
}
