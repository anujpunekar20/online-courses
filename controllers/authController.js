const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateTokens = (userId, tokenVersion) => {
  const accessToken = jwt.sign(
    { userId, tokenVersion },
    process.env.JWT_ACCESS_SECRET, // Ensure this is correct
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId, tokenVersion },
    process.env.JWT_REFRESH_SECRET, // Ensure this is correct
    { expiresIn: "7d" }
  );
  // log the tokens
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    const validRoles = ["student", "instructor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create new user
    const user = new User({ username, email, password, role });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.tokenVersion
    );

    // Set the token as an HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.tokenVersion
    );

    // Set the token as an HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.json({
      message: "Logged in successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Increment the token version to invalidate all existing tokens
    user.tokenVersion += 1;
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Read refresh token from cookies
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.tokenVersion
    );

    // Set the new tokens as HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid refresh token", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};
