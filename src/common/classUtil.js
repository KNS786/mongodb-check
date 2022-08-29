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
exports.getSessionInstance = exports.updateParticipants = exports.trimParticipantsBeforeJoiningDate = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const mongodb_1 = require("mongodb");
const dbUtil_1 = require("../common/dbUtil");
const trimParticipantsBeforeJoiningDate = (participants, epoch) => {
    let trimmedParticipants = [];
    if (participants != null) {
        participants.forEach((participant) => {
            let joiningDateEpoch = (0, dayjs_1.default)(participant.joinDate).unix();
            if (epoch >= joiningDateEpoch) {
                trimmedParticipants.push(participant);
            }
        });
    }
    return trimmedParticipants;
};
exports.trimParticipantsBeforeJoiningDate = trimParticipantsBeforeJoiningDate;
const updateParticipants = (sessionId, participants, sessionDate) => __awaiter(void 0, void 0, void 0, function* () {
    if (participants && participants.length > 0) {
        let instanceParticipants = participants.map((participant) => {
            return Object.assign(Object.assign({}, participant), { joinDate: (0, dayjs_1.default)(participant.joinDate).toDate(), student: new mongodb_1.ObjectId(participant.student), session: new mongodb_1.ObjectId(sessionId) });
        });
        instanceParticipants = (0, exports.trimParticipantsBeforeJoiningDate)(instanceParticipants, (0, dayjs_1.default)(sessionDate).unix());
        yield (0, dbUtil_1.createParticipants)(instanceParticipants);
    }
});
exports.updateParticipants = updateParticipants;
function getLocationValue(dbLocation) {
    let location = {
        tag: null,
        line1: null,
        line2: null,
        city: null,
        pinCode: null
    };
    if (dbLocation != null) {
        location.tag = dbLocation.tag;
        location.line1 = dbLocation.line1;
        location.line2 = dbLocation.line2;
        location.city = dbLocation.city;
        location.pinCode = dbLocation.pinCode;
    }
    if (location.line2 == null) {
        delete location.line2;
    }
    return location;
}
function getFeeDefValue(feeDef) {
    let feeDefinition = {
        classFeeType: null,
        feeFrequency: null,
        advanceFee: null,
        feeCalculation: null,
        oneTimeFee: null,
        feeLinkage: null,
        feeFreqNumMonths: null
    };
    if (feeDef != null) {
        feeDefinition.classFeeType = feeDef.classFeeType;
        feeDefinition.feeFrequency = feeDef.feeFrequency;
        feeDefinition.advanceFee = feeDef.advanceFee;
        feeDefinition.feeCalculation = feeDef.feeCalculation;
        feeDefinition.oneTimeFee = feeDef.oneTimeFee;
        feeDefinition.feeLinkage = feeDef.feeLinkage;
        if (feeDef.feeFreqNumMonths != null) {
            feeDefinition.feeFreqNumMonths = feeDef.feeFreqNumMonths;
        }
    }
    return feeDefinition;
}
const getSessionInstance = (data, ruDate, weekdayTimeMap) => {
    if (data == null || ruDate == null) {
        return null;
    }
    let startTime = JSON.stringify(data.startTime).split('T')[1];
    let endTime = JSON.stringify(data.endTime).split('T')[1];
    let ruleDate = (0, dayjs_1.default)(ruDate).format('YYYY-MM-DD');
    let stTime = startTime;
    let eTime = endTime;
    if (weekdayTimeMap != null && weekdayTimeMap.size > 0) {
        stTime = weekdayTimeMap.get(ruDate).startTime;
        eTime = weekdayTimeMap.get(ruDate).endTime;
    }
    var json = {
        name: data.name,
        notes: data.notes != null ? data.notes : '',
        tutor: new mongodb_1.ObjectId(data._id),
        startTime: new Date(ruleDate + 'T' + stTime),
        endTime: new Date(ruleDate + 'T' + eTime),
        parentDef: new mongodb_1.ObjectId(data._id),
        location: getLocationValue(data.location),
        frequency: data.frequency,
        type: 'Instance',
        status: data.status,
        feeDef: getFeeDefValue(data.feeDef),
        classFees: data.classFees != null ? data.classFees : 0,
        oneTimeFees: data.oneTimeFees != null ? data.oneTimeFees : 0,
        category: data.category,
        academy: new mongodb_1.ObjectId(data.academy),
    };
    return json;
};
exports.getSessionInstance = getSessionInstance;
