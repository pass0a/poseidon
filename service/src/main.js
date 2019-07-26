require('./dbop/main');
require('./testop/linkmgr/main').start(6000);
require('./httpop/index').start(6003);
require('./logic/main');
