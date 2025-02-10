import { deepseek } from '@ai-sdk/deepseek'
import { groq } from '@ai-sdk/groq'
import Exa from 'exa-js'
import {
    convertToCoreMessages,
    streamText,
    experimental_wrapLanguageModel as wrapLanguageModel,
    extractReasoningMiddleware,
    LanguageModelV1,
} from 'ai'

const exa = new Exa(process.env.EXA_API_KEY as string)

const enhancedModel = wrapLanguageModel({
    model: groq('deepseek-r1-distill-llama-70b'),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
});

export async function POST(req: Request) {
    const { messages, auraUser, auraSubject, model } = await req.json()

    const userPosts = await exa.searchAndContents(
        `${auraUser}`, {
        type: "auto",
        use_autoprompt: true,
        numResults: 5,
        text: true,
        includeDomains: ['twitter.com', 'x.com'],
    })

    const subjectPosts = await exa.searchAndContents(
        `${auraSubject}`, {
        type: "auto",
        use_autoprompt: true,
        numResults: 5,
        text: true,
        includeDomains: ['twitter.com', 'x.com'],
    })

    console.log("User posts before", userPosts)
    console.log("Subject posts before", subjectPosts)

    const system = `You're a Gen-Z aura analyzer using social media presence of two parties.
    
    Analyze the vibes between @${auraUser} and @${auraSubject} based on their information/posts.

    Create a detailed comparison table. For each attribute, provide a short label followed by " - " and then a brief explanation.

    Do not give any other information other than the table.

    Format as a markdown table with these exact attributes:
    | ATTRIBUTES | @${auraUser} | @${auraSubject} |
    |------------|--------------|-----------------|
    | Energy Level | [Label] - [Explanation] | [Label] - [Explanation] |
    | Engagement Style | [Label] - [Explanation] | [Label] - [Explanation] |
    | Content Quality | [Label] - [Explanation] | [Label] - [Explanation] |
    | Interaction Level | [Label] - [Explanation] | [Label] - [Explanation] |
    | Community Vibes | [Label] - [Explanation] | [Label] - [Explanation] |
    | Influence Level | [Label] - [Explanation] | [Label] - [Explanation] |
    | Authenticity | [Label] - [Explanation] | [Label] - [Explanation] |
    | Consistency | [Label] - [Explanation] | [Label] - [Explanation] |
    | Adaptability | [Label] - [Explanation] | [Label] - [Explanation] |

    Example format for each cell:
    "High - Frequently posts and engages with community"
    "Collaborative - Actively seeks feedback and interaction"

    Posts by @${auraUser}:
    ${userPosts.results.map(p => `${p.text}`).join('\n')}

    Posts by @${auraSubject}:
    ${subjectPosts.results.map(p => `${p.text}`).join('\n')}`

    console.log("System: ", system)

    let selectedModel: LanguageModelV1;

    const provider = model.split(":")[0]

    if (provider === "deepseek") {
        selectedModel = deepseek(model.split(":")[1])
    } else {
        selectedModel = enhancedModel
    }

    const response = streamText({
        model: selectedModel,
        system,
        messages: convertToCoreMessages(messages),
        temperature: 0.6,
        onChunk(event) {
            if (event.chunk.type === "reasoning") {
                console.log(event.chunk.textDelta);
            }
        },
        onStepFinish(event) {
            if (event.warnings) {
                console.log('Warnings: ', event.warnings);
            }
        },
        onFinish(event) {
            console.log('Fin reason: ', event.finishReason);
            console.log('Steps ', event.steps);
            console.log('Messages: ', event.response.messages[event.response.messages.length - 1].content);
        },
    })

    return response.toDataStreamResponse({
        sendReasoning: true,
    })
}