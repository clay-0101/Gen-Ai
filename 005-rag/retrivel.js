import { ChatCohere, CohereEmbeddings } from "@langchain/cohere"
import "dotenv/config"
import { Pinecone } from "@pinecone-database/pinecone"
import {HumanMessage , ToolMessage, AIMessage} from "langchain"


const userInput = "Tell me about Aarv's internship"

const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-v5.0-fast",
})

const vector = await embeddings.embedQuery(userInput)


const pc = new Pinecone({ apiKey: process.env.PINECODE_API_KEY })

const index = pc.index({
    name: "cohort-rag",
    host: "https://cohort-rag-hwiq71i.svc.aped-4627-b74a.pinecone.io"
})

const results = await index.documents.search({
    topK : 5,
    scoreBy : [
        {
            type : "dense_vector",
            field : [ 'embedding' ],
            values : vector
        }
    ],
    includeFields :  [ 'content' ]
})



let model = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: process.env.COHERE_API_KEY
})



let messages = []

messages.push(new HumanMessage(userInput))

messages.push(new ToolMessage({
    content : JSON.stringify(results)
}))

const aiResponse = await model.stream(messages)

for await(const chunk of aiResponse){
    process.stdout.write(chunk.text)
}

