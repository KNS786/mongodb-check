import dayjs = require('dayjs');
import { writeUserDataInCSV } from './writeFileCsv';
import {ObjectId} from 'mongodb';
import {
    getAllUserId,
    getUserProfile
} from '../common/dbUtil';
import {fileUploadGoogleDrive} from './uploadFileGoogleDrive';


export const generateUsersReport = async () => {

 const fileName = process.env.REPORTUSERFILENAME + dayjs().format("MM-DD-YYYY")+".csv";
 const userFilePath = process.cwd() + "/" + fileName;
 const userTable: any = {
    userId:'User Id',
    name : 'User Name',
    role : 'Role',
    tutorName:'Tutor Name'
 }
 const users:any = {}
 const userRoles:any = {};
 const getAllUsersId = await getAllUserId();

  for(let value of getAllUsersId){
    users[value.user] =  value.name;
    userRoles[value.user] = value.role;
  }
 writeUserDataInCSV(userFilePath,userTable);

 const usersResults:any = {};
 const userIds = Object.keys(users);
 const userNames = Object.values(users);
 const usersRole = Object.values(userRoles);
 const tutorNames:any = {};
 for(let i=0;i<userIds.length;i++){
   if(!usersResults[userIds[i]]){
     usersResults[userIds[i]] = {};
   }
   usersResults[userIds[i]].userId = userIds[i];
   usersResults[userIds[i]].name = userNames[i];
   usersResults[userIds[i]].role = usersRole[i];
   let results = await getUserProfile(new ObjectId(userIds[i]));
   if(results.length > 0){
    for(let index=0;index < results.length;index++){
     if(!tutorNames[userIds[i]])
     {
      tutorNames[userIds[i]] = [results[index].name];
     }
     else{
      tutorNames[userIds[i]].push(results[index].name);
     }
    }
    usersResults[userIds[i]].tutorName = Object.values(tutorNames[userIds[i]]); 
   }
   else{
    usersResults[userIds[i]].tutorName ='';
   }

 }

 for(let index in usersResults){
   let value = usersResults[index];
   userTable.userId = value.userId;
   userTable.name = value.name;
   userTable.role = value.role;
   if(value.tutorName.length == 1 ){
    userTable.tutorName = value.tutorName[0];
   }
   else if(value.tutorName.length > 1 ){
    let result = "";
    for(let index = 0;index < value.tutorName.length; index++){
      result += (index+1) +"."+value.tutorName[index]+" ";
    }
    userTable.tutorName = result;
   }
   else{
    userTable.tutorName = value.tutorName;
   }
   let result = "";
   if(userTable.role.length == 1){
    userTable.role = userTable.role[0];
  }
  else if(userTable.role.length > 1){
    for(let i=0;i<userTable.role.length;i++){
      result += (i+1)+"."+userTable.role[i]+" "; 
    }
    userTable.role = result;
   }
   writeUserDataInCSV(userFilePath,userTable);
 }

 await fileUploadGoogleDrive(userFilePath,fileName);
}