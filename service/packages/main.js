require("./dbop/main.js");
require("./testop/linkmgr/main.js").start(6000);
require("./httpop/index.js").start(6003);
require("./logic/main.js");