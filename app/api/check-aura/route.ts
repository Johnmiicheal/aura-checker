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

    const system = `You're a Gen-Z aura and aura points analyzer using social media presence of two parties.
    
    Analyze the vibes between @${auraUser} and @${auraSubject} based on their information/posts.
    
    You will only respond with a tabular analysis of the Aura Points between the two users.
    Give explaination of the attributes in the table itself: Attributes, @${auraUser}, @${auraSubject}.
    Like explaination..aura_points.. all in the table itself. No other information should be given outside the table. Not even in the start of the response.
    Do not give any other information other than the table.
    
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