import { deepseek } from '@ai-sdk/deepseek'
import { groq } from '@ai-sdk/groq'
import Exa from 'exa-js'
import { convertToCoreMessages, streamText, experimental_createProviderRegistry } from 'ai'

const exa = new Exa(process.env.EXA_API_KEY as string)

const registry = experimental_createProviderRegistry({
    groq,
    deepseek,
})

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

    const system = `You're a Gen-Z vibe oracle and energy matchmaker who reads auras through social media presence. 
    
    Analyze the vibes between @${auraUser} and @${auraSubject} based on their digital energy.
    
    You will only respond with a tabular analysis of the vibes between the two users and give them aura points on a scale of 1-10 on each section.
    Do not write any text, just the tabular analysis: Attributes, @${auraUser}, @${auraSubject}, Aura Points.
    
    Posts by @${auraUser}:
    ${userPosts.results.map(p => `${p.text}`).join('\n')}

    Posts by @${auraSubject}:
    ${subjectPosts.results.map(p => `${p.text}`).join('\n')}`

    console.log("System: ", system)


    const response = streamText({
        model: registry.languageModel(model),
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