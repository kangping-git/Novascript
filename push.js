const childprocess = require("child_process");
const data = require("./bin/data");
childprocess.execSync("git add .");
childprocess.execSync('git commit -m "' + data.version + '"');
childprocess.execSync("git push -u origin main");
