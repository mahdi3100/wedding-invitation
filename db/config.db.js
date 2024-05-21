const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');

 
require('dotenv').config();
// Connection URL
//const url = 'mongodb://localhost:27017';
//const client = new MongoClient(url);

// Database Name
const dbName = 'invitationComment'//''test'//'DBEmployee-Registry';


//Connect to cloud Atlas
const uri = process.env.DB_KEY;
const client = new MongoClient(uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });


class mydb {

  //Save DB instance as class attribute 
  connectDB = null;

  constructor() {
    (async () => {
      try {
        await client.connect();
       
        const db = client.db(dbName);
        // const collection = db.collection('users');//default name devicess
        //console.log(db.listCollections())
        this.connectDB = db
        
        console.log('Connected successfully to Atlas server');
       // console.log(db)
      } catch (err) {
        console.log(err)
      }
    })()
  }

  //Get all users for Home page
  getComments(page) {
    return new Promise((resolve, reject) => {

      (async () => {
        try {

          const commentsCollection = await this.connectDB.collection("comments");
       // console.log(commentsCollection)



           // Set limit and calculate skip based on page number
    const limit = 10;
    const skip = (page - 1) * limit;

    // Fetch the comments with limit and skip
    const comments = await commentsCollection.find()
      .skip(skip)
      .limit(limit)
      .toArray();

    // Return the comments
    //console.log(comments)

      // Add the custom "own" field to each comment
      const modifiedComments = comments.map(comment => ({
        ...comment,
        uuid:comment._id.toHexString(),
        own: 0 // or any logic to determine the value of the "own" field
      }));

    resolve(modifiedComments);



        } catch (err) {

          console.log(err)
          reject(err)

        }
      })()
    })
  }



  /**
   * Insert Comment into Users commection
   * @param {String} comment 
   * @param {String} username 
   * @param {String} adminUsername 
   * @returns 
   */
  insertComment(commentBody) {
    return new Promise((resolve, reject) => {

      (async () => {
        try {

          const comments = await this.connectDB.collection("comments");



          let getDate = new Date();
          let newComment = commentBody;
          newComment.created_at = getDate;
          newComment.like = 0;
          newComment.comments = [];
          delete newComment.id;//because its null 
        //  console.log("new comment")
        //  console.log(newComment)

         const result = await comments.insertOne(newComment);

          
    
        newComment.id = result.insertedId;
        newComment.uuid = result.insertedId;
        newComment.own = 1;
          resolve(newComment)


        } catch (err) {

          console.log(err)
          reject(err)

        }
      })()
    })
  }
  /**
   * Insert Comment into Users commection
   * @returns 
   */
  inserChildComment(commentBody) {
    return new Promise((resolve, reject) => {

      (async () => {
        try {

          const comments = await this.connectDB.collection("comments");


const generatedObjectId = new ObjectId();

        
          let getDate = new Date();
          let newComment = commentBody;
          newComment.created_at = getDate;
          newComment.like = 0;
          newComment.comments = [];

          const objectId = new ObjectId(commentBody.id);

          const addedComment = {
            _id:generatedObjectId,
            
            name: newComment.name,
            comment: newComment.comment,
            created_at: new Date(),
            comments:[],
            presence:newComment.presence,
            like:0
          };
    const result = await comments.updateOne({  _id: objectId }, {
            $push: {
              "comments": addedComment
            }
          })
          if (result.modifiedCount > 0) {
            console.log('Comment successfully added.');

            newComment.id = result.insertedId;
            newComment.uuid = result.insertedId;
            newComment.own = 1;
          
            
          } else {
             //its a reply of a reply (nested comment )
             //going to check and retrive the id of that comment 
             const allDocuments = await comments.find({}).toArray();
// Find the path to the nested comment


let updatePath = "";
let mainId = "";
    // Process each document
    for (const doc of allDocuments) {
      console.log('Processing document:', doc);
      const commentPath = this.findCommentPath(doc.comments, objectId);
      if (!commentPath) {
        console.log('Comment not found.');
        reject({code:400})
      return;
      }else{
        mainId = doc._id;
        updatePath = commentPath;
        
        console.log(mainId + " |||||| " +updatePath)
        
        break;
      }
    }

    // Construct the update path
     updatePath = `${updatePath}.comments`; // Update the `text` field, change as needed

    // Perform the update
    const updateResult = await comments.updateOne(
    { _id: mainId },
    //  { $set: { [updatePath]:addedComment } }
    {$push: { [updatePath] : addedComment}}  
  );
    newComment.id = updateResult.insertedId;
    newComment.uuid = updateResult.insertedId;
    newComment.own = 1;
    
          }

        
       
          resolve(newComment)


        } catch (err) {

          console.log(err)
          reject(err)

        }
      })()
    })
  }

  findCommentPath(comments, commentId, currentPath = 'comments') {
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const path = `${currentPath}.${i}`;
     console.log(comment._id)
      if (comment._id.equals(commentId)) {
        console.log("found" + path)
        return path;
      }
  
      if (comment.comments && comment.comments.length > 0) {
        const nestedPath = this.findCommentPath(comment.comments, commentId, `${path}.comments`);
        if (nestedPath) {
          return nestedPath;
        }
      }
    }
    return null;
  }
  async huntTheDocument(objectId){
    const comments = await this.connectDB.collection("comments");
      const allDocuments = await comments.find({}).toArray();
      // Find the path to the nested comment
      
  
          // Process each document
          for (const doc of allDocuments) {
         //   console.log('Processing document:', doc);
            const commentPath = this.findCommentPath(doc.comments, objectId);
            if (!commentPath) {
              console.log('Comment not found.');
             
          
            }else{
           
              return commentPath;
              
             
            }
          }
          return null;
    }
  /**
   * Delete user From users collection
   * @param {String} username 
   * @returns 
   */
  deletelike(objectIdString) {
    return new Promise((resolve, reject) => {

      (async () => {
        
        let updateResult=null;
        try {

           const objectId = new ObjectId(objectIdString);

          const comments = await this.connectDB.collection("comments");
console.log("looking for id "+objectId)
          const post = await comments.findOne({ _id: objectId });
          if (post) {
            const currentLikes = post.likes || 0;
             updateResult = await comments.updateOne(
              { _id: objectId },
              { $set: { 'like': currentLikes - 1 } }
            );
          }
      
         else{

          let getPath =await this.huntTheDocument(objectId);
          console.log("looool")
          console.log(getPath)
          if(!getPath){
            reject({code:400})
            return;
          }
          const query = { [`${getPath}._id`]: objectId };
          const post = await comments.findOne( query);
          const currentLikes = post.like || 0;
          // Update the post with incremented likes
           updateResult = await comments.updateOne(
            query,
            { $set: { [`${getPath}.like`] : currentLikes - 1 } }
          );
      
         }
      
         
         

         if (updateResult.modifiedCount === 1) {
          resolve({ data:{status:200 }}) 
        
        } else {
          return res.status(500).json({ error: 'Failed to like the post' });
        }
         


        } catch (err) {

          console.log(err)
          reject(err)

        }
      })()
    })
  }
  /**
   * 
   * @param {String} datauser 
   * @returns 
   */
  like(objectIdString) {
    return new Promise((resolve, reject) => {

      (async () => {

        let updateResult=null;
        try {

           const objectId = new ObjectId(objectIdString);

          const comments = await this.connectDB.collection("comments");
console.log("looking for id "+objectId)
          const post = await comments.findOne({ _id: objectId });
          if (post) {
            const currentLikes = post.likes || 0;
             updateResult = await comments.updateOne(
              { _id: objectId },
              { $set: { 'like': currentLikes + 1 } }
            );
          }
      
         else{

          let getPath =await this.huntTheDocument(objectId);
          console.log("looool")
          console.log(getPath)
          if(!getPath){
            reject({code:400})
            return;
          }
          const query = { [`${getPath}._id`]: objectId };
          const post = await comments.findOne( query);
          console.log("text "+post.comment )
          const currentLikes = post.like || 0;
          // Update the post with incremented likes
           updateResult = await comments.updateOne(
            query,
            { $set: {  [`${getPath}.like`]: currentLikes + 1 } }
          );
      
         }
      
         
         

         if (updateResult.modifiedCount === 1) {
          resolve({ code:201, data:{uuid :objectId } }) 
        
        } else {
          return res.status(500).json({ error: 'Failed to like the post' });
        }
         


        } catch (err) {

          console.log(err)
          reject(err)

        }
      })()
    })
  }


}


module.exports = mydb;    