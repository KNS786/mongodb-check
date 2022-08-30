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
exports.processRecord = void 0;
const dbUtil_1 = require("../common/dbUtil");
const fs_1 = __importDefault(require("fs"));
const dayjs_1 = __importDefault(require("dayjs"));
const googleapis_1 = require("googleapis");
const mongodb_1 = require("mongodb");
function writeCSVFile(fileName, data) {
    const sepeartor = ",";
    const logger = fs_1.default.createWriteStream(fileName, {
        flags: 'a'
    });
    const writeLine = (line) => {
        logger.write(`${line}\n`);
    };
    writeLine(data.tutorId + sepeartor + data.name + sepeartor + data.totalStudent + sepeartor + data.totalNoOfStaff);
}
function writeCSVFileData(fileName, data) {
    const sepeartor = ",";
    const logger = fs_1.default.createWriteStream(fileName, {
        flags: 'a'
    });
    const writeLine = (line) => {
        logger.write(`${line}\n`);
    };
    let result = "";
    if (data.role == 'Role')
        result = data.role;
    const roles = data.role;
    if (roles.length == 1) {
        result = roles[0];
    }
    else {
        for (let i = 0; i < roles.length; i++) {
            result += (i + 1) + "." + roles[i] + " ";
        }
    }
    writeLine(data.userId + sepeartor + data.name + sepeartor + result + sepeartor + data.tutorName);
}
// export async function processRecord(){
//    const tutorsQuery = {primaryTutorId: 1, name: 1};
//    const studentsQuery = { _id: 1, name: 1, isActive: 1};
//    const allTutors = await getAllTutor(tutorsQuery);
//    const tutorTable = {tutorId: String, name: String, totalStudent: String }
//    allTutors.forEach(async(info: any) => {
//     tutorTable.tutorId = info.primaryTutorId;
//     tutorTable.name = info.name;
//     let totalStudent:any = await getMyStudentsCount(info._id);
//     tutorTable.totalStudent  = totalStudent;
//     //console.log("TUTOR TABLE :::: => " + tutorTable);
//     await writeCSVFile("tutors",tutorTable);
//    });
// //    const allStudents = await getAllStudent(studentsQuery);
// //    const studentTable = {}
// //    allStudents.forEach(async(info: any)=>{
// //    })
// }
function fileUploadGoogleDrive(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const GOOGLE_API_FOLDER_ID = '1NhR39ctkVvBJh4cVlDtfVMNESJ28SsBp';
            const auth = new googleapis_1.google.auth.GoogleAuth({
                keyFile: './googlekey.json',
                scopes: ['https://www.googleapis.com/auth/drive']
            });
            const driveService = googleapis_1.google.drive({
                version: 'v3',
                auth
            });
            const fileMetaData = {
                'name': "tutora-usage-" + (0, dayjs_1.default)().format("MM-DD-YYYY") + ".csv",
                'parents': [GOOGLE_API_FOLDER_ID]
            };
            const media = {
                MimeType: 'text/csv',
                body: fs_1.default.createReadStream(fileName)
            };
            const response = yield driveService.files.create({
                requestBody: fileMetaData,
                media: media,
                fields: 'id'
            });
            return response.data.id;
        }
        catch (err) {
            console.log("Error ::: => " + err);
        }
    });
}
function processRecord() {
    return __awaiter(this, void 0, void 0, function* () {
        const tutorStudentsFilePath = process.cwd() + "/tutora-usage-tutors_students-" + (0, dayjs_1.default)().format("MM-DD-YYYY") + ".csv";
        const userFilePath = process.cwd() + "/tutora-usage-users-" + (0, dayjs_1.default)().format("MM-DD-YYYY") + ".csv";
        const getAllUsersId = yield (0, dbUtil_1.getAllUserId)();
        console.log("GET ALL USER ID ::: => " + getAllUsersId);
        let users = {};
        let userRoles = {};
        for (let value of getAllUsersId) {
            users[value.user] = value.name;
            console.log("ROLES ::: =>" + value.role);
            userRoles[value.user] = value.role;
        }
        console.log("OBJECT VALUES ::: => " + userRoles);
        const usersIds = Object.keys(users).map(value => new mongodb_1.ObjectId(value));
        console.log("USERS::: => " + Object.keys(users));
        console.log("USERS VALES ::: => " + Object.values(users));
        const query = { 'role': 'Admin', 'user': { $in: usersIds } };
        const queryResult = { 'user': 1 };
        const result = yield (0, dbUtil_1.getTutors)(query, queryResult);
        console.log("RESULT VALUES ::: => " + result);
        const tutorTable = { tutorId: "Tutor Id", name: "Tutor Name", totalStudent: "Total Number Of Student", totalNoOfStaff: 'Total Number Of Staff' };
        writeCSVFile(tutorStudentsFilePath, tutorTable);
        for (const value of result) {
            console.log("VALUES STARTED :::: => " + value);
            tutorTable.tutorId = value.user;
            console.log("VALUE.USER ::: => " + value.user);
            tutorTable.name = users[value.user];
            console.log("VALUE.NAME ::: => " + users[value.user]);
            let tutorId = yield (0, dbUtil_1.getTutrorsId)(value.user);
            console.log("TUTORS ID :::: => " + tutorId);
            tutorTable.totalStudent = yield (0, dbUtil_1.getMyStudentsCount)(tutorId);
            console.log("TOTAL STUDENTS ::: =>" + tutorTable.totalStudent);
            tutorTable.totalNoOfStaff = yield (0, dbUtil_1.getTotalNoOfStaff)(value.user);
            console.log("TOTAL STAFFS :::: =>" + tutorTable.totalNoOfStaff);
            writeCSVFile(tutorStudentsFilePath, tutorTable);
        }
        yield fileUploadGoogleDrive(tutorStudentsFilePath);
        const userTable = { userId: 'User Id', name: 'User Name', role: 'Role', tutorName: 'Tutor Name' };
        writeCSVFileData(userFilePath, userTable);
        const getUserAsStudent = yield (0, dbUtil_1.getTutorName)(usersIds);
        const usersResults = {};
        const userIds = Object.keys(users);
        const userNames = Object.values(users);
        const usersRole = Object.values(userRoles);
        for (let i = 0; i < userIds.length; i++) {
            if (!usersResults[userIds[i]]) {
                usersResults[userIds[i]] = {};
            }
            usersResults[userIds[i]].userId = userIds[i];
            usersResults[userIds[i]].name = userNames[i];
            usersResults[userIds[i]].role = usersRole[i];
            usersResults[userIds[i]].tutorName = '';
            let results = yield (0, dbUtil_1.getUserProfile)(new mongodb_1.ObjectId(userIds[i]));
            if (results.length > 0) {
                usersResults[userIds[i]].tutorName = results[0].name;
            }
        }
        for (let ind in usersResults) {
            let value = usersResults[ind];
            userTable.userId = value.userId;
            userTable.name = value.name;
            userTable.role = value.role;
            userTable.tutorName = value.tutorName;
            writeCSVFileData(userFilePath, userTable);
        }
        yield fileUploadGoogleDrive(userFilePath);
    });
}
exports.processRecord = processRecord;
