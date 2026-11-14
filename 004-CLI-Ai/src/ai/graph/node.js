import { ChatGroq } from "@langchain/groq"
import { getApiKey } from "../../utils/file.utils.js"
import { AIMessage } from "langchain"
import { upsertFileTool , readFileTool, listFiles} from "../tools/files.tool.js"
import * as fileTools from "../tools/files.tool.js"
import readline from "../../utils/readFile.js"
import { ToolMessage } from "langchain"

export default async function LLMNode(state, config) {
    // console.log(config.context)

    let model = new ChatGroq({
        model: "openai/gpt-oss-120b",
        apiKey : (await getApiKey()).apiKey
    })

    let modelWithTools = model.bindTools([upsertFileTool, readFileTool, listFiles])

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


export async function ToolNode(state , config) {

    let messages = state.messages
    const lastMessage = state.messages[ state.messages.length - 1 ]

    const toolCalls = lastMessage.tool_calls

    const toolResults = []

    for(const toolCall of toolCalls){

        switch(toolCall.name){
            
            case "upsertFileTool" : 
            process.stdout.write(`[Tool] : Updating/creating files ${JSON.stringify(toolCall.args.files.map(f => f.path).join(", "))}\n`)
            const userInput = await readline.question("Do you want to proceed ? (yes/no) : ")
             if(userInput.toLocaleLowerCase() !== "yes"){
                process.stdout.write("Aborting file update.\n")
                return new ToolMessage(
                    {
                        content : "User aborted the file update/create",
                        tool_call_id : toolCall.id
                    }
                )
             }
            const result = await fileTools.upsertFileTool.invoke(toolCall)
            toolResults.push(result)
            break;

            case "readFileTool" : 
            process.stdout.write(`[Tool] : Reading files ${JSON.stringify(toolCall.args.files.map(f => f.path).join(", "))}\n`)
            const readResult = await fileTools.upsertFileTool.invoke(toolCall)
            toolResults.push(readResult)
            break;

            case "listFiles" : 
            process.stdout.write(`[Tool] : Listing files \n`)
            const listResult = await fileTools.upsertFileTool.invoke(toolCall)
            toolResults.push(listResult)
            break;

            default : 
             process.stdout.write(`[Tool] : Unknow tool ${toolCall.name}\n`)
             break;
        }   
    }

    return {
        messages : [
            ...state.messages,
            ...toolResults
        ]
    }
    
}