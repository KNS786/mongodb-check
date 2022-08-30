import { generateTutorsReport } from "./tutora-usage-new/tutoraUsage";
import { generateUsersReport } from "./tutora-usage-new/userInfo";
import dotenv from "dotenv";
dotenv.config();

async function start() {
  await generateTutorsReport();
  await generateUsersReport();
}
start();
