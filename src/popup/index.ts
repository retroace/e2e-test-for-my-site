import { DATABASE_KEYS } from "../constants"
import { getItem } from "../Datasource"

(async () => {
    const tab = await getItem(DATABASE_KEYS.RECORDING)
    document.getElementById('recordingstate').innerHTML = String(tab);
})()