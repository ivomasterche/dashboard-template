import { Schema, model, models } from "mongoose";

const AccountSchema = new Schema(
  {
    provider: {
      type: String,
      required: [true, "Name is required"],
    },
    userId: {
      $oid: String,
    },
  },
  { timestamps: true }
);

const Account = models.Account || model("Account", AccountSchema);

export default Account;
