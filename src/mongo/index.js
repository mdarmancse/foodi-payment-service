import { connect } from "mongoose";

const connectMongoDB = async () => {
  const dbUrl = process.env.MONGO_URI || "";
  const con = await connect(dbUrl);

  // mongoose.set('debug', true);
  console.log(
    `Connected to MongoDB at ${con.connection.host}:${con.connection.port}`,
  );
};

export default connectMongoDB;
