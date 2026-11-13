import { ChatGroq } from "@langchain/groq"
import { getApiKey } from "../../utils/file.utils.js"
import { AIMessage } from "langchain"
import { upsertFileTool } from "../tools/files.tool.js"

export default async function LLMNode(state, config) {
    // console.log(config.context)

    let model = new ChatGroq({
        model: "openai/gpt-oss-120b",
        apiKey : (await getApiKey()).apiKey
    })

    let modelWithTools = model.bindTools([upsertFileTool])

    let stream = await modelWithTools.stream(state.messages)
    
    process.stdout.write("[AI] : ")

    let aiMessages = null

    for await (let chunk of stream){
        process.stdout.write(chunk.text)
        
        if(!aiMessages) aiMessages = chunk
        else aiMessages = aiMessages.concat(chunk)
    }

    process.stdout.write("\n")
    
    return {
        messages : [
            ...state.messages,
            aiMessages
        ]
    }
}