require("./dbop/main.js");
require("./testop/main.js");
require("./logic/main.js");
require("./httpop/main.js");
require("child_process").exec("browser/browser --url=http://127.0.0.1:6003",{detached:true});