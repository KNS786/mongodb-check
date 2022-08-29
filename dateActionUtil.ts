import dayjs from 'dayjs';
import { RRule } from 'rrule';
var isoWeek : any = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

export const getRRuleFreq =(repeatEvery: any) => {
    if (repeatEvery == null) {
       return null;
    } 
    if (repeatEvery == 'Yearly') {
       return RRule.YEARLY;
    } else if (repeatEvery == 'Monthly') {
       return RRule.MONTHLY;
    } else if (repeatEvery == 'Weekly') {
       return RRule.WEEKLY;
    } else if (repeatEvery == 'Daily') {
       return RRule.DAILY;
    } else {
       return null;
    }
}

export const getNumberValue = (obj: any) => {
    if (obj != null) {
      return Number(obj);
    } else {
      return null;
    }
}

export const  getRRuleWeekday = (repeatOn: any) => {
    var rruleArray: any = [];
    var rruleWeek : any = [
      RRule.MO,
      RRule.TU,
      RRule.WE,
      RRule.TH,
      RRule.FR,
      RRule.SA,
      RRule.SU,
    ];
    for (var i = 0; i < repeatOn.length; i++) {
      rruleArray.push(rruleWeek[repeatOn[i]]);
    }
    return rruleArray;
}

export const convertToWeekDayArray = (byweekday: any) => {
    let byweekdayArray:any = [];
    if (byweekday != null) {
      byweekday.map((item : any) => {
        byweekdayArray.push(item.dayCode);
      });
    }
    return byweekdayArray;
}

export const getDateValue = (obj: any) => {
    if (obj != null) {
      return new Date(obj);
    } else {
      return null;
    }
}

export const getWeekdayTimeMap = (dates: any, recurrenceJSON: any) => {
    let weekdayTimeMap = new Map();
    let dayCodeTimeMap = new Map();
    if (
      dates == null ||
      recurrenceJSON == null ||
      recurrenceJSON.byweekday == null
    ) {
      return weekdayTimeMap;
    }
    recurrenceJSON.byweekday.map((weekday:any) => {
      dayCodeTimeMap.set(weekday.dayCode, {
        startTime: weekday.startTime,
        endTime: weekday.endTime,
      });
    });
  
    dates.map((date : any ) => {
      weekdayTimeMap.set(date, dayCodeTimeMap.get(dayjs(date).isoWeekday() - 1));
    });
    return weekdayTimeMap;
}

export const  getRuleParams = (ruleObj: any) => {
    type typeRuleObj={
        freq : any,
        interval : any,
        byweekday : any,
        until : any,
        count : any,
        wkst:any,dtstart:any
    }
    const rule :typeRuleObj = {
        freq : null,
        interval : null,
        byweekday:null,
        until:null,
        count:null,
        wkst:null,
        dtstart:null
    };
    if (ruleObj.freq != null) {
      rule.freq = ruleObj.freq;
    }
    if (ruleObj.interval != null) {
      rule.interval = ruleObj.interval;
    }
    if (ruleObj.byweekday != null) {
      rule.byweekday = ruleObj.byweekday;
    }
    if (ruleObj.until != null) {
      rule.until = ruleObj.until;
    }
    if (ruleObj.count != null) {
      rule.count = ruleObj.count;
    }
    if (ruleObj.byweekday != null) {
      rule.wkst = RRule.MO;
    }
    return rule;
}

export const getRecurrenceValue = (recurrenceJSON: any) => {
    type typeRuleObj={
        freq : any,
        interval : any,
        byweekday : any,
        until : any,
        count : any
    }
    let ruleObj : typeRuleObj = {
        freq: null,
        interval: null,
        byweekday: null,
        until: null,
        count: null,
    };
    if (recurrenceJSON == null) {
       return ruleObj;
    }
    ruleObj.freq = getRRuleFreq(recurrenceJSON.frequency);
    ruleObj.interval = getNumberValue(recurrenceJSON.interval);
    if (recurrenceJSON.byweekday != null) {
       ruleObj.byweekday = getRRuleWeekday(
          convertToWeekDayArray(recurrenceJSON.byweekday)
        );
    }
    if (
        recurrenceJSON.endsByType === 'Never' &&
        recurrenceJSON.neverEndDate != null
    ) {
        ruleObj.until = getDateValue(recurrenceJSON.neverEndDate);
      } else {
        ruleObj.count = getNumberValue(recurrenceJSON.count);
        ruleObj.until = getDateValue(recurrenceJSON.untilDate);
      }
    return ruleObj;
}