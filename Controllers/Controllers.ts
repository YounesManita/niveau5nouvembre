import { Request, Response } from "express";
import { pool } from "../config/dtabase";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response):Promise<any> => {
  try {
    const { nom, prenom, email, password, role = "user" } = req.body;

   
    const userExist = await pool.query("SELECT email FROM users WHERE email=$1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const result = await pool.query(
      "INSERT INTO users (nom, prenom, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nom, prenom, email, hashedPassword, role]
    );

  
    const user = result.rows[0];
    delete user.password; 
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};


export const login = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { email, password } = req.body;
    console.log(email,password);
    

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    
    delete user.password;
    
    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};





export const createPost = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { title, content, user_id } = req.body;
    console.log(title, content, user_id );
    
    const newPost = await pool.query(
      "INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, user_id]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};




export const getAllPostsWithComments = async (req: Request, res: Response):Promise<any>  => {
    try {
      const postsQuery = `
        SELECT posts.id AS post_id, posts.title, posts.content, posts.created_at,
               post_user.nom AS post_author_nom, post_user.prenom AS post_author_prenom,
               post_user.email AS post_author_email
        FROM posts
        JOIN users post_user ON posts.user_id = post_user.id
      
      `;
  
      const postsResult = await pool.query(postsQuery);
      const posts = postsResult.rows;
  
      
      const postsWithComments = await Promise.all(
        posts.map(async (post: any) => {
          const commentsQuery = `
            SELECT comments.id AS comment_id, comments.comment, comments.created_at,
                   comment_user.nom AS comment_author_nom, comment_user.prenom AS comment_author_prenom,
                   comment_user.email AS comment_author_email
            FROM comments
            JOIN users comment_user ON comments.user_id = comment_user.id
            WHERE comments.post_id = $1
          
          `;
  
          const commentsResult = await pool.query(commentsQuery, [post.post_id]);
          const comments = commentsResult.rows;
  
          return {
            post_id: post.post_id,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            post_author: {
              nom: post.post_author_nom,
              prenom: post.post_author_prenom,
              email: post.post_author_email
            },
            comments: comments.map((comment: any) => ({
              comment_id: comment.comment_id,
              comment: comment.comment,
              created_at: comment.created_at,
              comment_author: {
                nom: comment.comment_author_nom,
                prenom: comment.comment_author_prenom,
                email: comment.comment_author_email
              }
            }))
          };
        })
      );
 
  
      res.status(200).json(postsWithComments);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  };
  

export const updatePost = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { post_id } = req.params;
    const { title, content } = req.body;

    const updatedPost = await pool.query(
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *",
      [title, content, post_id]
    );

    if (updatedPost.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const deletePost = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { post_id } = req.params;
    const result = await pool.query("DELETE FROM posts WHERE id = $1 RETURNING *", [post_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const createComment = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { comment, post_id, user_id } = req.body;
    const newComment = await pool.query(
      "INSERT INTO comments (comment, post_id, user_id) VALUES ($1, $2, $3) RETURNING *",
      [comment, post_id, user_id]
    );
    res.status(201).json(newComment.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const updateComment = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { comment_id } = req.params;
    const { comment } = req.body;

    const updatedComment = await pool.query(
      "UPDATE comments SET comment = $1 WHERE id = $2 RETURNING *",
      [comment, comment_id]
    );

    if (updatedComment.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(updatedComment.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const deleteComment = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { comment_id } = req.params;
    const result = await pool.query("DELETE FROM comments WHERE id = $1 RETURNING *", [comment_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
