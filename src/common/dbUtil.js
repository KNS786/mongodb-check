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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTutors = exports.getTutrorsId = exports.getUserProfile = exports.getTutorName = exports.getAllUserId = exports.getAllStudent = exports.getTotalNoOfStaff = exports.getMyStudentsCount = exports.getAllTutor = exports.lastSessionInstance = exports.deleteSession = exports.listAllSessions = exports.updateSession = exports.deleteParticipants = exports.createParticipants = exports.createSession = exports.fetchAllActiveClassDef = exports.updateDateInClassDef = void 0;
const mongodb_1 = require("mongodb");
const mongo_1 = require("../mongo");
// export const createTutor = async (userId: string, userName: string) => {
//   const db = await getMongoDb();
//   const tutorUser = {
//     user: new ObjectId(userId),
//     categories: [],
//     role: TutorRole.ADMIN,
//   };
//   const tutorCollection = db.collection('Tutor');
//   const tutorResult = await tutorCollection.insertOne(tutorUser);
//   if (tutorResult.result.ok === 1) {
//     console.log(`Tutor user for ${userId} created`);
//     // Create Academy with user name as user
//     const academyId = await createAcademy(
//       tutorResult.insertedId,
//       userId,
//       userName
//     );
//     if (!academyId) {
//       console.log(
//         `Academy creation failed for tutor with tutor id ${tutorResult.insertedId}  and user id ${userId}`
//       );
//       return null;
//     }
//     // Update the tutor with the academy id
//     const updateResult = await tutorCollection.updateOne(
//       { _id: tutorResult.insertedId },
//       { $set: { academy: academyId } }
//     );
//     if (updateResult.result.ok === 1) {
//       console.log(
//         `Tutor with tutor id ${tutorResult.insertedId} and user id ${userId} updated with academy id ${academyId}`
//       );
//       return tutorResult.insertedId;
//     } else {
//       console.log('Tutor update failed');
//     }
//     return tutorResult.insertedId;
//   } else {
//     console.log(`Tutor user creation failed for user with id${userId}`);
//     return null;
//   }
// };
// export const createAcademy = async (
//   tutorId: string,
//   userId: string,
//   academyName: string
// ) => {
//   const db = await getMongoDb();
//   const academyCollection = db.collection('Academy');
//   const academy = {
//     name: academyName,
//     owner: new ObjectId(userId),
//     tutor: new ObjectId(tutorId),
//   };
//   const academyResult = await academyCollection.insertOne(academy);
//   if (academyResult.result.ok === 1) {
//     console.log(`Academy ${academyName} created for tutor ${tutorId}`);
//     return academyResult.insertedId;
//   } else {
//     console.log(`Academy creation failed for tutor ${tutorId}`);
//     return null;
//   }
// };
// export const createStaff = async (
//   userId: string,
//   academyId: string,
//   currencyCode: string
// ) => {
//   const db = await getMongoDb();
//   const staffUser = {
//     user: new ObjectId(userId),
//     academy: new ObjectId(academyId),
//     currencyCode,
//     categories: [],
//   };
//   const tutorCollection = db.collection('Tutor');
//   const staffResult = await tutorCollection.insertOne(staffUser);
//   if (staffResult.result.ok === 1) {
//     console.log(`Staff user for ${userId} created`);
//     return staffResult.insertedId;
//   } else {
//     console.log(`Staff user creation failed for user with id${userId}`);
//     return null;
//   }
// };
// export const updateStaffStatusAsSignedUp = async (
//   userId: string,
//   staffId: string
// ) => {
//   const db = await getMongoDb();
//   const tutorCollection = db.collection('Tutor');
//   const staffResult = await tutorCollection.updateOne(
//     { _id: new ObjectId(staffId) },
//     { $set: { isSignedUp: true, user: new ObjectId(userId) } }
//   );
//   if (staffResult.result.ok === 1) {
//     console.log(`Staff user for ${staffId} updated`);
//     return true;
//   } else {
//     console.log(`Staff user update failed for user with id${staffId}`);
//     return false;
//   }
// };
// export const addAnotherRole = async (
//   newRole: UserRole,
//   existingUserInfo: IUser
// ) => {
//   // If the user already has a role which is not same as the new role, then add the new role to the roles
//   if (existingUserInfo.roles.includes(newRole)) {
//     console.log(
//       'User already has the role, so cannot create another user with same role'
//     );
//     return null;
//   }
//   const updatedUserInfo = {
//     ...existingUserInfo,
//     roles: [...existingUserInfo.roles, newRole],
//   };
//   // Update the user in mongo
//   const db = await getMongoDb();
//   const collection = db.collection('User');
//   const updatedUserInfoRsp = await collection.findOneAndUpdate(
//     { mobileNum: existingUserInfo.mobileNum },
//     { $set: updatedUserInfo },
//     { returnOriginal: false }
//   );
//   if (updatedUserInfoRsp.ok === 1) {
//     console.log(`User ${existingUserInfo.fullName} updated`);
//     return updatedUserInfoRsp.value._id;
//   }
//   return null;
// };
// export const createStudentProfile = async (
//   userId: string,
//   userName: string,
//   studentId: string
// ) => {
//   const db = await getMongoDb();
//   // Insert a profile in profile collection for this user id
//   const profileCollection = db.collection('UserProfile');
//   const profile = {
//     name: userName,
//     students: [new ObjectId(studentId)],
//     relation: UserRelationship.SELF,
//     user: new ObjectId(userId),
//   };
//   const profileResult = await profileCollection.insertOne(profile);
//   if (profileResult.result.ok === 1) {
//     console.log(`Profile for ${userName} created`);
//   } else {
//     console.log(`Profile for ${userName} creation failed`);
//   }
//   return profileResult.insertedId;
// };
// export const addStudentProfile = async (
//   userId: string,
//   userName: string,
//   studentId: string
// ) => {
//   // Check if the user already has a profile
//   const db = await getMongoDb();
//   const profileCollection = db.collection('UserProfile');
//   const profileResult = await profileCollection.findOne({
//     user: new ObjectId(userId),
//   });
//   if (profileResult) {
//     // Add the student to the profile
//     const updatedProfile = {
//       ...profileResult,
//       students: [...profileResult.students, new ObjectId(studentId)],
//     };
//     const updateProfileResult = await profileCollection.findOneAndUpdate(
//       { user: new ObjectId(userId) },
//       { $set: updatedProfile },
//       { returnOriginal: false }
//     );
//     if (updateProfileResult.ok === 1) {
//       console.log(`Profile for ${userName} updated`);
//       return updateProfileResult.value._id;
//     }
//   } else {
//     // Create a profile for the user
//     const profileId = await createStudentProfile(userId, userName, studentId);
//     return profileId;
//   }
// };
// export const fetchReferralInfo = async (refferalID: string) => {
//   // Get the referral information from the referral collection
//   const db = await getMongoDb();
//   const collection = db.collection('Referral');
//   const result = await collection.findOne({ _id: new ObjectId(refferalID) });
//   return result;
// };
// export const fetchTutorInfo = async (tutorId: string) => {
//   // Get the tutor information from the tutor collection
//   const db = await getMongoDb();
//   const collection = db.collection('Tutor');
//   const result = await collection.findOne({ _id: new ObjectId(tutorId) });
//   return result;
// };
// export const fetchAcademyInfoForTutor = async (tutorId: string) => {
//   // Get the academy information from the academy collection
//   const db = await getMongoDb();
//   const collection = db.collection('Academy');
//   const result = await collection.findOne({ tutor: new ObjectId(tutorId) });
//   return result;
// };
// export const checkUserExists = async (mobileNum: string) => {
//   const db = await getMongoDb();
//   const collection = db.collection('User');
//   const user = await collection.findOne({ mobileNum });
//   return user;
// };
// export const createUser = async (user: IUser) => {
//   const db = await getMongoDb();
//   const collection = db.collection('User');
//   const result = await collection.insertOne(user);
//   if (result.result.ok === 1) {
//     console.log(`User ${user.fullName} created`);
//     return result.insertedId;
//   } else {
//     console.log(`User ${user.fullName} creation failed`);
//     return null;
//   }
// };
// export const markReferralAsInvalid = async (refferalID: string) => {
//   // Get the referral information from the referral collection
//   const db = await getMongoDb();
//   const collection = db.collection('Referral');
//   const result = await collection.findOneAndUpdate(
//     { _id: new ObjectId(refferalID) },
//     { $set: { valid: false } },
//     { returnOriginal: false }
//   );
//   if (result.ok === 1) {
//     console.log(`Referral ${refferalID} marked as invalid`);
//     return result.value;
//   }
//   return null;
// };
// export const fetchUserWithMobileNumber = async (mobileNum: string) => {
//   const db = await getMongoDb();
//   const userCollection = db.collection('User');
//   const user = await userCollection.findOne({ mobileNum });
//   return user;
// };
// export const deduceUserRoleFromProfileType = (
//   profileType: NewUserProfileType
// ): UserRole | null => {
//   switch (profileType) {
//     case NewUserProfileType.STUDENT:
//       return UserRole.STUDENT;
//     case NewUserProfileType.TUTOR:
//       return UserRole.TUTOR;
//     case NewUserProfileType.STAFF:
//       return UserRole.STAFF;
//     default:
//       return null;
//   }
// };
// export const updateAllClassInstances = async (
//   parentDefId: string,
//   dateTime: string,
//   dataToUpdate: any
// ) => {
//   const db = await getMongoDb();
//   const client = getMongoClient();
//   const transactionSession = client.startSession();
//   const transactionOptions: TransactionOptions = {
//     readPreference: 'primary',
//     readConcern: { level: 'local' },
//     writeConcern: { w: 'majority' },
//   };
//   const classCollection = db.collection('Session');
//   try {
//     await transactionSession.withTransaction(async () => {
//       const updateRsp = await classCollection.updateMany(
//         {
//           type: 'Instance',
//           parentDef: new ObjectId(parentDefId),
//           startTime: {
//             $gte: new Date(dateTime),
//           },
//         },
//         {
//           $set: dataToUpdate,
//         }
//       );
//       if (updateRsp && updateRsp.modifiedCount) {
//         console.log(
//           `${updateRsp.modifiedCount} records have been updated for class def id: ${parentDefId}`
//         );
//       }
//     }, transactionOptions);
//   } catch (err) {
//     console.log('Error while updating instances', err);
//   } finally {
//     await transactionSession.endSession();
//     await client.close();
//   }
// };
const updateDateInClassDef = (id, date) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    return yield db.collection('Session').updateOne({
        '_id': new mongodb_1.ObjectId(id)
    }, {
        $set: {
            'recurrence.neverEndDate': date
        }
    });
});
exports.updateDateInClassDef = updateDateInClassDef;
const fetchAllActiveClassDef = (variable) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const allActiveClasses = yield db.collection('Session').find(variable).toArray();
    return allActiveClasses;
});
exports.fetchAllActiveClassDef = fetchAllActiveClassDef;
const createSession = (session) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    return yield db.collection('Session').insertOne(session);
});
exports.createSession = createSession;
const createParticipants = (participants) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    if (participants != null && participants.length > 0) {
        return yield db.collection('Participant').insertMany(participants);
    }
    return null;
});
exports.createParticipants = createParticipants;
const deleteParticipants = (sessionIds) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const filter = {
        session: {
            $in: sessionIds,
        },
    };
    return yield db.collection('Participant').deleteMany(filter);
});
exports.deleteParticipants = deleteParticipants;
const updateSession = (id, input) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    yield db.collection('Session').updateOne({
        _id: new mongodb_1.ObjectId(id),
    }, {
        $set: Object.assign({}, input),
    });
});
exports.updateSession = updateSession;
const listAllSessions = (variable) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    return yield db.collection('Session').find(variable).toArray();
});
exports.listAllSessions = listAllSessions;
const deleteSession = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    yield db.collection('Session').deleteOne({
        _id: new mongodb_1.ObjectId(id),
    });
});
exports.deleteSession = deleteSession;
function lastSessionInstance(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const pipeLine = [
            { $match: { 'parentDef': new mongodb_1.ObjectId(id) } },
            { $group: { _id: '$_id', result: { $push: '$$ROOT' } } },
            { $sort: { _id: -1 } },
            { $limit: 1 }
        ];
        const db = yield (0, mongo_1.getMongoDb)();
        const lastInstance = yield db.collection('Session').aggregate(pipeLine);
        let resultDoc;
        const result = yield lastInstance.forEach((document) => {
            resultDoc = JSON.stringify(document.result[0]);
            return;
        });
        return new Promise((resolve) => {
            if (resultDoc !== undefined && resultDoc != null) {
                return resolve(resultDoc);
            }
        });
    });
}
exports.lastSessionInstance = lastSessionInstance;
const getAllTutor = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const tutors = yield db.collection('Tutor').find({ primaryTutorId: { $exists: true } }, query).toArray();
    return tutors;
});
exports.getAllTutor = getAllTutor;
// export const getMyStudentsCount = async (tutorId: ObjectId) => {
//   console.log("TUTOR ID :::::: => " + tutorId);
//   const db = await getMongoDb();
//   const totalDocMatched = await db.collection('Student').countDocuments({
//     'tutor':tutorId
//   });
//   console.log('TOTAL MATCAHED :::: ' + totalDocMatched)
//   return totalDocMatched;
//   // return new Promise((resolve : any)=>{
//   //   if(totalDocMatched !== undefined && totalDocMatched != null){
//   //     return resolve(totalDocMatched.toString());       
//   //   }
//   // })
//   // return totalDocMatched.then((value:any)=> {
//   //   if(value != undefined || value !=null){
//   //     console.log("VALUES ::: =>" + value );
//   //     return value.toString();
//   //   }
//  // })
// }
const getMyStudentsCount = (tutorId) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const result = yield db.collection('Student').countDocuments({
        'tutor': tutorId
    });
    return result;
});
exports.getMyStudentsCount = getMyStudentsCount;
const getTotalNoOfStaff = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const query = { user: new mongodb_1.ObjectId(userId), role: 'Staff' };
    const queryResult = { '_id': 1 };
    const getTotalStaff = yield db.collection('Tutor').find(query, queryResult).toArray();
    return getTotalStaff.length;
});
exports.getTotalNoOfStaff = getTotalNoOfStaff;
const getAllStudent = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const students = yield db.collection('Student').find({}, query).toArray();
    return students;
});
exports.getAllStudent = getAllStudent;
const getAllUserId = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const query = { "_id": 0, "user": '$_id', "name": '$fullName', 'role': '$roles' };
    const pipeLine = [{ $project: query }];
    const users = yield db.collection('User').aggregate(pipeLine).toArray();
    console.log("USERS LENGTH : ===> " + users.length);
    return users;
});
exports.getAllUserId = getAllUserId;
const getTutorName = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const query = { students: { $in: userIds } };
    const queryResult = { _id: 0, user: 1, name: 1 };
    const students = yield db.collection('UserProfile').find(query, queryResult).toArray();
    return students;
});
exports.getTutorName = getTutorName;
const getUserProfile = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const query = { students: { $elemMatch: { $eq: studentId } } };
    const queryResult = { _id: 1 };
    const results = yield db.collection('UserProfile').find(query, queryResult).toArray();
    return results;
});
exports.getUserProfile = getUserProfile;
const getTutrorsId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const query = { user: new mongodb_1.ObjectId(userId), role: 'Admin' };
    const fetchData = { _id: 1, role: 1 };
    const result = yield db.collection('Tutor').find(query, fetchData).toArray();
    return result[0]._id;
});
exports.getTutrorsId = getTutrorsId;
const getTutors = (query, role) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, mongo_1.getMongoDb)();
    const tutorsList = yield db.collection('Tutor').find(query, role).toArray();
    console.log("TUTORS LIST WORKING ::: => " + tutorsList.length);
    return tutorsList;
});
exports.getTutors = getTutors;
