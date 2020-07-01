const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
// const date = require(__dirname + '/date.js');

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));

//To include CSS file
app.use(express.static('public'));

//To render EJS files
app.set('view engine', 'ejs');

//Heroku Deployment
let port = process.env.PORT;
if (port == null || port == ""){
    port = 3000;
}
//Listen to Port
app.listen(port, function () {
    console.log('Server has started successfully');
});

//Connect the mongoose with MongoDB
mongoose.connect('mongodb+srv://admin-suriya_prasath:prasath123@cluster0-gssbu.mongodb.net/todoListDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Create a itemsSchema and listSchema[for generating list for dynamically changing routes]
const itemsSchema = mongoose.Schema({
    name: String,
});

const listSchema = mongoose.Schema({
    name: String,
    listItems: [itemsSchema]
});

//Creating a mongoose model [always capitalized], which includes the collection's name and schema
const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);

//Creating the documents for the relevant DB
const item1 = new Item({
    name: 'HAVE A WONDERFUL DAY!'
});

//Saving the above items to an Array
const defaultItems = [item1];
const defaultListItems = [];

//Main Route Configuration----------------------------------
app.get('/', function (req, res) {

    //Find the items from the DB
    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log('Error in retriving the data');
        } else if (foundItems.length === 0) {
            //Inserting defaultItems to the DB
            Item.insertMany(defaultItems, function (err) {
                if (!err) {
                    console.log('Data entered successfully');
                }

                //After inserting the data to the DB, we get redirected to the / route
                res.redirect('/');
            });
        } else {
            //Rendering the EJS files and dynamically changing the Marker
            res.render('list', {
                ListTitle: 'Today',
                ListItems: foundItems
            })
        }
    });

});

//Express provides a methos by which we can get access to our DYNAMIC ROUTES using EXPRESS ROUTE PARAMETERS
app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    //Before creating a new list document, we must check if it is already existing or not, hence for that we need to use findOne() method
    List.findOne({name: customListName}, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Creating new list document
                const list = new List({
                    name: customListName,
                    listItems: defaultListItems
                });

                list.save();
                res.redirect('/' + customListName);
            } else {
                res.render('list', {
                    ListTitle: foundList.name,
                    ListItems: foundList.listItems
                })
            }
        }

    });

});

//Posting the contents to the / route---------------------------
app.post('/', function (req, res) {
    let itemName = req.body.list;
    let listName = req.body.button;

    const item = new Item({
        name: itemName
    });

    if (listName !== 'Today') {
        List.findOne({name: listName}, function (err, foundList) {
            if (!err) {
                foundList.listItems.push(item);
                foundList.save();
                res.redirect('/' + listName);
            }
        });
    } else {
        //Straight Forward Way
        item.save();
        res.redirect('/');
    }

});

//Configuring the /delete route-----------------------------------
app.post('/delete', function (req, res) {
    //Storing the item's id to a Variable
    let CheckeditemId = req.body.checkbox;
    let listName = req.body.hiddenInput;

    if (listName !== 'Today') {
        List.findOneAndUpdate({name:listName}, {$pull: {listItems: {_id:CheckeditemId}}}, function(err, foundList){
            if(!err){
                res.redirect('/' + listName);
            }
        });
    } else {
        //Deleting the Id by calling findByIdAndDelete method
        Item.findByIdAndDelete(CheckeditemId, function (err) {
            if (!err) {
                console.log('Item deleted successfully');
            }
        });
        //Redirecting to the / route
        res.redirect('/');
    }

});
