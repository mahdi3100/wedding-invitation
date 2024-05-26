var express = require("express");
var router = express.Router();
var db = require("../db/config.db.js");


/** Insert */
router.post("/comment",(req,res)=>{


  console.log(req.body)
  let getForm = req.body;
  let comment = getForm.comment;
  let name = getForm.name;
if(!comment || comment.length==0  || !name ||   comment.name==0 ){
  res.json({code:400});
}

if(getForm.id){
  insertReplyComment(req,res,getForm)
  console.log("reply comment")
}else{
  insertFirstComment(req,res,getForm)
}

  });

function insertFirstComment(req,res,getForm){
   //Insert cmment in Database
 req.dbPOOL.insertComment(getForm).then((result) => {
  /*
    if (!result.matchedCount) {
      return res.json({ error: 2, redirect: "home" })
    }*/
  
    res.json({code:201, data:result});
  }).catch((err) => {
  
    console.log(err)
    res.json({
      code:400,
      txt: "An error has occured"
    });
  });
}


function insertReplyComment(req,res,getForm){
  //Insert cmment in Database
req.dbPOOL.inserChildComment(getForm).then((result) => {
 /*
   if (!result.matchedCount) {
     return res.json({ error: 2, redirect: "home" })
   }*/
 
   res.json({code:201, data:result});
 }).catch((err) => {
 
   console.log(err)
   res.json({
     code:400,
     txt: "An error has occured"
   });
 });
}
/**Route of history/ */
router.get("/comment",function(req,res){
    //all : For filter paramater 
  console.log("testtestt")
    //page 
    let offset = parseInt(req.query.per);
    let page = parseInt(req.query.next);


    //set page 1 by default
    if(isNaN(page) || page <= 0){page = 1;}
    

       //Insert cmment in Database
 req.dbPOOL.getComments(page).then((result) => {

 
console.log("WILL RETUEN")
  res.json({data:result, code:200  });
}).catch((err) => {

  console.log(err)
  res.json({
    code:400,
    txt: "An error has occured"
  });
});

});

/** PAtch remove like */
router.patch("/comment/:id",function(req,res){
  //all : For filter paramater 
console.log("like")
  //page 
  let idComment =req.params.id;

  if(!idComment){
    res.send("0");
  }
     //Insert cmment in Database
req.dbPOOL.deletelike(idComment).then((result) => {

  

res.json(result);
}).catch((err) => {

console.log(err)
res.status(404).json({ code: 400, error: 'Failed to unlike the post' });
});

});
/** add like */
router.post("/comment/:id",function(req,res){
  //all : For filter paramater 
console.log("like")
  //page 
  let idComment =req.params.id;

  if(!idComment){
    res.send("0");
  }
     //Insert cmment in Database
req.dbPOOL.like(idComment).then((result) => {

  

res.json(result);
}).catch((err) => {

console.log(err)
res.status(404).json({ code: 400, error: 'Failed to like the post' });
});

});
module.exports = router;
