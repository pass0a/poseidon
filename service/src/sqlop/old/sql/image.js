function createTable(db){
    var sql_order = 'CREATE TABLE IMAGE(ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,IMG_ID TEXT NOT NULL,PID INTEGER NOT NULL,PATH TEXT NOT NULL,VID INTEGER NOT NULL,DATE TIMESTAMP NOT NULL)';
    db.exec(sql_order);
}
exports.imageOp = function(db,params,res){
    createTable(db);
    switch(params.action){
        case 'add':
            var add_order="INSERT INTO IMAGE(ID,IMG_ID,PID,PATH,VID,DATE) VALUES (NULL,?,?,?,1,datetime('now','localtime'));";
		    db.exec(add_order,params.img_id,params.pid,params.path);
            res.writeHead(200, {"Content-Type": 'application/json; charset=utf8'});
            res.end('');
            break;
    }
}