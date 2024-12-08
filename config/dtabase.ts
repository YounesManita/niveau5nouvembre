
import {Pool} from "pg"
export const pool=new Pool({
    database:"projetfinal",
    user:"postgres",
    host:"localhost",
    password:"Manita@123",
    port:5432
})
import bcrypt from "bcryptjs";


export const createTables = async (): Promise<void> => {
  try {

    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(50) NOT NULL,
        prenom VARCHAR(50) NOT NULL,
        email VARCHAR(250) NOT NULL UNIQUE,
        password VARCHAR(250) NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'user'
      )
    `;
    await pool.query(createUserTable);
    console.log("Users table created successfully");

   
    const createPostsTable = `
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createPostsTable);
    console.log("Posts table created successfully");

    
    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT NOT NULL,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createCommentsTable);
    console.log("Comments table created successfully");
   const existuser=await pool.query("select * from users where role=$1 ",["admin"])
       if (existuser.rows.length==0){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("adminpasword", salt);
    
       
       await pool.query(
          "INSERT INTO users (nom, prenom, email, password, role) VALUES ($1, $2, $3, $4, $5) ",
          ["admin", "admin", "admin@gmail.com", hashedPassword, "admin"]
        );
        console.log("user ajouter avec suuces ");
        
       }else{
        console.log("account admin already exists");
        
       }

  
   


   
  } catch (error) {
    console.log(error);
  }
};
