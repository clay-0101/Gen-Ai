import { getSettingsFile, saveApiKey } from "./utils/file.utils.js";
import readline from "./utils/readFile.js";

async function main() {
    let setting = await getSettingsFile()
    
    if(!setting.apikey){
        let apiKey = await readline.question("Enter Api Key : ")
        await saveApiKey(apiKey)
    }
}

export default main