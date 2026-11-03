import { ChatGroq } from "@langchain/groq"
import { getApiKey } from "../utils/file.utils.js"
import { AIMessage } from "langchain"

export default async function LLMNode(state) {

    let model = new ChatGroq({
        model: "openai/gpt-oss-120b",
        apiKey : (await getApiKey()).apiKey
    })

    let stream = await model.stream(state.messages)
    
    process.stdout.write("[AI] : ")

    let aiMessages = ""

    for await (let chunk of stream){
        process.stdout.write(chunk.text)
        aiMessages += chunk.text
    }

    process.stdout.write("\n")
    
    return {
        messages : [
            ...state.messages,
            new AIMessage(aiMessages)
        ]
    }
}