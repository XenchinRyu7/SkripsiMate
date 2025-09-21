interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export interface ThesisStepData {
  title: string
  description: string
  order: number
  estimatedTime?: string
  priority: 'low' | 'medium' | 'high'
  dependencies?: string[]
  type: 'chapter' | 'substep'
  parentId?: string
  level: number
  substeps?: ThesisStepData[]
}

export async function generateThesisSteps(
  prompt: string,
  apiKey: string,
  model: string = 'gemini-1.5-flash'
): Promise<ThesisStepData[]> {
  if (!apiKey) {
    throw new Error('Gemini API key is required')
  }

  const systemPrompt = `You are a thesis planning assistant. Based on the user's prompt, generate a comprehensive hierarchical thesis structure in JSON format. 

Create a structured flow with main chapters (8-10 chapters) and detailed substeps for each chapter. Each item should have:
- title: A clear, concise title
- description: A detailed description of what needs to be done
- order: The sequential order (starting from 1)
- estimatedTime: An estimate like "2-3 weeks" or "1 month"
- priority: "low", "medium", or "high"
- dependencies: Array of step titles this step depends on (optional)
- type: "chapter" for main chapters, "substep" for detailed tasks
- parentId: null for chapters, chapter title for substeps
- level: 1 for chapters, 2 for substeps
- substeps: Array of detailed substeps (only for chapters)

Structure should be like (generate 6-8 chapters maximum):
1. Chapter 1: Introduction (with 3-4 substeps)
2. Chapter 2: Literature Review (with 3-4 substeps)
3. Chapter 3: Methodology (with 3-4 substeps)
4. Chapter 4: Data Collection (with 2-3 substeps)
5. Chapter 5: Analysis (with 3-4 substeps)
6. Chapter 6: Results (with 2-3 substeps)
7. Chapter 7: Discussion (with 2-3 substeps)
8. Chapter 8: Conclusion (with 2-3 substeps)

IMPORTANT: Return ONLY a valid JSON array of objects. Do not include any markdown formatting, code blocks, or additional text. The response must be valid JSON that can be parsed directly. Make sure all strings are properly quoted and there are no trailing commas.`

  const requestBody = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\nUser prompt: ${prompt}`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH", 
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates[0]?.content?.parts[0]?.text

    if (!text) {
      throw new Error('No response from Gemini API')
    }

    // Try to parse the JSON response
    try {
      // Clean the response text first
      let cleanText = text.trim()
      
      // Remove any markdown code blocks if present
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Try to find JSON array in the response
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const jsonString = jsonMatch[0]
        
        // Check if JSON is complete (ends with ])
        if (!jsonString.trim().endsWith(']')) {
          console.warn('JSON appears to be truncated, attempting to fix...')
          // Try to close the JSON array
          let fixedJson = jsonString
          if (!fixedJson.trim().endsWith('}')) {
            // Find the last complete object and close it
            const lastCompleteObject = fixedJson.lastIndexOf('}')
            if (lastCompleteObject > 0) {
              fixedJson = fixedJson.substring(0, lastCompleteObject + 1) + ']'
            } else {
              throw new Error('JSON is too truncated to fix')
            }
          } else {
            fixedJson = fixedJson + ']'
          }
          
          try {
            const steps = JSON.parse(fixedJson)
            if (Array.isArray(steps)) {
              console.warn('Successfully fixed truncated JSON')
              return steps
            }
          } catch (fixError) {
            console.error('Failed to fix truncated JSON:', fixError)
          }
        }
        
        const steps = JSON.parse(jsonString)
        if (!Array.isArray(steps)) {
          throw new Error('Response is not an array')
        }
        return steps
      }
      
      // If no array found, try parsing the whole text
      const steps = JSON.parse(cleanText)
      if (!Array.isArray(steps)) {
        throw new Error('Response is not an array')
      }
      return steps
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Raw response:', text)
      
      // Try to fix common JSON issues
      try {
        let fixedText = text
          .replace(/,\s*}/g, '}') // Remove trailing commas before }
          .replace(/,\s*]/g, ']') // Remove trailing commas before ]
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes around unquoted keys
          .replace(/:\s*([^",{\[\s][^",}\]\]]*?)([,}\]])/g, ': "$1"$2') // Add quotes around unquoted string values
        
        const jsonMatch = fixedText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const steps = JSON.parse(jsonMatch[0])
          if (Array.isArray(steps)) {
            return steps
          }
        }
      } catch (fixError) {
        console.error('JSON Fix Error:', fixError)
      }
      
      // If all parsing attempts fail, try to extract partial data
      console.warn('Failed to parse AI response, attempting to extract partial data...')
      try {
        const partialData = extractPartialData(text)
        if (partialData.length > 0) {
          console.warn(`Extracted ${partialData.length} chapters from partial response`)
          return partialData
        }
      } catch (extractError) {
        console.error('Failed to extract partial data:', extractError)
      }
      
      // If all attempts fail, return a fallback structure
      console.warn('All parsing attempts failed, using fallback structure')
      return generateFallbackStructure(prompt)
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}

// Extract partial data from truncated response
function extractPartialData(text: string): ThesisStepData[] {
  const chapters: ThesisStepData[] = []
  
  // Try to find individual chapter objects
  const chapterMatches = text.match(/\{[^{}]*"type":\s*"chapter"[^{}]*\}/g)
  
  if (chapterMatches) {
    chapterMatches.forEach((match, index) => {
      try {
        // Try to parse individual chapter
        const chapter = JSON.parse(match)
        if (chapter.type === 'chapter') {
          chapters.push({
            ...chapter,
            order: index + 1,
            substeps: [] // We'll skip substeps for partial data
          })
        }
      } catch (parseError) {
        console.warn(`Failed to parse chapter ${index + 1}:`, parseError)
      }
    })
  }
  
  return chapters
}

// Fallback structure when AI response cannot be parsed
function generateFallbackStructure(_prompt: string): ThesisStepData[] {
  return [
    {
      title: "Chapter 1: Introduction",
      description: "Introduction and background of the research",
      order: 1,
      estimatedTime: "2-3 weeks",
      priority: "high",
      type: "chapter",
      level: 1,
      substeps: [
        {
          title: "Define research problem",
          description: "Clearly define the research problem and objectives",
          order: 1,
          estimatedTime: "1 week",
          priority: "high",
          type: "substep",
          level: 2
        },
        {
          title: "State research objectives",
          description: "Formulate specific research objectives and questions",
          order: 2,
          estimatedTime: "1 week",
          priority: "high",
          type: "substep",
          level: 2
        }
      ]
    },
    {
      title: "Chapter 2: Literature Review",
      description: "Review of existing literature and research",
      order: 2,
      estimatedTime: "3-4 weeks",
      priority: "high",
      type: "chapter",
      level: 1,
      substeps: [
        {
          title: "Search relevant literature",
          description: "Conduct comprehensive literature search",
          order: 1,
          estimatedTime: "1-2 weeks",
          priority: "high",
          type: "substep",
          level: 2
        },
        {
          title: "Analyze and synthesize",
          description: "Analyze findings and synthesize key themes",
          order: 2,
          estimatedTime: "2 weeks",
          priority: "medium",
          type: "substep",
          level: 2
        }
      ]
    },
    {
      title: "Chapter 3: Methodology",
      description: "Research methodology and approach",
      order: 3,
      estimatedTime: "2-3 weeks",
      priority: "high",
      type: "chapter",
      level: 1,
      substeps: [
        {
          title: "Design research approach",
          description: "Design the overall research approach and strategy",
          order: 1,
          estimatedTime: "1 week",
          priority: "high",
          type: "substep",
          level: 2
        },
        {
          title: "Select methods and tools",
          description: "Select appropriate research methods and tools",
          order: 2,
          estimatedTime: "1-2 weeks",
          priority: "medium",
          type: "substep",
          level: 2
        }
      ]
    }
  ]
}
