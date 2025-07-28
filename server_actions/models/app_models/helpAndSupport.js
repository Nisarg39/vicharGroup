import mongoose from "mongoose"

const helpAndSupportSchema = new mongoose.Schema({
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
    }
  },{
    timestamps: true,
  });
  
  const HelpAndSupport = mongoose.models?.HelpAndSupport || mongoose.model("HelpAndSupport", helpAndSupportSchema);
  export default HelpAndSupport;