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
exports.generateTutorsReport = void 0;
const dayjs = require("dayjs");
const writeFileCsv_1 = require("./writeFileCsv");
const dbUtil_1 = require("../common/dbUtil");
const uploadFileGoogleDrive_1 = require("./uploadFileGoogleDrive");
const generateTutorsReport = () => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = process.env.REPORTTUTORFILENAME + dayjs().format("MM-DD-YYYY") + ".csv";
    const tutorStudentsFilePath = process.cwd() + "/" + fileName;
    console.log("TUTORFILE PATH : " + tutorStudentsFilePath);
    const tutorTable = {
        'tutorId': 'Tutor Id',
        'tutorName': 'Tutor Name',
        'totalNoOfStudent': 'Total Number Of Student',
        'totalNoOfStaff': 'Total Number Of Staff'
    };
    const tutorsInfo = {};
    const staffInfo = {};
    //creating Header 
    (0, writeFileCsv_1.writeCSVFile)(tutorStudentsFilePath, tutorTable);
    const userIds = [];
    const tutorIds = [];
    const fetchTutorStudentData = yield (0, dbUtil_1.getTutorsUsage)();
    for (let value of fetchTutorStudentData) {
        let userExistsInUserTable = value.userData.length > 0;
        if (userExistsInUserTable) {
            let tutorId = value._id.toString();
            userIds.push(value.userData[0]._id);
            tutorIds.push(value._id.toString());
            let values = {
                tutorId: value._id.toString(),
                tutorName: value.userData[0].fullName,
                totalNoOfStudents: value.studentData.length,
                userId: value.userData[0]._id,
                userName: value.userData[0].fullName,
                roles: value.userData[0].roles
            };
            tutorsInfo[tutorId] = values;
        }
    }
    const fetchStaffData = yield (0, dbUtil_1.getTotalNoOfStaffInTutor)(tutorIds);
    for (let staffValue of fetchStaffData) {
        if (!staffInfo[staffValue.primaryTutorId]) {
            staffInfo[staffValue.primaryTutorId] = [staffInfo[staffValue._id.toString()]];
        }
        else {
            staffInfo[staffValue.primaryTutorId].push(staffValue._id.toString());
        }
    }
    const listOfStaffIds = Object.keys(staffInfo);
    for (let index = 0; index < listOfStaffIds.length; index++) {
        tutorsInfo[listOfStaffIds[index]].totalNoOfStaff = staffInfo[listOfStaffIds[index]].length;
    }
    for (let index = 0; index < tutorIds.length; index++) {
        tutorTable.tutorId = tutorsInfo[tutorIds[index]].tutorId;
        tutorTable.tutorName = tutorsInfo[tutorIds[index]].tutorName;
        tutorTable.totalNoOfStudent = tutorsInfo[tutorIds[index]].totalNoOfStudents;
        tutorTable.totalNoOfStaff = (tutorsInfo[tutorIds[index]].totalNoOfStaff == undefined ? 0 :
            tutorsInfo[tutorIds[index]].totalNoOfStaff);
        (0, writeFileCsv_1.writeCSVFile)(tutorStudentsFilePath, tutorTable);
    }
    yield (0, uploadFileGoogleDrive_1.fileUploadGoogleDrive)(tutorStudentsFilePath, fileName);
});
exports.generateTutorsReport = generateTutorsReport;
