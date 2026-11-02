import fs from "fs/promises"
import { HOME_DIR, CONFIG_DIR } from "./constant.js"
import path from "path"
import axios from "axios"


/*
Return the settings file content (create if doesn't exists)
*/


export async function getSettingsFile() {
    
    try {

        await fs.access(CONFIG_DIR)

    } catch (error) {

        await fs.mkdir(CONFIG_DIR , {recursive : true})
    }


    
    let settingsFilePath = path.join(CONFIG_DIR, "setting.json")

    try {
        await fs.access(settingsFilePath)
        let content = await fs.readFile(settingsFilePath, 'utf-8')
        return JSON.parse(content)

    } catch (error) {
        await fs.writeFile(settingsFilePath , JSON.stringify({}))
        return {}
    }
}

export async function saveApiKey(apiKey){
    let settingsFilePath = path.join(CONFIG_DIR , "setting.json")

    const settingsFileContent = await getSettingsFile()

    fs.writeFile(settingsFilePath, JSON.stringify({
        ...settingsFileContent,
        apiKey
    }))
}

export async function getApiKey(){

    let setting = await getSettingsFile()
    
    const apiKey = setting.apiKey || null

    if(!apiKey){
        return {
            errro : "Api Key not found in setting file"
        }
    }

    try {
        let response = await axios.get("https://api.groq.com/openai/v1/models", {
            headers : {
                Authorization : `Bearer ${apiKey}`
            }
        })

        return {
            apiKey
        }
    } catch (error) {
        return {
            error : "Invalid Api key"
        }
    }
}