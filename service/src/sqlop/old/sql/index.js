exports.start = function(db,route,params,res){
    switch(route){
        case '/image':
            require('./image').imageOp(db,params,res);
            break;
    }
}