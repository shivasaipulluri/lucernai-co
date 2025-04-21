export interface ResumeTemplate {
  id: string
  name: string
  preview: string
  isPremium: boolean
  fontFamily: string
  layout: string
  accentColor: string
  category?: string
  description: string // Added description property
}

// Define all available resume templates
export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic-serif",
    name: "Classic Serif",
    preview: "/templates/previews/classic-serif.png",
    isPremium: false,
    fontFamily: "Playfair Display",
    layout: "classic",
    accentColor: "#0F172A",
    category: "traditional",
    description: "A timeless template with a serif font for a professional look.", // Added description
  },
  {
    id: "modern-sans",
    name: "Modern Sans",
    preview: "/templates/previews/modern-sans.png",
    isPremium: false,
    fontFamily: "Inter",
    layout: "modern",
    accentColor: "#3B82F6",
    category: "modern",
    description: "A clean and modern template with a sans-serif font.", // Added description
  },
  {
    id: "executive",
    name: "Executive",
    preview: "/templates/previews/executive.png",
    isPremium: true,
    fontFamily: "Georgia",
    layout: "professional",
    accentColor: "#1E293B",
    category: "professional",
    description: "A sophisticated template designed for executive-level professionals.", // Added description
  },
  {
    id: "minimalist",
    name: "Minimalist",
    preview: "/templates/previews/minimalist.png",
    isPremium: false,
    fontFamily: "Inter",
    layout: "minimal",
    accentColor: "#94A3B8",
    category: "minimal",
    description: "A simple and clean template with a focus on readability.", // Added description
  },
  {
    id: "two-column",
    name: "Two Column",
    preview: "/templates/previews/two-column.png",
    isPremium: true,
    fontFamily: "Inter",
    layout: "two-column",
    accentColor: "#6366F1",
    category: "creative",
    description: "A creative template with a two-column layout for a modern look.", // Added description
  },
  {
    id: "creative",
    name: "Creative",
    preview: "/templates/previews/creative.png",
    isPremium: true,
    fontFamily: "Montserrat",
    layout: "creative",
    accentColor: "#EC4899",
    category: "creative",
    description: "An eye-catching template with a unique design for creative roles.", // Added description
  },
]

// Get template by ID
export function getTemplateById(id: string): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find((template) => template.id === id)
}

// Get default template
export function getDefaultTemplate(): ResumeTemplate {
  return RESUME_TEMPLATES[0] // Classic Serif is the default
}

// Get templates by category
export function getTemplatesByCategory(category: string): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((template) => template.category === category)
}

// Get all template categories
export function getAllTemplateCategories(): string[] {
  const categories = new Set<string>()
  RESUME_TEMPLATES.forEach((template) => {
    if (template.category) {
      categories.add(template.category)
    }
  })
  return Array.from(categories)
}
