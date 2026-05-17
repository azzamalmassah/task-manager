import User from "../models/usersModel.js";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { promisify } from "util";

// Function to sign a JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  user.password = undefined;
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

//signup controller
export const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(user._id);

  createSendToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  if (!password || !email) {
    return next(new AppError("Please type your credentials", 400));
  }
  const user = await User.findOne({ email }).select("+password ");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid credentials, try again!", 401));
  }

  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Support cookie-based auth too (login sets `jwt` cookie)
  if (!token && req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError(
        "You are not authenticated. Please log in to get access. ",
        401,
      ),
    );
  }
  //  Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("the user belonging to this token no longer exists", 401),
    );
  }
  if (await user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("user changed the password recently", 401));
  }
  req.user = user;
  next();
});
