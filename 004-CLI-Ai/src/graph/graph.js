import {StateGraph, START, END} from "@langchain/langgraph"
import * as z from "zod"
import LLMNode from "./node.js"
import readline from "../utils/readFile.js"
import {HumanMessage} from "langchain"


let stateFormat = z.object({
    messages : z.array(z.any())
})


const graph = new StateGraph(stateFormat)
    .addNode("LLMNode", LLMNode)
    .addEdge(START, "LLMNode")
    .addEdge("LLMNode", END)
    .compile()


export default async function initGraph (){
    let memoryMessages = []
    while(true){

        let userInput = await readline.question("[User] : ")
        
        memoryMessages.push(new HumanMessage(userInput))

        let response = await graph.invoke({
            messages : memoryMessages
        })

        memoryMessages = response.messages
        // console.log("[AI] : ",response.messages)
    }
}