import "dotenv/config"
import {PDFParse} from "pdf-parse"
import fs from "fs/promises"
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import {CohereEmbeddings} from "@langchain/cohere"
import { Pinecone } from '@pinecone-database/pinecone';


const parser = new PDFParse({
    data : await fs.readFile("./story.pdf")
})

let text = (await parser.getText({pageJoiner : ""})).text


const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize : 500,
    chunkOverlap : 100
})

const chunks = await textSplitter.splitText(text)

const embeddings = new CohereEmbeddings({
    model: "embed-v5.0-fast",
    apiKey : process.env.COHERE_API_KEY
})

const vectors = await embeddings.embedDocuments(chunks)

const pc = new Pinecone({apiKey : process.env.PINECODE_API_KEY})

const index = pc.index({
    name : "cohort-rag",
    host : "https://cohort-rag-hwiq71i.svc.aped-4627-b74a.pinecone.io"
})

await index.documents.upsert({
    documents : vectors.map((vector ,index) => {
        return {
            _id : `chunk-${index}`,
            embedding : vector,
            content : chunks[ index ]
        }
    })
})