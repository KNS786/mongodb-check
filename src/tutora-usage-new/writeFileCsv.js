"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeUserDataInCSV = exports.writeCSVFile = void 0;
const fs_1 = __importDefault(require("fs"));
const writeCSVFile = (fileName, data) => {
    const sepeartor = ",";
    const logger = fs_1.default.createWriteStream(fileName, {
        flags: 'a'
    });
    const writeLine = (line) => {
        logger.write(`${line}\n`);
    };
    writeLine(data.tutorId + sepeartor + data.tutorName + sepeartor + data.totalNoOfStudent + sepeartor + data.totalNoOfStaff);
};
exports.writeCSVFile = writeCSVFile;
const writeUserDataInCSV = (fileName, data) => {
    const sepeartor = ",";
    const logger = fs_1.default.createWriteStream(fileName, {
        flags: 'a'
    });
    const writeLine = (line) => {
        logger.write(`${line}\n`);
    };
    writeLine(data.userId + sepeartor + data.name + sepeartor + data.role + sepeartor + data.tutorName);
};
exports.writeUserDataInCSV = writeUserDataInCSV;
