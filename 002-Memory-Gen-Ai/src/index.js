import "dotenv/config"
import {ChatGroq} from "@langchain/groq"
import rl from "readline/promises"

let readline = rl.createInterface({
    input : process.stdin,
    output : process.stdout
})

let model = new ChatGroq({
    model : "openai/gpt-oss-120b",
    apiKey : process.env.GROQ_API_KEY
})

let messages = []

while(true){

    let userInput = await readline.question("How can i help you today! : ")

    messages.push({
        role : "user",
        content : userInput
    })

    let stream = await model.stream(messages)

    let aiMessages = ""
    for await (let chunk of stream){
        aiMessages += chunk.content
        process.stdout.write(chunk.content)
    }

    messages.push({
        role : "assistant",
        content : aiMessages
    })

    process.stdout.write("\n \n \n")
}