"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecurrenceValue = exports.getRuleParams = exports.getWeekdayTimeMap = exports.getDateValue = exports.convertToWeekDayArray = exports.getRRuleWeekday = exports.getNumberValue = exports.getRRuleFreq = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const rrule_1 = require("rrule");
var isoWeek = require('dayjs/plugin/isoWeek');
dayjs_1.default.extend(isoWeek);
const getRRuleFreq = (repeatEvery) => {
    if (repeatEvery == null) {
        return null;
    }
    if (repeatEvery == 'Yearly') {
        return rrule_1.RRule.YEARLY;
    }
    else if (repeatEvery == 'Monthly') {
        return rrule_1.RRule.MONTHLY;
    }
    else if (repeatEvery == 'Weekly') {
        return rrule_1.RRule.WEEKLY;
    }
    else if (repeatEvery == 'Daily') {
        return rrule_1.RRule.DAILY;
    }
    else {
        return null;
    }
};
exports.getRRuleFreq = getRRuleFreq;
const getNumberValue = (obj) => {
    if (obj != null) {
        return Number(obj);
    }
    else {
        return null;
    }
};
exports.getNumberValue = getNumberValue;
const getRRuleWeekday = (repeatOn) => {
    var rruleArray = [];
    var rruleWeek = [
        rrule_1.RRule.MO,
        rrule_1.RRule.TU,
        rrule_1.RRule.WE,
        rrule_1.RRule.TH,
        rrule_1.RRule.FR,
        rrule_1.RRule.SA,
        rrule_1.RRule.SU,
    ];
    for (var i = 0; i < repeatOn.length; i++) {
        rruleArray.push(rruleWeek[repeatOn[i]]);
    }
    return rruleArray;
};
exports.getRRuleWeekday = getRRuleWeekday;
const convertToWeekDayArray = (byweekday) => {
    let byweekdayArray = [];
    if (byweekday != null) {
        byweekday.map((item) => {
            byweekdayArray.push(item.dayCode);
        });
    }
    return byweekdayArray;
};
exports.convertToWeekDayArray = convertToWeekDayArray;
const getDateValue = (obj) => {
    if (obj != null) {
        return new Date(obj);
    }
    else {
        return null;
    }
};
exports.getDateValue = getDateValue;
const getWeekdayTimeMap = (dates, recurrenceJSON) => {
    let weekdayTimeMap = new Map();
    let dayCodeTimeMap = new Map();
    if (dates == null ||
        recurrenceJSON == null ||
        recurrenceJSON.byweekday == null) {
        return weekdayTimeMap;
    }
    recurrenceJSON.byweekday.map((weekday) => {
        dayCodeTimeMap.set(weekday.dayCode, {
            startTime: weekday.startTime,
            endTime: weekday.endTime,
        });
    });
    dates.map((date) => {
        weekdayTimeMap.set(date, dayCodeTimeMap.get((0, dayjs_1.default)(date).isoWeekday() - 1));
    });
    return weekdayTimeMap;
};
exports.getWeekdayTimeMap = getWeekdayTimeMap;
const getRuleParams = (ruleObj) => {
    const rule = {
        freq: null,
        interval: null,
        byweekday: null,
        until: null,
        count: null,
        wkst: null,
        dtstart: null
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
        rule.wkst = rrule_1.RRule.MO;
    }
    return rule;
};
exports.getRuleParams = getRuleParams;
const getRecurrenceValue = (recurrenceJSON) => {
    let ruleObj = {
        freq: null,
        interval: null,
        byweekday: null,
        until: null,
        count: null,
    };
    if (recurrenceJSON == null) {
        return ruleObj;
    }
    ruleObj.freq = (0, exports.getRRuleFreq)(recurrenceJSON.frequency);
    ruleObj.interval = (0, exports.getNumberValue)(recurrenceJSON.interval);
    if (recurrenceJSON.byweekday != null) {
        ruleObj.byweekday = (0, exports.getRRuleWeekday)((0, exports.convertToWeekDayArray)(recurrenceJSON.byweekday));
    }
    if (recurrenceJSON.endsByType === 'Never' &&
        recurrenceJSON.neverEndDate != null) {
        ruleObj.until = (0, exports.getDateValue)(recurrenceJSON.neverEndDate);
    }
    else {
        ruleObj.count = (0, exports.getNumberValue)(recurrenceJSON.count);
        ruleObj.until = (0, exports.getDateValue)(recurrenceJSON.untilDate);
    }
    return ruleObj;
};
exports.getRecurrenceValue = getRecurrenceValue;
