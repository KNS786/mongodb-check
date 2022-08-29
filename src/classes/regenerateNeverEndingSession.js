"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateNeverEndingSession = void 0;
const rrule_1 = require("rrule");
const dayjs_1 = __importDefault(require("dayjs"));
const dbUtil_1 = require("../common/dbUtil");
const dateActionUtil_1 = require("../common/dateActionUtil");
const classUtil_1 = require("../common/classUtil");
function checkDateGreaterOrEqualToday(date) {
    let currentDateTime = new Date();
    let currentDateStr = (0, dayjs_1.default)(currentDateTime).format("YYYY-MM-DDTHH:mm:ssZ");
    let yesterday = (0, dayjs_1.default)().add(-1, 'day').format('YYYY-MM-DD');
    date = (0, dayjs_1.default)(date.split('T')[0]).format('YYYY-MM-DD');
    if ((0, dayjs_1.default)(yesterday).isAfter(date)) {
        return true;
    }
    return true;
}
function regenerateNeverEndingSession() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { type: 'Definition', status: 'Available', 'recurrence.endsByType': 'Never' };
        const classDef = yield (0, dbUtil_1.fetchAllActiveClassDef)(query);
        let lastSessionInstanceEndTime;
        classDef.forEach((sessionDef) => __awaiter(this, void 0, void 0, function* () {
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
            const lastInstances = yield (0, dbUtil_1.lastSessionInstance)(sessionDef._id);
            const resultJsonParser = JSON.parse(lastInstances);
            console.log("RESULT JSON PARSER ::::: => " + resultJsonParser.endTime);
            if (checkDateGreaterOrEqualToday(resultJsonParser.endTime.toString())) {
                const getTommorrowDate = (0, dayjs_1.default)().add(1, 'day').format("YYYY-MM-DD");
                const getNextNinetyDays = (0, dayjs_1.default)().add(91, 'day').format('YYYY-MM-DD');
                let ruleObj = (0, dateActionUtil_1.getRecurrenceValue)(sessionDef.recurrence);
                if (!ruleObj.until)
                    return;
                let ruleParam = (0, dateActionUtil_1.getRuleParams)(ruleObj);
                let dates = [];
                if (Object.keys(ruleParam).length === 0) {
                    dates.push(getTommorrowDate +
                        'T00:00:00.000Z' +
                        (0, dayjs_1.default)().format('Z'));
                }
                else {
                    ruleParam.dtstart = new Date(getTommorrowDate);
                    ruleParam.until = new Date(getNextNinetyDays);
                    const rule = new rrule_1.RRule(ruleParam);
                    dates = rule.all();
                }
                let weekdayTimeMap = (0, dateActionUtil_1.getWeekdayTimeMap)(dates, sessionDef.recurrence);
                for (let i = 0; i < dates.length; i++) {
                    const result = yield (0, dbUtil_1.createSession)((0, classUtil_1.getSessionInstance)(sessionDef, dates[i], weekdayTimeMap));
                    console.log("inserted  ID :::: => " + result.insertedId);
                    yield (0, classUtil_1.updateParticipants)(result.insertedId, sessionDef.participants, dates[i]);
                }
                yield (0, dbUtil_1.updateDateInClassDef)(sessionDef._id, getNextNinetyDays.toString());
            }
        }));
    });
}
exports.regenerateNeverEndingSession = regenerateNeverEndingSession;
// exports.handler = async (event: any )=>{
//   if(event){
//     await regenerateNeverEndingSession();
//   }
// }
