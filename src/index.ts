//import {regenerateNeverEndingSession} from './classes/regenerateNeverEndingSession';
//import {getMongoDb} from './mongo';
import {processRecord} from './tutoraUsage/tutoraUsage';

async function StartConn(){
    await processRecord();
}
StartConn().then(()=>{
    console.log("DB Started ...");
}).catch(e=>{
    console.log("Error ::: => " + e);
})