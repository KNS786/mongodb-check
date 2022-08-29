import { MongoClient,Db,ObjectId  } from "mongodb";

let cachedDb: Db | undefined;
let mongoClient : MongoClient;

export const getMongoClient = (): MongoClient => {
    return mongoClient;
};


export async function getMongoDb(): Promise<Db> {
    //   const mongoConnectionString = `process.env.MONGO_CONNECTION_STRING_${envName}`;
    //   if (!mongoConnectionString) {
    //     console.log(
    //       `No mongo connection string defined in environment variable. Could not find ${mongoConnectionString}`
    //     );
    //     throw new Error('No mongo connection string');
    //   }
    let mongoConnectionString = 'mongodb://localhost:27017';
    const mongoClient:any = new MongoClient(mongoConnectionString);
    
    await mongoClient.connect();
    console.log("MongoClint is connected ......");
    const db = mongoClient.db('admin');
    // await lastSessionInstance(db,'62fcdd959005dee529289177');
    return db;
  }

  export const lastSessionInstance = async (db:any,id: any) => {
    const pipeLine = [
      { $match: {'parentDef': new ObjectId(id)} },
      { $group: { _id :'$_id', result :{$push : '$$ROOT'} } },
      { $sort:  { _id : -1}},
      { $limit : 1}
    ]
  
    const lastInstance = await db.collection('Session').aggregate(pipeLine);
    console.log("LAST INSTANCES ::: => " + lastInstance);
    await lastInstance.forEach((value:any)=>{
      console.log("_id ::: " + value._id +" resile :::: " + JSON.stringify(value.result) );
    })
  }