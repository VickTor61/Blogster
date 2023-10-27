import { set, connect } from "mongoose";


const connectDB = async () => {
  try {
    set("strictQuery", false);
    console.log(process.env.MONGO_URL);
    const conn = await connect(process.env.MONGO_URL,  { useUnifiedTopology: true, useNewUrlParser: true } );
    console.dir(`Database connected successfully at ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
 