import mongoose from "mongoose";

const connecttoMongo = () => {
  mongoose.connect(process.env.db_uri, { dbName: "My_Course" }).then((data) => {
    console.log(`DataBase connected Sucessfully  with ${data.connection.host}`);
  });
};
export default connecttoMongo;
