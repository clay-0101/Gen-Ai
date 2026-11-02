import fs from "fs/promises"
import { HOME_DIR, CONFIG_DIR } from "./constant.js"
import path from "path"


/*
Return the settings file content (create if doesn't exists)
*/


export async function getSettingsFile() {
    
    try {

        await fs.access(CONFIG_DIR)

    } catch (error) {

        await fs.mkdir(CONFIG_DIR , {recursive : true})
    }


    
    let settingsFilePath = path.join(CONFIG_DIR, "settings.json")

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