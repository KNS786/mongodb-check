import fs from 'fs';

export const writeCSVFile = (fileName:any, data: any) =>{
  const sepeartor = ",";
  const logger = fs.createWriteStream(fileName,{
      flags:'a'
  });
  const writeLine = (line: any ) =>{
    logger.write(`${line}\n`);
  }
  writeLine(data.tutorId + sepeartor + data.tutorName + sepeartor + data.totalNoOfStudent + sepeartor + data.totalNoOfStaff);
    
}

export const writeUserDataInCSV  = (fileName:any, data:any) => {
  const sepeartor = ",";
  const logger = fs.createWriteStream(fileName,{
    flags:'a'
  });
  const writeLine = (line: any ) =>{
    logger.write(`${line}\n`);
  }

  writeLine(data.userId +sepeartor+data.name+sepeartor+data.role+sepeartor+data.tutorName);
}