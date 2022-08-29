import { RRule } from 'rrule';
import dayjs from 'dayjs';
import {
  createSession,
  fetchAllActiveClassDef,
  lastSessionInstance,
  updateDateInClassDef,
} from '../common/dbUtil';
import {
  getRecurrenceValue,
  getRuleParams,
  getWeekdayTimeMap
} from '../common/dateActionUtil';
import {
  updateParticipants,
  getSessionInstance
} from '../common/classUtil';
 
function checkDateGreaterOrEqualToday(date: any){
    let currentDateTime = new Date();
    let currentDateStr = dayjs(currentDateTime).format("YYYY-MM-DDTHH:mm:ssZ");
    let yesterday = dayjs().add(-1,'day').format('YYYY-MM-DD');
    date = dayjs(date.split('T')[0]).format('YYYY-MM-DD');
    if(dayjs(yesterday).isAfter(date)){
      return true;
    }
    return true ;
}

export async function regenerateNeverEndingSession(){
  const query = {type:'Definition',status:'Available','recurrence.endsByType':'Never'};
  const classDef: any  = await fetchAllActiveClassDef(query);
  let lastSessionInstanceEndTime:any;
    classDef.forEach(async(sessionDef:any) => {

      // const lastInstances  =  await lastSessionInstance(
      //   sessionDef._id
      // ).then((lastSessionInstancevalue:any)=>{
      //   let result = JSON.parse(lastSessionInstancevalue);
      //   lastSessionInstanceEndTime = result.endTime;  
      //   console.log("last instance endtime :: " + lastSessionInstanceEndTime);
      // }).catch((e:any)=>{
      //   console.log("getting last Session Instances Error" + e);
      // })
      // console.log("LAST NSTANCE ID :::: => " + lastSessionInstanceEndTime );
  
      const lastInstances: any   =  await lastSessionInstance(sessionDef._id );
      const resultJsonParser = JSON.parse(lastInstances);
      console.log("RESULT JSON PARSER ::::: => " + resultJsonParser.endTime);
      if(checkDateGreaterOrEqualToday(resultJsonParser.endTime.toString())){
        const getTommorrowDate  = dayjs().add(1,'day').format("YYYY-MM-DD");
        const getNextNinetyDays  = dayjs().add(91,'day').format('YYYY-MM-DD'); 
        let ruleObj = getRecurrenceValue(sessionDef.recurrence);
        if(!ruleObj.until) return ;
        let ruleParam = getRuleParams(ruleObj);      
        let dates: any = [];
        if (Object.keys(ruleParam).length === 0) {
        dates.push(
          getTommorrowDate +
            'T00:00:00.000Z' +
              dayjs().format('Z')
          );
        } else {
          ruleParam.dtstart = new Date(getTommorrowDate);
          ruleParam.until = new Date(getNextNinetyDays);
          const rule = new RRule(ruleParam);
          dates = rule.all();
        }

        let weekdayTimeMap = getWeekdayTimeMap(dates, sessionDef.recurrence);
          for (let i = 0; i < dates.length; i++) {
          const result:any =  await createSession(
            getSessionInstance(sessionDef, dates[i], weekdayTimeMap)
          );
         
          console.log("inserted  ID :::: => " + result.insertedId );
          await updateParticipants(
            result.insertedId,
            sessionDef.participants,
            dates[i]
          );
        }
        await updateDateInClassDef(
          sessionDef._id,
          getNextNinetyDays.toString()
        )

      } 
  })
}

// exports.handler = async (event: any )=>{
//   if(event){
//     await regenerateNeverEndingSession();
//   }
// }