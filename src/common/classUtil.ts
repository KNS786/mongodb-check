import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import {createParticipants} from '../common/dbUtil';

export const trimParticipantsBeforeJoiningDate = (participants: any, epoch: any) => {
    let trimmedParticipants:any = [];
    if (participants != null) {
      participants.forEach((participant:any) => {
        let joiningDateEpoch:any = dayjs(participant.joinDate).unix();
          if (epoch >= joiningDateEpoch) {
            trimmedParticipants.push(participant);
          }
        });
      }
    return trimmedParticipants;
  }
  
  export const updateParticipants = async (
    sessionId: any,
    participants: any, 
    sessionDate: any
    ) => {
    if (participants && participants.length > 0) {
      let instanceParticipants = participants.map((participant:any) => {
        return {
          ...participant,
          joinDate: dayjs(participant.joinDate).toDate(),
          student: new ObjectId(participant.student),
          session: new ObjectId(sessionId),
        };
      });
      instanceParticipants = trimParticipantsBeforeJoiningDate(
        instanceParticipants,
        dayjs(sessionDate).unix()
      );
      await createParticipants(instanceParticipants);
    }
  }

function getLocationValue(dbLocation : any ) {
    type locationObj = {
      tag: any,
      line1: any,
      line2: any,
      city: any,
      pinCode: any
    }
    let location:locationObj = {
      tag: null,
      line1: null,
      line2: null,
      city: null ,
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
  
function getFeeDefValue(feeDef: any) {
    type classObj  = {
      classFeeType: any,
      feeFrequency: any,
      advanceFee: any,
      feeCalculation: any,
      oneTimeFee: any,
      feeLinkage: any,
      feeFreqNumMonths: any
    }
    let feeDefinition : classObj = {
      classFeeType: null ,
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
  
  
export const getSessionInstance : any  = ( 
  data: any,
  ruDate: any, 
  weekdayTimeMap: any 
 ) => {
      if (data == null || ruDate == null) {
        return null;
      }
      let startTime = JSON.stringify(data.startTime).split('T')[1];
      let endTime = JSON.stringify(data.endTime).split('T')[1]
  
      let ruleDate = dayjs(ruDate).format('YYYY-MM-DD');
      let stTime = startTime;
      let eTime = endTime;
  
      if (weekdayTimeMap != null && weekdayTimeMap.size > 0) {
        stTime = weekdayTimeMap.get(ruDate).startTime;
        eTime = weekdayTimeMap.get(ruDate).endTime;
      }
  
      var json = {
        name: data.name,
        notes: data.notes != null ? data.notes : '',
        tutor: new ObjectId(data._id),
        startTime: new Date(ruleDate+'T'+stTime),
        endTime: new Date(ruleDate+'T'+eTime),
        parentDef: new ObjectId(data._id),
        location: getLocationValue(data.location),
        frequency:data.frequency,
        type:'Instance',
        status:data.status,
        feeDef: getFeeDefValue(data.feeDef),
        classFees: data.classFees != null ? data.classFees : 0,
        oneTimeFees: data.oneTimeFees != null ? data.oneTimeFees : 0,
        category: data.category,
        academy: new ObjectId(data.academy),
      }
    return json;
}