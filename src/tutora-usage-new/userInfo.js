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
exports.generateUsersReport = void 0;
const dayjs = require("dayjs");
const writeFileCsv_1 = require("./writeFileCsv");
const mongodb_1 = require("mongodb");
const dbUtil_1 = require("../common/dbUtil");
const uploadFileGoogleDrive_1 = require("./uploadFileGoogleDrive");
const generateUsersReport = () => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = process.env.REPORTUSERFILENAME + dayjs().format("MM-DD-YYYY") + ".csv";
    const userFilePath = process.cwd() + "/" + fileName;
    const userTable = {
        userId: 'User Id',
        name: 'User Name',
        role: 'Role',
        tutorName: 'Tutor Name'
    };
    const users = {};
    const userRoles = {};
    const getAllUsersId = yield (0, dbUtil_1.getAllUserId)();
    for (let value of getAllUsersId) {
        users[value.user] = value.name;
        userRoles[value.user] = value.role;
    }
    (0, writeFileCsv_1.writeUserDataInCSV)(userFilePath, userTable);
    const usersResults = {};
    const userIds = Object.keys(users);
    const userNames = Object.values(users);
    const usersRole = Object.values(userRoles);
    const tutorNames = {};
    for (let i = 0; i < userIds.length; i++) {
        if (!usersResults[userIds[i]]) {
            usersResults[userIds[i]] = {};
        }
        usersResults[userIds[i]].userId = userIds[i];
        usersResults[userIds[i]].name = userNames[i];
        usersResults[userIds[i]].role = usersRole[i];
        let results = yield (0, dbUtil_1.getUserProfile)(new mongodb_1.ObjectId(userIds[i]));
        if (results.length > 0) {
            for (let index = 0; index < results.length; index++) {
                if (!tutorNames[userIds[i]]) {
                    tutorNames[userIds[i]] = [results[index].name];
                }
                else {
                    tutorNames[userIds[i]].push(results[index].name);
                }
            }
            usersResults[userIds[i]].tutorName = Object.values(tutorNames[userIds[i]]);
        }
        else {
            usersResults[userIds[i]].tutorName = '';
        }
    }
    for (let index in usersResults) {
        let value = usersResults[index];
        userTable.userId = value.userId;
        userTable.name = value.name;
        userTable.role = value.role;
        if (value.tutorName.length == 1) {
            userTable.tutorName = value.tutorName[0];
        }
        else if (value.tutorName.length > 1) {
            let result = "";
            for (let index = 0; index < value.tutorName.length; index++) {
                result += (index + 1) + "." + value.tutorName[index] + " ";
            }
            userTable.tutorName = result;
        }
        else {
            userTable.tutorName = value.tutorName;
        }
        let result = "";
        if (userTable.role.length == 1) {
            userTable.role = userTable.role[0];
        }
        else if (userTable.role.length > 1) {
            for (let i = 0; i < userTable.role.length; i++) {
                result += (i + 1) + "." + userTable.role[i] + " ";
            }
            userTable.role = result;
        }
        (0, writeFileCsv_1.writeUserDataInCSV)(userFilePath, userTable);
    }
    yield (0, uploadFileGoogleDrive_1.fileUploadGoogleDrive)(userFilePath, fileName);
});
exports.generateUsersReport = generateUsersReport;
