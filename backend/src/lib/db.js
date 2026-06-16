import mongoose from "mongoose"
import dns from 'dns';

dns.setServers(["1.1.1.1", "8.8.8.8"]);

export async function connectDatabase() {
  try{
    const databaseURI = process.env.DATABASE_MONGODB_URI;

    if(databaseURI == undefined){
      throw new Error("Mongo Url is not present");
    }

    const connection = await mongoose.connect(databaseURI);
    console.log("Database Connection is Successful : CODE", connection.connection.host);
    
  } catch(error){
    console.error(error);
    process.exit(1);
  }
}
