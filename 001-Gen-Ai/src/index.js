import "dotenv/config"
import { ChatGroq } from "@langchain/groq"
import rl from "readline/promises"

let readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout
})








let model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY
})






while (true) {
    let userInput = await readline.question("How can i help you : ")

    const stream = await model.stream([
        {
            role : 'user',
            content : userInput
        }
    ])

    for await (let chunk of stream){
        
        process.stdout.write(chunk.content)
    }

    process.stdout.write("\n")
}