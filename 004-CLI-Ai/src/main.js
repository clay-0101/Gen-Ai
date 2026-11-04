import initGraph from "./ai/graph/graph.js";
import { getApiKey, getSettingsFile, saveApiKey } from "./utils/file.utils.js";
import readline from "./utils/readFile.js";

async function main() {
    let setting = await getSettingsFile()

    if (!setting.apiKey) {
        let apiKey = await readline.question("Enter Api Key : ")
        await saveApiKey(apiKey)
    }

    let response = await getApiKey()

    if (response.error) {
        console.log("Invalid api key enter again...")
        let apiKey = await readline.question("Enter Api Key : ")
        await saveApiKey(apiKey)
        return main()
    }

    const apiKey = response.apiKey
    
    await initGraph()

    readline.close()
}

export default main