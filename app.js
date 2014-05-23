var express = require('express');
var app = express();

console.log(__dirname);

app.use('/static',express.static(__dirname + '/static'));

app.get('/data/category', function(req, res){
    var parent = parseInt(req.query.parentid);
    var itemId = parseInt(req.query.parentitemid);
    var id = parseInt(req.query.id);
    var items = []; 

    if (id == 25 && !parent)
    {
        items.push({ id:1, text: "湖南" });
        items.push({ id:2, text: "湖北" });
        items.push({ id:3, text: "广东" });
    }
    else if (id == 26)
    {
        if (itemId == 1)
        {
            items.push({ id:11, text: "长沙" });
            items.push({ id:12, text: "株洲" });
            items.push({ id:13, text: "湘潭" });
        }
    }
    else if (itemId == 2)
    {
        items.push( { id:21, text: "武汉" });
        items.push( { id:22, text: "襄樊" });
        items.push( { id:23, text: "荆州" });
    }
    else if (itemId == 3)
    {
        items.push( { id:31, text: "深圳" });
        items.push( { id:32, text: "广州" });
        items.push( { id:33, text: "汕头" });
    }
    else if (id == 27)
    {
        if (itemId == 11)
        {
            items.push( { id:11, text: "长沙市" });
            items.push( { id:12, text: "长沙县" });
            items.push( { id:13, text: "浏阳县" });
        }
    }
    else if (itemId == 12)
    {
        items.push( { id:21, text: "醴陵市" });
        items.push( { id:22, text: "攸县" });
        items.push( { id:23, text: "株洲县" });
    }
    else if (itemId == 13)
    {
        items.push( { id:31, text: "韶山" });
        items.push( { id:32, text: "湘乡" });
        items.push( { id:33, text: "湘阴" });
    }

    res.json(items);
});

var server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
});