import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      maxlength: [20, "a user name must be less or equal to 40 charecters"],
      minlength: [8, "a user name must be more or equal to 8 charecters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "A user must have an Email ID"],
      unique: [true, "this email id is already registerd"],
    },
    password: {
      type: String,
      minlength: [8, "password can not be less than 8 charecter"],
      maxlength: [30, "password can not be more than 30 charecter"],
      required: [true, "please Enter a valid passowrd"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "please Confirm your password"],

      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not equal",
      },
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user", "employee"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// hash the password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });
const User = mongoose.model("User", userSchema);

export default User;
