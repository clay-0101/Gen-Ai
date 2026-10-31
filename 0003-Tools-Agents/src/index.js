import "dotenv/config"
import {ChatGroq} from "@langchain/groq"
import rl from "readline/promises"
import {tool,createAgent} from "langchain"
import * as z from "zod"

// Tools 
let events = []

const createEventTool = tool(
    async function ({date , title , description }) {
        console.log('Create an Event..')

        events.push({
            date,
            title,
            description
        })

        return "Event Created"
    },
    {
        name : "CreateEvent",
        description : "Create an event with the date , title and description",
        schema : z.object({
            date : z.string(),
            title : z.string(),
            description : z.string()
        })
    }
)

const getAllEventsTool = tool(
    async function ({ }){
        console.log("Retrive All Events")

        return events
    },
    {
        name : "getAllEvent",
        description : "Retrive all the evnets",
        schema : z.object({})
    }
)


let readline = rl.createInterface({
    input : process.stdin,
    output : process.stdout
})

let model = new ChatGroq({
    model : "openai/gpt-oss-120b",
    apiKey : process.env.GROQ_API_KEY
})

let agent =  createAgent({
    model ,
    tools : [createEventTool, getAllEventsTool]
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

     process.stdout.write("\n")
}