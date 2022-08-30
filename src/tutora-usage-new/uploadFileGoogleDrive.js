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
exports.fileUploadGoogleDrive = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
function fileUploadGoogleDrive(filePath, fileName) {
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
                'name': fileName,
                'parents': [GOOGLE_API_FOLDER_ID]
            };
            const media = {
                MimeType: 'text/csv',
                body: fs_1.default.createReadStream(filePath)
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
exports.fileUploadGoogleDrive = fileUploadGoogleDrive;
