import {google} from 'googleapis';
import fs from 'fs';
import dayjs from 'dayjs';

export async function fileUploadGoogleDrive(filePath: any, fileName: any){

    try{
     const GOOGLE_API_FOLDER_ID = '1NhR39ctkVvBJh4cVlDtfVMNESJ28SsBp';
     const auth = new google.auth.GoogleAuth({
      keyFile: './googlekey.json',
      scopes : ['https://www.googleapis.com/auth/drive']
     })
  
     const driveService = google.drive({
      version:'v3',
      auth
     })
  
     const fileMetaData = {
      'name':fileName,
      'parents':[GOOGLE_API_FOLDER_ID]
     }
  
     const media = {
       MimeType : 'text/csv',
       body: fs.createReadStream(filePath)
     }
  
     const response = await driveService.files.create({
      requestBody:fileMetaData,
      media : media,
      fields : 'id'
     })
  
     return response.data.id;
  
    }catch(err){
      console.log("Error ::: => " + err);
    }
  }