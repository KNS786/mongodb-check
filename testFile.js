const fs = require('fs');

function writeCSVFile(data){
    const fileName = process.cwd()+"\\tutora-usage"+new Date("DD-MM-YYYY")+".csv";
    console.log("FILENAME ::: => " + fileName);
    const sepeartor = ",";
    const logger = fs.createWriteStream(fileName,{
      flags:'a'
    });
    const writeLine = (line) =>{
      logger.write(`${line}\n`);
    }
    writeLine(data.tutorId + sepeartor + data.name + sepeartor + data.totalStudent);
  
}
var data = {
    tutorId:"124",
    "name":"navani",
    totalStudent:10
}

writeCSVFile(data);