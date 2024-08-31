const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const __ = require("lodash");
// const date = require(__dirname+"/date.js")
const app = express();
let item = "";
// let items = ["Buy Vegetables","Cook Food","Cleaning"];
let workitems = [];
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
mongoose.connect('mongodb+srv://mgbhardwajaditya:Aditya2004@myfirst.shw9t.mongodb.net/?retryWrites=true&w=majority&appName=todolistDB');

const itemSchema = {
    name: "string"
};

const Item = mongoose.model("Item",itemSchema);

const Item1 = new Item ({
    name: "Welcome to your To-do List!0"
});

const Item2 = new Item ({
    name: "Hit the + button to add a new Item"
});

const Item3 = new Item ({
    name: "<<<  Hit this to delete an existing Item"
});

const defaultArray = [Item1,Item2,Item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const list = mongoose.model("list",listSchema);


app.get("/", function(req, res) {
    Item.find().then(items => {
        if (items.length === 0) {
            Item.insertMany(defaultArray)
                .then(docs => {
                    console.log('Documents inserted:', docs);
                    res.render("list", { listTitle: "Today", newListItems: docs });
                })
                .catch(err => {
                    console.error('Error inserting documents:', err);
                    res.status(500).send('Error inserting documents');
                });
        } else {
            res.render("list", { listTitle: "Today", newListItems: items });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send('Error retrieving items');
    });
});

app.get("/:customName", function(req, res) {
    const customName = __.capitalize(req.params.customName);

    list.findOne({ name: customName }).then(foundList => {
        if (!foundList) {
            // Create a new list
            const newList = new list({
                name: customName, // Set name to customName
                items: defaultArray
            });

            newList.save().then(() => {
                res.redirect("/" + customName); // Redirect to the newly created list
            }).catch(err => {
                console.log("Error saving the new list:", err);
            });
        } else {
            // Render the found list
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        }
    }).catch(err => {
        console.log("Error finding the list:", err);
    });
});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save().then(() => {
            res.redirect("/");
        }).catch(err => {
            console.log("Error saving item to 'Today' list:", err);
        });
    } else {
        list.findOne({ name: listName }).then(foundList => {
            foundList.items.push(item);
            return foundList.save();
        }).then(() => {
            res.redirect("/" + listName); // Corrected variable name
        }).catch(err => {
            console.log("Error saving item to custom list:", err);
        });
    }
});


app.post("/delete",function(req,res){
    const checkeditemId = (req.body.checkbox);
    const listName = (req.body.listName);

    if(listName === "Today") {
        Item.findByIdAndDelete(checkeditemId)
        .then(() => {
            console.log("Successfully deleted the item.");
            res.redirect("/"); 
        })
        .catch(err => {
            console.log("Error deleting the item:", err);
        });  
    }else{
        list.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkeditemId } } }
        ).then(foundList => {
            res.redirect("/" + listName);
        }).catch(err => {
            console.log("Error updating the list:", err);
        });   
    }
}); 


app.get("/work",function(req,res){
    res.render("list",{listTitle: "Work List",newListItems: workitems});
});


app.listen(3000, function(){
    console.log("server live on port 3000")
});