import mongoose from "mongoose"

const FeelingConfusedSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Student',
    },
    message: {
      type: String,
      required: true,
    },
    seen : {
        type: Boolean,
        default: false,
    },
    contacted : {
        type: Boolean,
        default: false,
    },
    streamName:{
        type: String,
        enum: ["JEE", "NEET", "MHT-CET", "SSC", "ICSE", "CSBE", ]
    }
  },{
    timestamps: true,
  });
  
  const FeelingConfused = mongoose.models?.FeelingConfused || mongoose.model("FeelingConfused", FeelingConfusedSchema);
  export default FeelingConfused;