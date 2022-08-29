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
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastSessionInstance = exports.getMongoDb = exports.getMongoClient = void 0;
const mongodb_1 = require("mongodb");
let cachedDb;
let mongoClient;
const getMongoClient = () => {
    return mongoClient;
};
exports.getMongoClient = getMongoClient;
function getMongoDb() {
    return __awaiter(this, void 0, void 0, function* () {
        //   const mongoConnectionString = `process.env.MONGO_CONNECTION_STRING_${envName}`;
        //   if (!mongoConnectionString) {
        //     console.log(
        //       `No mongo connection string defined in environment variable. Could not find ${mongoConnectionString}`
        //     );
        //     throw new Error('No mongo connection string');
        //   }
        let mongoConnectionString = 'mongodb://localhost:27017';
        const mongoClient = new mongodb_1.MongoClient(mongoConnectionString);
        yield mongoClient.connect();
        console.log("MongoClint is connected ......");
        const db = mongoClient.db('admin');
        // await lastSessionInstance(db,'62fcdd959005dee529289177');
        return db;
    });
}
exports.getMongoDb = getMongoDb;
const lastSessionInstance = (db, id) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeLine = [
        { $match: { 'parentDef': new mongodb_1.ObjectId(id) } },
        { $group: { _id: '$_id', result: { $push: '$$ROOT' } } },
        { $sort: { _id: -1 } },
        { $limit: 1 }
    ];
    const lastInstance = yield db.collection('Session').aggregate(pipeLine);
    console.log("LAST INSTANCES ::: => " + lastInstance);
    yield lastInstance.forEach((value) => {
        console.log("_id ::: " + value._id + " resile :::: " + JSON.stringify(value.result));
    });
});
exports.lastSessionInstance = lastSessionInstance;
