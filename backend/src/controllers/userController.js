const { User } = require("../models");
const multer = require('multer');

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const formatUserResponse = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  weight: user.weight,
  height: user.height,
  age: user.age,
  gender: user.gender,
  goal: user.goal,
  activityLevel: user.activityLevel,
  photo: user.photo, // The getter in the model will handle the formatting
});

exports.getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({ 
      message: error.message === "User not found" ? "User not found" : "Error fetching user profile", 
      error: error.message 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    const { height, weight, age, gender, goal, activityLevel } = req.body;

    await user.update({
      height,
      weight,
      age,
      gender,
      goal,
      activityLevel,
    });

    res.json({ message: "User updated successfully", user: formatUserResponse(user) });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({ 
      message: error.message === "User not found" ? "User not found" : "Error updating user", 
      error: error.message 
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({ 
      message: error.message === "User not found" ? "User not found" : "Internal server error", 
      error: error.message 
    });
  }
};

const upload = multer();

exports.uploadPhoto = async (req, res) => {
  upload.single('photo')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ message: "Error uploading file", error: err.message });
    } else if (err) {
      return res.status(500).json({ message: "Unknown error", error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await getUserById(req.user.id);
      
      // Convert buffer to base64 and store
      const base64Image = req.file.buffer.toString('base64');
      await user.update({ photo: base64Image });

      // Get the full base64 representation of the image
      const fullBase64Image = `data:${req.file.mimetype};base64,${base64Image}`;

      res.json({ message: "Photo uploaded successfully", photoUrl: fullBase64Image });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Error uploading photo", error: error.message });
    }
  });
};
