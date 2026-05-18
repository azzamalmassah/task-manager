import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
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
      enum: ["admin", "user", "employee", "department-manager"],
      default: "user",
    },
    department: {
      type: String,
      enum: [
        "Engineering",
        "Human Resources",
        "Marketing",
        "Sales",
        "Finance",
        "Operations",
        "Customer Support",
        "Product Management",
        "Design",
        "QA",
        "Administration",
        "IT",
      ],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// hash the password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) {
    return;
  }
  this.passwordChangedAt = Date.now() - 1000;
});
userSchema.methods.correctPassword = async function (
  loginPassword,
  userPassword,
) {
  return await bcrypt.compare(loginPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimeStamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model("User", userSchema);

export default User;
