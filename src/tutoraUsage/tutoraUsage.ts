import {
    getAllTutor,
    getMyStudentsCount,
    getTutorName,
    getUserProfile,
    getTutrorsId,
    getTotalNoOfStaff,
    getTutors,
    getAllUserId
} from '../common/dbUtil';

import fs from 'fs';
import dayjs from 'dayjs'
import {google} from 'googleapis';
import { ObjectId } from 'mongodb';


function writeCSVFile(fileName:any,data: any){
  const sepeartor = ",";
  const logger = fs.createWriteStream(fileName,{
    flags:'a'
  });
  const writeLine = (line: any ) =>{
    logger.write(`${line}\n`);
  }
  writeLine(data.tutorId + sepeartor + data.name + sepeartor + data.totalStudent + sepeartor + data.totalNoOfStaff);

}


function writeCSVFileData(fileName:any, data: any){
  const sepeartor = ",";
  const logger = fs.createWriteStream(fileName,{
    flags:'a'
  });
  const writeLine = (line: any ) =>{
    logger.write(`${line}\n`);
  }

  let result="";
  if(data.role =='Role') result = data.role;
  const roles = data.role ;
  if(roles.length == 1){
    result = roles[0];
  }
  else{
    for(let i=0;i<roles.length;i++){
      result += (i+1)+"."+roles[i]+" "; 
    }
  }
  writeLine(data.userId +sepeartor+data.name+sepeartor+result+sepeartor+data.tutorName);
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


async function fileUploadGoogleDrive(fileName: any ){

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
    'name':"tutora-usage-"+dayjs().format("MM-DD-YYYY")+".csv",
    'parents':[GOOGLE_API_FOLDER_ID]
   }

   const media = {
     MimeType : 'text/csv',
     body: fs.createReadStream(fileName)
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


export async function processRecord(){

  // const tutorsQuery = {primaryTutorId: 1, name: 1};
  // const tutorTable:any = {tutorId: "Tutor Id", name: "Tutor Name", totalStudent: "Students" }
  // writeCSVFile(tutorTable);
  // const allTutors = await getAllTutor(tutorsQuery);
  // for(const value of allTutors){
  //   tutorTable.tutorId = value.primaryTutorId;
  //   tutorTable.name = value.name;
  //   tutorTable.totalStudent = await getMyStudentsCount(value.primaryTutorId);
  //   writeCSVFile(tutorTable);
  // }

  const tutorStudentsFilePath = process.cwd()+"/tutora-usage-tutors_students-"+dayjs().format("MM-DD-YYYY")+".csv";
  const userFilePath = process.cwd()+"/tutora-usage-users-"+dayjs().format("MM-DD-YYYY")+".csv"


  const getAllUsersId = await getAllUserId();
  console.log("GET ALL USER ID ::: => " + getAllUsersId);
  let users:any = {}
  let userRoles:any = {};
  for(let value of getAllUsersId){
    users[value.user] =  value.name;
    console.log("ROLES ::: =>" + value.role);
    userRoles[value.user] = value.role;
  }
  console.log("OBJECT VALUES ::: => " + userRoles);

  const usersIds = Object.keys(users).map(value => new ObjectId(value));
  console.log("USERS::: => " + Object.keys(users));
  console.log("USERS VALES ::: => "+ Object.values(users));
  const query = {'role':'Admin','user':{$in: usersIds}}
  const queryResult = {'user':1};
  const result = await getTutors(query,queryResult);
  console.log("RESULT VALUES ::: => " + result);
  const tutorTable:any = {tutorId: "Tutor Id", name: "Tutor Name", totalStudent: "Total Number Of Student" , totalNoOfStaff:'Total Number Of Staff'};
  writeCSVFile(tutorStudentsFilePath,tutorTable);
  for(const value of result){
    console.log("VALUES STARTED :::: => " + value);
    tutorTable.tutorId = value.user;
    console.log("VALUE.USER ::: => " + value.user);
    tutorTable.name = users[value.user];
    console.log("VALUE.NAME ::: => " + users[value.user]);
    let tutorId = await getTutrorsId(value.user);
    console.log("TUTORS ID :::: => " + tutorId);
    tutorTable.totalStudent = await getMyStudentsCount(tutorId);
    console.log("TOTAL STUDENTS ::: =>" + tutorTable.totalStudent);
    tutorTable.totalNoOfStaff = await getTotalNoOfStaff(value.user);
    console.log("TOTAL STAFFS :::: =>" + tutorTable.totalNoOfStaff)
    writeCSVFile(tutorStudentsFilePath,tutorTable);
  }
  await fileUploadGoogleDrive(tutorStudentsFilePath);

  const userTable: any = {userId:'User Id',name : 'User Name',role : 'Role',tutorName:'Tutor Name'}
  writeCSVFileData(userFilePath,userTable);
  const getUserAsStudent = await getTutorName(usersIds);
  const usersResults:any = {};
  const userIds = Object.keys(users);
  const userNames = Object.values(users);
  const usersRole = Object.values(userRoles);
  for(let i=0;i<userIds.length;i++){
    if(!usersResults[userIds[i]]){
      usersResults[userIds[i]] = {};
    }
    usersResults[userIds[i]].userId = userIds[i];
    usersResults[userIds[i]].name = userNames[i];
    usersResults[userIds[i]].role = usersRole[i];
    usersResults[userIds[i]].tutorName =''; 
    let results = await getUserProfile(new ObjectId(userIds[i]));
    if(results.length > 0){
      usersResults[userIds[i]].tutorName = results[0].name;
    }

  }


  for(let ind in usersResults){
    let value = usersResults[ind];
    userTable.userId = value.userId;
    userTable.name = value.name;
    userTable.role = value.role;
    userTable.tutorName = value.tutorName;
    writeCSVFileData(userFilePath,userTable);
  }

  await fileUploadGoogleDrive(userFilePath);

  // const tutorsQuery = { name:1, students:1, user:1 }
  // const allTutorsInUserProfile = await getTutorsId(tutorsQuery);
  // const tutorsTable = {tutorId:'Tutor Id', name: 'Tutor Name',totalStudent:'total Students', students : [] }
  // const tutorsInfo:any = [];
  // allTutorsInUserProfile.forEach((value) => {
  //   console.log("_id ::: " + value._id);
  //   tutorsTable.tutorId = value.user;
  //   tutorsTable.name = value.name;
  //   tutorsTable.totalStudent = value.students.length;
  //   tutorsTable.students = value.students;
  //   console.log("STUDENTS LENGTH :::: => " + value.students.length );
  //   tutorsInfo.push(tutorsTable);
  // });
  
}