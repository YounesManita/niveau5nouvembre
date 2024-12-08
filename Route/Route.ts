import { Router } from "express";

const router=Router()

import {
  createPost,
  signup,
  login,
  getAllPostsWithComments,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
} from "../Controllers/Controllers";

router.post("/adduser",signup)
router.post("/login",login)


router.post("/posts", createPost);

router.get("/withcomment", getAllPostsWithComments);
router.put("/posts/:post_id", updatePost);
router.delete("/posts/:post_id", deletePost);


router.post("/comments", createComment);
router.put("/comments/:comment_id", updateComment);
router.delete("/comments/:comment_id", deleteComment);

export default router;
