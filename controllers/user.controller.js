const { User } = require("../models/user.model.js");
const { uploadOnCloudinary } = require("../config/cloudinary.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { ApiError } = require("../utils/ApiError.js");
const { asyncHandeler } = require("../utils/asyncHandler.js");

const generateAccessTokenAndRefershTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefershToken();

    user.refreshToken = refreshToken;
    await user.save({ vaildateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const registerUser = asyncHandeler(async (req, res) => {
  // GET ALL THE USER DETAILS
  const { firstName, lastName, email, username, password, phone } = req.body;
  console.log("email:", email);

  if (
    [firstName, lastName, email, username, password, phone].some(
      (field) => field?.trim() == "",
    )
  ) {
    throw new ApiError(400, "All fields are Required");
  }

  const existinguser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existinguser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    avatar: avatar?.url || "",
    username: username.toLowercase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refershToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while regertering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Sucessfully"));
});

const loginUser = asyncHandeler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "User or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await User.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefershTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password  -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged In Successfully",
      ),
    );
});

const logoutUser = asyncHandeler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

module.exports = { registerUser, loginUser, logoutUser };
