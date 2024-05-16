import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

import User from "../models/user.js";
import Post from "../models/post.js";

import generateTokenAndSetCookie from "../utils/generate-token-and-set-cookie.js";

export async function getSuggestedUsers(request, response) {
  const { _id } = request.user;

  try {
    const userFollowed = await User.findById(_id, "following");
    const users = await User.aggregate([
      { $match: { _id: { $ne: _id } } },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter((user) => {
      return !userFollowed.following.includes(user._id);
    });
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => {
      return delete user.password;
    });

    return response.status(200).json({
      message: "Suggested users found successfully",
      data: suggestedUsers,
    });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to get suggested users: ${error.message}`);
  }
}

export async function getUserProfile(request, response) {
  const { query } = request.params;

  try {
    let user = null;

    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne(
        { _id: query },
        { name: 1, username: 1, profilePicture: 1 }
      );
    } else {
      user = await User.findOne(
        { username: query },
        { password: 0, updatedAt: 0, createdAt: 0, __v: 0 }
      );
    }

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    return response
      .status(200)
      .json({ message: "User found successfully", data: user });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to get profile: ${error.message}`);
  }
}

export async function signUp(request, response) {
  const { name, email, username, password } = request.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      return response.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      email: email,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    if (!newUser) {
      return response.status(400).json({ error: "Invalid user data" });
    }

    generateTokenAndSetCookie(newUser._id, response);

    response.status(201).json({
      message: "Signed up successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        biography: newUser.biography,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to sign up: ${error.message}`);
  }
}

export async function signIn(request, response) {
  const { username, password } = request.body;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return response.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return response.status(400).json({ error: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, response);

    response.status(200).json({
      message: "Signed in successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        biography: user.biography,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to sign in: ${error.message}`);
  }
}

export function signOut(_request, response) {
  try {
    response.cookie("jwt", "", {
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(0),
    });

    response.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to sign out: ${error.message}`);
  }
}

export async function followUser(request, response) {
  const { id } = request.params;
  const _id = request.user._id;

  try {
    if (_id.toString() === id) {
      return response.status(400).json({ error: "You can't follow yourself" });
    }

    const currentUser = await User.findById(_id);

    if (!currentUser) {
      return response.status(404).json({ error: "User not found" });
    }

    const userWantToFollow = await User.findById(id);

    if (!userWantToFollow) {
      return response.status(404).json({ error: "User not found" });
    }

    const isFollowing = userWantToFollow.followers.includes(_id);

    if (isFollowing) {
      return response
        .status(400)
        .json({ error: "You are already following this user" });
    }

    await currentUser.updateOne({ $push: { following: userWantToFollow._id } });
    await userWantToFollow.updateOne({ $push: { followers: currentUser._id } });

    response.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to follow: ${error.message}`);
  }
}

export async function unfollowUser(request, response) {
  const { id } = request.params;
  const _id = request.user._id;

  try {
    if (_id.toString() === id) {
      return response
        .status(400)
        .json({ error: "You can't unfollow yourself" });
    }

    const currentUser = await User.findById(_id);

    if (!currentUser) {
      return response.status(404).json({ error: "User not found" });
    }

    const userWantToUnfollow = await User.findById(id);

    if (!userWantToUnfollow) {
      return response.status(404).json({ error: "User not found" });
    }

    const isFollowing = userWantToUnfollow.followers.includes(_id);

    if (!isFollowing) {
      return response
        .status(400)
        .json({ error: "You are not following this user" });
    }

    await currentUser.updateOne({
      $pull: { following: userWantToUnfollow._id },
    });
    await userWantToUnfollow.updateOne({
      $pull: { followers: currentUser._id },
    });

    response.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to unfollow: ${error.message}`);
  }
}

export async function updateProfile(request, response) {
  let { profilePicture } = request.body;

  const { name, email, username, password, biography } = request.body;
  const { id } = request.params;
  const _id = request.user._id;

  try {
    if (_id.toString() !== id) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    let user = await User.findById(id);

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    if (profilePicture) {
      if (user.profilePicture) {
        const url = user.profilePicture;
        const public_id = url.substring(url.lastIndexOf("/") + 1).split(".")[0];

        await cloudinary.uploader.destroy(public_id);
      }
      const uploadedProfilePicture = await cloudinary.uploader.upload(
        profilePicture
      );

      profilePicture = uploadedProfilePicture.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePicture = profilePicture || user.profilePicture;
    user.biography = biography || user.biography;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
    }

    await user.save();

    await Post.updateMany(
      { "replies.userId": _id },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].profilePicture": user.profilePicture,
        },
      },
      { arrayFilters: [{ "reply.userId": _id }] }
    );

    return response.status(200).json({
      message: "User updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        biography: user.biography,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to update: ${error.message}`);
  }
}
