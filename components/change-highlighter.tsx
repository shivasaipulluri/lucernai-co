import { diffLines } from "diff"

interface ChangeHighlighterProps {
  originalText: string
  modifiedText: string
}

interface DiffPart {
  added?: boolean
  removed?: boolean
  value: string
}

export function ChangeHighlighter({ originalText, modifiedText }: ChangeHighlighterProps) {
  const diff = diffLines(originalText, modifiedText)

  return (
    <>
      {diff.map((part: DiffPart, index: number) => {
        const color = part.added ? "text-green-500 bg-green-100" : part.removed ? "text-red-500 bg-red-100" : ""
        const prefix = part.added ? "+" : part.removed ? "-" : " "

        // Split the line into words and apply the color to each word
        const words = part.value.split(" ")
        return (
          <div key={index} className="flex">
            {words.map((word, wordIndex) => (
              <span key={`${index}-${wordIndex}`} className={`${color} inline-block`}>
                {word + " "}
              </span>
            ))}
          </div>
        )
      })}
    </>
  )
}
