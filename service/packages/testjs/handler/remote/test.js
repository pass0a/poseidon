var test=require("./index.js");
test_connect();
async function test_connect(){
    var ret=await test.connectDev();
    console.info(ret);
    test.sendCmd({act:"cutScreen",filepath:__dirname+"/test.png"});
    // sleep(4000);
    // test.disconnectDev();
}