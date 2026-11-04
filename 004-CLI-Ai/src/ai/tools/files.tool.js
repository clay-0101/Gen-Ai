import {tool} from "langchain"
import * as z from "zod"
import fs from "fs/promises"


export const upsertFileTool = tool(

    async function ({ files }){
        await Promise.all(files.map(async (file) => {
            return await fs.writeFile(file.path , file.content)
        }))

        return "File Create Successfully.."
    },

    {
        name : "createFileTool",
        description : "Create/Update multiple files at once (create one if not exists",
        schema : z.object({
            files : z.array(z.object({
                path : z.string().describe("Absolute path of the file to be created/update"),
                content : z.string().describe("Content of the file to be created/update")
            }))
        })
    }
    
)