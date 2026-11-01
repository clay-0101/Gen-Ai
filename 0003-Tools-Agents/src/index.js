import 'dotenv/config'
import { ChatGroq } from "@langchain/groq"
import rl from "readline/promises"
import { tool , createAgent } from "langchain"
import * as z from "zod"

let idCards = []

const createIdCard = tool(
    async function ({  name, age, gender }) {
        let id = Date.now()
        console.log("Genrating id card")

        idCards.push({
            id,
            name,
            age,
            gender
        })

        return 'Id Card Genrated'

    },
    {
        name: "createId",
        description: "create Student id card with name age gender and id",
        schema: z.object({
            id: z.number(),
            name: z.string(),
            age: z.number(),
            gender: z.string()
        })
    }
)

const getAllIdCards = tool(
    async function ({ }) {
        console.log("Fetching all id Cards...")

        return idCards
    },
    {
        name: "getIdCard",
        description: "List all the id cards",
        schema: z.object({})
    }
)

const getSingleIdCard = tool(
    async function ({ id }) {
        console.log("Fetching details..")

        return idCards.find((ic) => ic.id == id)
    },
    {
        name: "getSingleIdCard",
        description: "Fetch single id card using unique id that is given by the user",
        schema: z.object({
            id : z.number()
        })
    }
)

let readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout
})

let model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY
})

let agent = createAgent({
    model ,
    tools : [createIdCard, getAllIdCards, getSingleIdCard]
})

while(true){

    let userInput = await readline.question("How can i help you today : ")

    let stream = await agent.stream({
        messages : [
            {
                role : "user",
                content : userInput
            }
        ]
    }, {streamMode : "messages"})

    for await (let [chunk] of stream){
        process.stdout.write(chunk.content)
    }
    process.stdout.write("\n\n\n")
}