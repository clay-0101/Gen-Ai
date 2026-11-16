import "dotenv/config"
import {PDFParse} from "pdf-parse"
import fs from "fs/promises"
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import {CohereEmbeddings} from "@langchain/cohere"
import { Pinecone } from '@pinecone-database/pinecone';

// _____________________ Parse Text From the PDF_________________________
const parser = new PDFParse({
    data : await fs.readFile("./story.pdf")
})

// ____________________Get Only Text From the PDF_______________________
let text = (await parser.getText({pageJoiner : ""})).text


//_____________________ Split the Whole text in small chunks using Recursive ___________________________
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize : 500,
    chunkOverlap : 100
})

const chunks = await textSplitter.splitText(text)

//______________________Convert the chunks into vectors ____________________________
const embeddings = new CohereEmbeddings({
    model: "embed-v5.0-fast",
    apiKey : process.env.COHERE_API_KEY
})

const vectors = await embeddings.embedDocuments(chunks)

// ________________________ Then Save it to vector database (PINECONE)_______________________
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