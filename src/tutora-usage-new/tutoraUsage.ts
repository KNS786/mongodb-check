import dayjs = require('dayjs');
import { writeCSVFile } from './writeFileCsv';
import {
    getTutorsUsage,
    getTotalNoOfStaffInTutor
} from '../common/dbUtil';
import {fileUploadGoogleDrive} from './uploadFileGoogleDrive';


export const generateTutorsReport = async () => {
  const fileName = process.env.REPORTTUTORFILENAME + dayjs().format("MM-DD-YYYY")+".csv"
  const tutorStudentsFilePath = process.cwd()+"/"+fileName;
  console.log("TUTORFILE PATH : " + tutorStudentsFilePath);
  const tutorTable = {
    'tutorId': 'Tutor Id',
    'tutorName': 'Tutor Name',
    'totalNoOfStudent': 'Total Number Of Student',
    'totalNoOfStaff': 'Total Number Of Staff'
  };

  const tutorsInfo : any = {};
  const staffInfo : any = {};

  //creating Header 
  writeCSVFile(tutorStudentsFilePath,tutorTable);

  const userIds = [];
  const tutorIds = [];
  const fetchTutorStudentData:any  = await getTutorsUsage();
  for(let value of fetchTutorStudentData){
    let userExistsInUserTable = value.userData.length > 0 ;
    if(userExistsInUserTable){
        let tutorId = value._id.toString();
        userIds.push(value.userData[0]._id);
        tutorIds.push(value._id.toString());
            let values = {
                tutorId: value._id.toString(),
                tutorName: value.userData[0].fullName,
                totalNoOfStudents: value.studentData.length,
                userId: value.userData[0]._id,
                userName : value.userData[0].fullName,
                roles : value.userData[0].roles
            };
            tutorsInfo[tutorId] = values;
        }
    }

  const fetchStaffData = await getTotalNoOfStaffInTutor(tutorIds);
  for(let staffValue of fetchStaffData){
    if(!staffInfo[staffValue.primaryTutorId]){
        staffInfo[staffValue.primaryTutorId] = [staffInfo[staffValue._id.toString()]];
    }
    else{
        staffInfo[staffValue.primaryTutorId].push(staffValue._id.toString());
    }
  }
  
  const listOfStaffIds  = Object.keys(staffInfo);
  for(let index = 0;index < listOfStaffIds.length;index++){
    tutorsInfo[listOfStaffIds[index]].totalNoOfStaff = staffInfo[listOfStaffIds[index]].length;
  }

  for(let index = 0;index < tutorIds.length;index++){
    tutorTable.tutorId = tutorsInfo[tutorIds[index]].tutorId;
    tutorTable.tutorName = tutorsInfo[tutorIds[index]].tutorName;
    tutorTable.totalNoOfStudent = tutorsInfo[tutorIds[index]].totalNoOfStudents;
    tutorTable.totalNoOfStaff = ( 
        tutorsInfo[tutorIds[index]].totalNoOfStaff == undefined ? 0: 
        tutorsInfo[tutorIds[index]].totalNoOfStaff 
    );
    writeCSVFile(tutorStudentsFilePath,tutorTable);
  }
  await fileUploadGoogleDrive(tutorStudentsFilePath,fileName);
  
}