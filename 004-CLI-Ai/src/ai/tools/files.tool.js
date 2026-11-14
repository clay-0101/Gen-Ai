import {tool} from "langchain"
import * as z from "zod"
import fs from "fs/promises"


export const upsertFileTool = tool(

    async function ({ files }){
        await Promise.all(files.map(async (file) => {
            console.log(file.path)
            return await fs.writeFile(file.path , file.content)
        }))

        return "File Create Successfully.."
    },

    {
        name : "upsertFileTool",
        description : "Create/Update multiple files at once (create one if not exists",
        schema : z.object({
            files : z.array(z.object({
                path : z.string().describe("Absolute path of the file to be created/update"),
                content : z.string().describe("Content of the file to be created/update")
            }))
        })
    }
    
)


export const readFileTool = tool(
    async function({files}) {
        const results = await Promise.all(files.map(async file =>{
            const content = await fs.readFile(file.path , "utf-8")
            return {path : file.path , content}
        }))
        return JSON.stringify(results)
    },
    {
        name : "readFileTool",
        description : "Read the content of multiple fiels at once",
        schema : z.object({
            files : z.array(z.object({
                path : z.string().describe("absolute path of the file to be read")
            }))
        })
    }
)

export const listFiles = tool(
    async function ({folder}) {
        const result = []
        async function traverse(currentFolder) {

            const entries = await fs.readdir(currentFolder , {withFileTypes : true})

            for(const entry of entries){
                const fullPath = `${currentFolder}/${entry.name}`

                if(entry.isDirectory()){
                    if(entry.name === "node_modules") continue
                    await traverse(fullPath)
                }
                else{
                    result.push(fullPath)
                }
            }
        
        }
        await traverse(folder)
        return JSON.stringify(result)
    },
    {
        name : "listFiles",
        description  : "List all the folder (recursively) and files in the current folder (ignore folders like node_modules",
        schema : z.object({
            folder : z.string().describe("absolute path of the folder to list")
        })

    }
)