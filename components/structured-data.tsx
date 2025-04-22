export function HomePageStructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Lucerna AI",
      url: "https://lucernai.co",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://lucernai.co/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
      description: "AI-powered resume tailoring to help you stand out in the job market",
      publisher: {
        "@type": "Organization",
        name: "Lucerna AI",
        logo: {
          "@type": "ImageObject",
          url: "https://lucernai.co/logo.png",
        },
      },
    }
  
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
  }
  
  export function ResumeServiceStructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "AI Resume Tailoring",
      provider: {
        "@type": "Organization",
        name: "Lucerna AI",
      },
      description: "AI-powered resume tailoring service that optimizes your resume for ATS systems and job descriptions",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      serviceType: "Resume Optimization",
    }
  
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
  }
  