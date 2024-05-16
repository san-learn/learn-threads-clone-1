import { v2 as cloudinary } from "cloudinary";

import Post from "../models/post.js";
import User from "../models/user.js";

const MAX_TEXT_LENGTH = 500;

export async function getPost(request, response) {
  const { id } = request.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }

    return response
      .status(200)
      .json({ message: "Post found successfully", data: post });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to get posts: ${error.message}`);
  }
}

export async function getAllPost(request, response) {
  const { username } = request.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    const post = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    response
      .status(200)
      .json({ message: "Post found successfully", data: post });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to get posts: ${error.message}`);
  }
}

export async function getFeedPosts(request, response) {
  const _id = request.user._id;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    const userFollowing = user.following;

    const feedPosts = await Post.find({
      postedBy: { $in: userFollowing },
    })
      .select("-__v")
      .select("-updatedAt")
      .sort({ createdAt: -1 });

    if (!feedPosts) {
      return response.status(404).json({ error: "Post not found" });
    }

    return response
      .status(200)
      .json({ message: "Posts found successfully", data: feedPosts });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to get feed posts: ${error.message}`);
  }
}

export async function createPost(request, response) {
  let { image } = request.body;

  const { postedBy, text } = request.body;
  const _id = request.user._id;

  try {
    if (!postedBy || !text) {
      return response.status(400).json({ error: "Invalid post data" });
    }

    if (postedBy !== _id.toString()) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return response.status(400).json({ error: "Text is too long" });
    }

    const user = await User.findById(postedBy);

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);

      image = uploadedImage.secure_url;
    }

    const newPost = new Post({
      postedBy: postedBy,
      text: text,
      image: image,
    });

    await newPost.save();

    return response
      .status(201)
      .json({ message: "Post created successfully", data: newPost });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to create post: ${error.message}`);
  }
}

export async function deletePost(request, response) {
  const { id } = request.params;
  const { _id } = request.user._id;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }

    if (_id.toString() !== post.postedBy.toString()) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    if (post.image) {
      const url = post.image;
      const public_id = url.substring(url.lastIndexOf("/") + 1).split(".")[0];

      await cloudinary.uploader.destroy(public_id);
    }

    await post.deleteOne();

    return response.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to delete post: ${error.message}`);
  }
}

export async function likePost(request, response) {
  const { id } = request.params;
  const _id = request.user._id;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }

    const isPostHaveUser = post.postedBy.toString() === _id.toString();

    if (isPostHaveUser) {
      return response
        .status(400)
        .json({ error: "You can't like your own post" });
    }

    const isLiked = post.likes.includes(_id);

    if (isLiked) {
      return response.status(400).json({ error: "Post already liked" });
    }

    await post.updateOne({ $push: { likes: _id } });

    return response.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to like post: ${error.message}`);
  }
}

export async function unlikePost(request, response) {
  const { id } = request.params;
  const _id = request.user._id;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }

    const isPostHaveUser = post.postedBy.toString() === _id.toString();

    if (isPostHaveUser) {
      return response
        .status(400)
        .json({ error: "You can't unlike your own post" });
    }

    const isLiked = post.likes.includes(_id);

    if (!isLiked) {
      return response.status(400).json({ error: "Post not liked" });
    }

    await post.updateOne({ $pull: { likes: _id } });

    return response.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to unlike post: ${error.message}`);
  }
}

export async function replyPost(request, response) {
  const { text } = request.body;
  const { id } = request.params;
  const { _id, username, profilePicture, name } = request.user;

  try {
    if (!text) {
      return response.status(400).json({ error: "Invalid post data" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return response.status(404).json({ error: "Post not found" });
    }

    const newReply = {
      userId: _id,
      text: text,
      username: username,
      name: name,
      profilePicture: profilePicture,
    };

    post.replies.push(newReply);

    await post.save();

    return response
      .status(200)
      .json({ message: "Post replied successfully", data: newReply });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to reply post: ${error.message}`);
  }
}
