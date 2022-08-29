/* eslint-disable */
import { RRule } from 'rrule';
const dayjs = require('dayjs');
var isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);
import { ObjectId, ISODate } from 'mongodb';
import { getMongoDb } from '../mongo';
import R from 'ramda';

import {
  updateAllClassInstances,
  createSession,
  createParticipants,
  deleteParticipants,
  updateSession,
  listAllSessions,
  deleteSession
} from '../common/dbUtil';
import {
  getRecurrenceValue,
  getDateValue,
  getRuleParams,
  getWeekdayTimeMap
} from '../common/dateActionUtil';
import { 
  updateParticipants,
  manageSessionInstances,
  trimParticipantsBeforeJoiningDate
 } from '../common/classUtil';


async function getParticipants(sessionId) {
  const db = await getMongoDb();
  return await db
    .collection('Participant')
    .find({
      session: new ObjectId(sessionId),
    })
    .toArray();
}


function getLocationValue(dbLocation) {
  let location = {};
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
  let feeDefinition = {};
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

function getStringValue(obj) {
  if (obj != null) {
    return String(obj);
  } else {
    return null;
  }
}


function getNumberValue(obj) {
  if (obj != null) {
    return Number(obj);
  } else {
    return null;
  }
}

function jsonDiff(obj1, obj2) {
  let result = {};
  for (let key in obj1) {
    if (obj2[key] !== obj1[key]) {
      result[key] = obj2[key];
    }
    if (typeof obj2[key] === 'array' && typeof obj1[key] === 'array') {
      result[key] = jsonDiff(obj1[key], obj2[key]);
    }
    if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
      if (key === 'participants') {
        result[key] = arrayDiff(obj1[key], obj2[key], (p1, p2) => {
          return (
            p1.student === p2.student &&
            p1.fees === p2.fees &&
            p1.joinDate === p2.joinDate
          );
        });
      } else if (key === 'recurrence') {
        let recurrenceDiff = jsonDiff(obj1[key], obj2[key]);
        let found = false;
        if (recurrenceDiff != null && recurrenceDiff != null) {
          for (const [key, value] of Object.entries(recurrenceDiff)) {
            if (value != null && Object.keys(value).length !== 0) {
              result.recurrence = recurrenceDiff;
              found = true;
              break;
            }
          }
        }
        if (!found) {
          result.recurrence = {};
        }
      } else if (key === 'byweekday') {
        let obj1JSON = obj1[key];
        let obj2JSON = obj2[key];
        result[key] = arrayDiffJSON(obj1JSON, obj2JSON, (w1, w2) => {
          return (
            w1.dayLabel === w2.dayLabel &&
            w1.startTime === w2.startTime &&
            w1.endTime === w2.endTime
          );
        });
      } else if (key === 'feeDef') {
        result[key] = objDiff(obj1[key], obj2[key], (f1, f2) => {
          return (
            f1.classFeeType === f2.classFeeType &&
            f1.feeFrequency === f2.feeFrequency &&
            f1.advanceFee === f2.advanceFee &&
            f1.feeCalculation === f2.feeCalculation &&
            f1.oneTimeFee === f2.oneTimeFee &&
            f1.feeLinkage === f2.feeLinkage &&
            f1.feeFreqNumMonths === f2.feeFreqNumMonths
          );
        });
      } else if (key === 'location') {
        result[key] = objDiff(obj1[key], obj2[key], (l1, l2) => {
          return l1.tag === l2.tag;
        });
      } else {
        result[key] = jsonDiff(obj1[key], obj2[key]);
      }
    }
  }
  return result;
}

function arrayDiff(arrList1, arrList2, compareFunction) {
  return arrayDiffJSON(arrList1, arrList2, compareFunction);
}

function arrayDiffJSON(arrList1, arrList2, compareFunction) {
  if (arrList1 === null && arrList2 === null) {
    return {};
  }
  if (arrList1 == null) {
    return arrList2;
  }
  if (arrList2 == null) {
    return arrList1;
  }
  let uniqResultOne = arrList1.filter(function (p1) {
    return !arrList2.some(function (p2) {
      return compareFunction(p1, p2);
    });
  });

  let uniqResultTwo = arrList2.filter(function (p2) {
    return !arrList1.some(function (p1) {
      return compareFunction(p1, p2);
    });
  });
  return uniqResultOne.concat(uniqResultTwo);
}

function objDiff(obj1, obj2, compareFunction) {
  return objDiffJSON(obj1, obj2, compareFunction);
}

function objDiffJSON(obj1, obj2, compareFunction) {
  if (obj1 === null && obj2 === null) {
    return {};
  }
  if (obj1 == null) {
    return obj2;
  }
  if (obj2 == null) {
    return obj1;
  }
  if (!compareFunction(obj1, obj2)) {
    return obj1;
  }
  return {};
}

function showDiffDecision(oldImage, newImage) {
  if (newImage.frequency === 'OnTheGo' && newImage.status !== 'Closed') {
    return {
      action: 'UPDATE',
      changes: [],
    };
  } else if (newImage.status === 'Closed') {
    return {
      action: 'DELETE',
      changes: [],
    };
  }
  let diffAction = {
    action: 'IGNORE',
  };
  let diffObj = jsonDiff(oldImage, newImage);
  //console.log('Difference between new and old image is ', diffObj);
  let ignoreAttributes = [
    'parentDef',
    '_id__baas_transaction',
    'lastBilledDate',
  ];
  let firstTime = false;
  for (const [key, value] of Object.entries(diffObj)) {
    if (!ignoreAttributes.includes(key)) {
      if (value !== null && Object.keys(value).length !== 0) {
        //console.log('Diff: ', key, value);
        if (!firstTime) {
          diffAction = {
            action: 'UPDATE',
            changes: [],
          };
          firstTime = true;
        }
        if (key === 'startTime' || key === 'endTime') {
          return {
            action: 'DELETE_AND_CREATE',
            changes: ['SCHEDULE'],
          };
        }
        if (key === 'recurrence') {
          //console.log('recurrence value ', value);
          if (value != null) {
            for (const [rkey, rvalue] of Object.entries(value)) {
              if (rvalue != null && Object.keys(rvalue).length !== 0) {
                if (rkey === 'neverEndDate') {
                  diffAction = {
                    action: 'UPDATE',
                    changes: ['NEVER'],
                  };
                } else {
                  return {
                    action: 'DELETE_AND_CREATE',
                    changes: ['SCHEDULE'],
                  };
                }
              }
            }
          }
        }
        if (key === 'name' || key === 'notes' || key === 'category' || key === 'location') {
          //console.log('change name/notes/category ', value);
          if (diffAction != null && diffAction.changes !== null) {
            diffAction.changes.push('BASIC_INFO');
          } else {
            diffAction = {
              action: 'UPDATE',
              changes: ['BASIC_INFO'],
            };
          }
        }
        if (key === 'participants') {
          //console.log('participants ', value);
          if (diffAction != null && diffAction.changes !== null) {
            diffAction.changes.push('PARTICIPANTS');
          } else {
            diffAction = {
              action: 'UPDATE',
              changes: ['PARTICIPANTS'],
            };
          }
        }
        if (key === 'feeDef') {
          //console.log('feeDef value ', value);
          if (diffAction != null && diffAction.changes !== null) {
            diffAction.changes.push('FEE_DEF');
          } else {
            diffAction = {
              action: 'UPDATE',
              changes: ['FEE_DEF'],
            };
          }
        }
      }
    }
  }
  return {
    action: diffAction.action,
    changes: diffAction.changes ? R.uniq(diffAction.changes) : []
  };
}

function getRRuleFreq(repeatEvery) {
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

function getRRuleWeekday(repeatOn) {
  var rruleArray = [];
  var rruleWeek = [
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

/*
function getParticipants(data) {
  var participants = [];
  if (
    data != null &&
    data.participants != null &&
    data.participants.L != null
  ) {
    data.participants.L.forEach((participant) => {
      participants.push({
        id: getStringValue(participant.M.id),
        studentName: getStringValue(participant.M.studentName),
        inviteStatus: getStringValue(participant.M.inviteStatus),
        joinDate: getStringValue(participant.M.joinDate),
        fees: participant.M.fees != null ? Number(participant.M.fees.N) : null,
        attendance: {
          attended: 'YES',
        },
      });
    });
  }
  return participants;
}
*/

async function updateInstances(sessionDef, instances, participants) {
  if (instances === null || sessionDef === null) {
    return;
  }
  for (let i = 0; i < instances.length; i++) {
    let sessionInstance = manageSessionInstances(
      sessionDef,
      dayjs(instances[i].startTime).toDate()
    );
    delete sessionInstance._id;
    delete sessionInstance.startTime;
    delete sessionInstance.endTime;
    delete sessionInstance.parentDef;
    delete sessionInstance.type;
    delete sessionInstance.status;
    delete sessionInstance.participants;
    await updateSession(null,instances[i]._id, sessionInstance);
    // update participant with session ID
    let instanceParticipants = participants.map((participant) => {
      return {
        ...participant,
        joinDate: dayjs(participant.joinDate).toDate(),
        student: new ObjectId(participant.student),
        session: new ObjectId(instances[i]._id),
      };
    });
    await deleteParticipants(null,[instances[i]._id]);
    instanceParticipants = trimParticipantsBeforeJoiningDate(
      instanceParticipants,
      dayjs(instances[i].startTime).unix()
    );
    await createParticipants(null,instanceParticipants);
  }
}

function findEditLockDate(session) {
  let isBilled = session.isBilled;
  let lastBillRunDate = session.lastBilledDate;
  //console.log('lastBillRunDate from DB', lastBillRunDate);
  if (lastBillRunDate == null && !isBilled) {
    return null;
  }
  let feeDef = session.feeDef;
  if (feeDef.feeFrequency === 'Weekly') {
    return dayjs().endOf('isoWeek').toDate();
  } else if (feeDef.feeFrequency === 'Monthly') {
    let months = feeDef.feeFreqNumMonths;
    return dayjs(lastBillRunDate)
      .add(months - 1, 'month')
      .endOf('month')
      .toDate();
  } else if (feeDef.feeFrequency === 'EachClass') {
    return dayjs().toDate();
  }
  return null;
}

async function processRecord(detail) {
  const sessionDef = detail.fullDocument;
  const operationType = detail.operationType;
  console.log('Processing Event Record: ', sessionDef);
  if (!sessionDef || sessionDef.type !== 'Definition') {
    return;
  }
  let recurrenceJSON = sessionDef.recurrence;
  if (operationType == 'insert' && sessionDef.frequency !== 'OnTheGo') {
    console.log(
      'Creating instances for definition ',
      sessionDef._id,
      sessionDef.name
    );
    let ruleObj = getRecurrenceValue(recurrenceJSON);
    let ruleParam = getRuleParams(ruleObj);
    let dates = [];
    if (Object.keys(ruleParam).length === 0) {
      dates.push(
        sessionDef.startTime.split('T')[0] +
          'T00:00:00.000Z' +
          dayjs().format('Z')
      );
    } else {
      ruleParam.dtstart = new Date(sessionDef.startTime.split('T')[0]);
      const rule = new RRule(ruleParam);
      dates = rule.all();
    }
    let weekdayTimeMap = getWeekdayTimeMap(dates, recurrenceJSON);
    let participants = sessionDef.participants;
    for (var i = 0; i < dates.length; i++) {
      const result = await createSession(
        null,
        manageSessionInstances(sessionDef, dates[i], weekdayTimeMap)
      );

      updateParticipants(
        null,
        createParticipants,
        result.ops[0]._id,
        participants, dates[i]
      );

      console.log(
        'Created instance ',
        result.ops[0]._id,
        manageSessionInstances(sessionDef, dates[i], weekdayTimeMap)
      );
    }

    console.log(
      'Finished Creating instances for definition ',
      sessionDef._id,
      sessionDef.name
    );
  } else if (operationType == 'update' || operationType == 'replace') {
    const oldSessionDef = detail.fullDocumentBeforeChange;
    console.log('oldSessionDef: ', oldSessionDef);
    if (sessionDef.type !== 'Definition') {
      return;
    }
    console.log(
      'Updating instances for definition ',
      sessionDef._id,
      sessionDef.name,
      oldSessionDef.name
    );
    let diffDecision = showDiffDecision(oldSessionDef, sessionDef);
    console.log('Diff decision taken is ', diffDecision);
    if (diffDecision.action === 'IGNORE') {
      return;
    }

    let onlyBasicInfoUpdated =
      diffDecision.action === 'UPDATE' &&
      diffDecision.changes.length === 1 &&
      diffDecision.changes.includes('BASIC_INFO');
    let onlyClassStudentsFeesUpdated =
      diffDecision.action === 'UPDATE' &&
      diffDecision.changes.length === 1 &&
      diffDecision.changes.includes('PARTICIPANTS');

    let oldRecurrenceJSON = oldSessionDef.recurrence;

    let endClassFlag = false;
    let currentDateTime = new Date();
    let epoch = Math.round(currentDateTime.getTime() / 1000);
    let currentDateStr = dayjs(currentDateTime).format('YYYY-MM-DDTHH:mm:ssZ');
    let currentEpoch = dayjs(currentDateTime).unix();
    let ruleObj = getRecurrenceValue(recurrenceJSON);
    let ruleParam = getRuleParams(ruleObj);
    let dates = [];
    let editDate = findEditLockDate(sessionDef);
    if (Object.keys(ruleParam).length === 0) {
      // (currentEpoch < startEpoch)
      dates.push(
        currentDateStr.split('T')[0] + 'T00:00:00.000' + dayjs().format('Z')
      );
    } else {
      let startEpoch = dayjs(sessionDef.startTime).unix();
      if (currentEpoch > startEpoch) {
        ruleParam.dtstart = new Date(currentDateStr.split('T')[0]);
      } else {
        ruleParam.dtstart = new Date(sessionDef.startTime.split('T')[0]);
      }

      console.log(
        'Basic Info : ',
        onlyBasicInfoUpdated,
        onlyClassStudentsFeesUpdated,
        diffDecision.changes,
        editDate
      );
      // If only Basic class info is updated,
      // update all instances occuring after current date with the basic info details.

      if (onlyBasicInfoUpdated) {
        await updateAllClassInstances(sessionDef._id, currentDateTime.toISOString(), {
          name: sessionDef.name,
          notes: sessionDef.notes,
          category: sessionDef.category,
          location: sessionDef.location,
        })
        console.log(`Completed updating the basic info changes to Class Def with id ${sessionDef._id}`);
        return 'Done';
      }
      if (
        !onlyBasicInfoUpdated &&
        !onlyClassStudentsFeesUpdated &&
        editDate != null &&
        dayjs(editDate).unix() > dayjs(ruleParam.dtstart).unix()
      ) {
        ruleParam.dtstart = new Date(
          dayjs(editDate).add(1, 'day').format('YYYY-MM-DD')
        );
        epoch = Math.round(editDate.getTime() / 1000);
      }
      const rule = new RRule(ruleParam);
      dates = rule.all();
    }
    let createNeverInstances = false;
    if (
      diffDecision.action === 'UPDATE' &&
      diffDecision.changes.length === 1 &&
      diffDecision.changes.includes('NEVER') &&
      recurrenceJSON.neverEndDate != null &&
      oldRecurrenceJSON.neverEndDate != null
    ) {
      let oldNeverDate = getDateValue(oldRecurrenceJSON.neverEndDate);
      let newNeverDate = getDateValue(recurrenceJSON.neverEndDate);
      if (oldNeverDate.getTime() <= newNeverDate.getTime()) {
        // filter dates before old never end date
        let purgedDates = [];
        for (let j = 0; j < dates.length; j++) {
          if (dates[j].getTime() > oldNeverDate) {
            purgedDates.push(dates[j]);
          }
        }
        dates = purgedDates;
        createNeverInstances = true;
      }
    }

    let weekdayTimeMap = getWeekdayTimeMap(dates, recurrenceJSON);
    let queryDateTime = currentDateTime;
    // Handle end class
    if (sessionDef.status === 'Closed') {
      endClassFlag = true;
      let endEpoch = dayjs(sessionDef.endTime).unix();
      if (endEpoch > epoch) {
        queryDateTime = sessionDef.endTime;
      }
    }

    let participants = sessionDef.participants;
    let variable = {
      type: 'Instance',
      startTime: {
        $gte: new Date(queryDateTime),
      },
      parentDef: new ObjectId(sessionDef._id),
    };

    if (!createNeverInstances) {
      let instances = await listAllSessions(null,variable)
        .then(
          console.log('Seaching for instances that are impacted ', variable)
        )
        .catch((err) => {
          console.log(err);
        });

      //console.log('Listing impacted instances ', instances);
      if (diffDecision.action === 'UPDATE') {
        if (
          editDate != null &&
          diffDecision.changes.length === 1 &&
          diffDecision.changes.includes('PARTICIPANTS')
        ) {
          console.log('Updating participants list since it has changed');
          let oldParticipants = oldSessionDef.participants;
          let newParticipants = sessionDef.participants;
          console.log('Participants : ', oldParticipants, newParticipants);
          let billedInstances = instances.filter((instance) => {
            return (
              dayjs(instance.startTime).unix() > currentEpoch &&
              dayjs(instance.startTime).unix() <= dayjs(editDate).unix()
            );
          });
          let nonBilledInstances = instances.filter((instance) => {
            return dayjs(instance.startTime).unix() > dayjs(editDate).unix();
          });
          let addedParticipants = newParticipants.filter(
            (obj1) =>
              !oldParticipants.some((obj2) => obj1.student === obj2.student)
          );
          //let billedStudents = [...oldParticipants, ...addedParticipants];
          let deletedParticipants = oldParticipants.filter(
            (obj1) =>
              !newParticipants.some((obj2) => obj1.student === obj2.student)
          );
          if (billedInstances != null && billedInstances.length > 0) {
            let billedStudents = [...oldParticipants, ...addedParticipants];
            console.log(
              'Billed Students with added participants',
              billedStudents
            );
            billedStudents = billedStudents.filter(
              (obj1) =>
                !deletedParticipants.some(
                  (obj2) => obj1.student === obj2.student
                )
            );
            console.log(
              'Billed Students after deleting participants',
              billedStudents
            );
            await updateInstances(sessionDef, billedInstances, billedStudents);
          }
          await updateInstances(
            sessionDef,
            nonBilledInstances,
            newParticipants
          );
        } else {
          await updateInstances(sessionDef, instances, participants);
        }

        return;
      } else {
        if (instances != null) {
          console.log('Deleting old instances ', instances);
          for (const value of instances) {
            if (dayjs(value.startTime).isAfter(dayjs(ruleParam.dtstart))) {
              await deleteSession(null,value._id);
            }
          }
        }
      }
    }
    let sessionInstance = null;
    if (!endClassFlag && dates.length > 0) {
      for (var i = 0; i < dates.length; i++) {
        sessionInstance = manageSessionInstances(
          sessionDef,
          dates[i],
          weekdayTimeMap
        );
        if (!(epoch >= dayjs(sessionInstance.startTime).unix())) {
          console.log('Updating instance ', sessionInstance);
          const result = await createSession(
            null,
            manageSessionInstances(sessionDef, dates[i], weekdayTimeMap)
          );
          updateParticipants(
            createParticipants,
            null,
            result.ops[0]._id, 
            participants, 
            dates[i]);
        }
      }
    }

    console.log(
      'Finished Processing instances for definition ',
      sessionDef._id,
      sessionDef.name
    );
  }
  console.log('Completed processing the updated definitions');
  return 'Done';
}

exports.handler = async function (event) {
  if (event) {
    if ('Records' in event) {
      for (const record of event.Records) {
        const recordBody = JSON.parse(record.body);
        if (recordBody == null) {
          return;
        }

        await processRecord(recordBody.detail);
      }
    } else {
      const { detail } = event;
      await processRecord(detail);
    }
  }
};
