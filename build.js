const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const codeSplitter = require("../bin/runner").codeSplitter;
let pageConfig = fs.readFileSync(path.join(__dirname, "./page.html"), "utf8");

function calculateMD5(input) {
    const hash = crypto.createHash("md5");
    hash.update(input);
    return hash.digest("hex");
}

function build(page, FilePath) {
    pageConfig = fs.readFileSync(path.join(__dirname, "./page.html"), "utf8");
    let r = "";
    if (FilePath.split(".").slice(-1)[0] == "page") {
        r = buildPage(page, FilePath);
    } else if (FilePath.split(".").slice(-1)[0] == "blog") {
        r = buildBlog(page, FilePath);
    } else if (FilePath.split(".").slice(-1)[0] == "tutorial") {
        r = buildTutorial(page, FilePath);
    }
    return r;
}
function buildPage(page, FilePath) {
    let splitPage = page.split("\n");
    let r = "";
    let title = "";
    let codeBlock = false;
    let list = false;
    let hiddenBlockID = 0;
    for (let i = 0; i < splitPage.length; ++i) {
        let line = splitPage[i].trim();
        let command = line.split(" ")[0];
        let args = line.split(" ").slice(1);
        let content = args.join(" ");
        if (line == "```") {
            codeBlock = !codeBlock;
            if (codeBlock) {
                r += "<pre><code>";
            } else {
                r += "</code></pre>";
            }
            continue;
        }
        if (codeBlock) {
            /**
             *
             * @param {Number} i
             * @param {Array} L
             * @returns
             */
            function getNext(i, L) {
                let ind = L.slice(i + 1).findIndex(
                    (value) => value != "" && value != " "
                );
                if (ind == -1) {
                    return "";
                }
                return L[ind + i + 1];
            }
            let l = "";
            let L = codeSplitter(splitPage[i]);
            for (let i = 0; i < L.length; ++i) {
                let c = L[i];
                if (c == "") {
                    continue;
                }
                if (c.match(/^[a-zA-Z_]\w*$/)) {
                    if (getNext(i, L) == "(") {
                        l += `<span class="func">${c}</span>`;
                        continue;
                    }
                    l += `<span class="var">${c}</span>`;
                    continue;
                } else if (c.match(/^\d+\.\d+$/) || c.match(/^\d+$/)) {
                    l += `<span class="number">${c}</span>`;
                    continue;
                } else if (c.match(/^"[^"]*"$/)) {
                    l += `<span class="string">${c}</span>`;
                    continue;
                } else if (c == ":") {
                    let next = getNext(i, L);
                    if ("any string number".split(" ").includes(next)) {
                        let j;
                        for (j = 0; L[i + j] != next; ++j) {
                            if (L[i + j] == "") {
                                continue;
                            }
                            l += L[i + j];
                        }
                        l += `<span class="type">${next}</span>`;
                        i = i + j + 1;
                        continue;
                    }
                } else if (c.slice(0, 2) == "//") {
                    l += `<span class="comment">${c}</span>`;
                    continue;
                }
                l += c;
            }
            r += `<span class="line">${l}</span>`;
            continue;
        }
        r += "\n            ";
        if (command != "-" && list) {
            r += "</ul>";
            list = false;
        }
        if (line.slice(0, 3) == "''s") {
            if (args[0] == "canHide") {
                r +=
                    "<input type='checkbox' class='canHideCheck' id='canHide" +
                    hiddenBlockID +
                    "'><label for='canHide" +
                    hiddenBlockID +
                    "'>" +
                    args[1] +
                    "</label><div class='block canHide'>";
                ++hiddenBlockID;
            } else {
                r += "<div class='block'>";
            }
            continue;
        }
        if (line.slice(0, 3) == "''c") {
            r += "</div>";
            continue;
        }
        let id;
        switch (command) {
            case "@SetTitle":
                title = content;
                break;
            case "#":
                id = ` id="${calculateMD5(content)}"`;
                if (args[0].match(/^{.*}$/)) {
                    id = ` id="${args[0].slice(1, -1)}"`;
                    content = args.slice(1).join(" ");
                }
                r += `<h1${id}>${content}</h1>`;
                break;
            case "##":
                id = ` id="${calculateMD5(content)}"`;
                if (args[0].match(/^{.*}$/)) {
                    id = ` id="${args[0].slice(1, -1)}"`;
                    content = args.slice(1).join(" ");
                }
                r += `<h2${id}>${content}</h2>`;
                break;
            case "###":
                id = ` id="${calculateMD5(content)}"`;
                if (args[0].match(/^{.*}$/)) {
                    id = ` id="${args[0].slice(1, -1)}"`;
                    content = args.slice(1).join(" ");
                }
                r += `<h3${id}>${content}</h3>`;
                break;
            case "####":
                id = ` id="${calculateMD5(content)}"`;
                if (args[0].match(/^{.*}$/)) {
                    id = ` id="${args[0].slice(1, -1)}"`;
                    content = args.slice(1).join(" ");
                }
                r += `<h4${id}>${content}</h4>`;
                break;
            case "#####":
                id = ` id="${calculateMD5(content)}"`;
                if (args[0].match(/^{.*}$/)) {
                    id = ` id="${args[0].slice(1, -1)}"`;
                    content = args.slice(1).join(" ");
                }
                r += `<h5${id}>${content}</h5>`;
                break;
            case "######":
                id = ` id="${calculateMD5(content)}"`;
                if (args[0].match(/^{.*}$/)) {
                    id = ` id="${args[0].slice(1, -1)}"`;
                    content = args.slice(1).join(" ");
                }
                r += `<h6${id}>${content}</h6>`;
                break;
            case "-":
                if (!list) {
                    r += `<ul><li>${content}</li>`;
                } else {
                    r += `<li>${content}</li>`;
                }
                list = true;
                break;
            default:
                r += line + "<br>";
        }
    }
    r = r
        .split(/(@\([^\)]*\)\[[^\]]*\])/)
        .map((val, index) => {
            if (index % 2 == 1) {
                let msg = val.match(/\([^\)]*\)/)[0].slice(1, -1);
                let url = val.match(/\[[^\)]*\]/)[0].slice(1, -1);
                if (url[0] == "#") {
                    return `<a href="${url}">${msg}</a>`;
                } else {
                    return `<a href="#${calculateMD5(url)}">${msg}</a>`;
                }
            }
            return val;
        })
        .join("")
        .split(/([^@#]\([^\)]*\)\[[^\]]*\])/)
        .map((val, index) => {
            if (index % 2 == 1) {
                let msg = val.match(/\([^\)]*\)/)[0].slice(1, -1);
                let url = val.match(/\[[^\)]*\]/)[0].slice(1, -1);
                return `${val[0]}<a href="${url}">${msg}</a>`;
            }
            return val;
        })
        .join("");
    return pageConfig
        .replace("%Content%", r)
        .replace("%Title%", title)
        .split(/(%resource [^%]+%)/)
        .map((val, index) => {
            if (index % 2 == 1) {
                return path.relative(
                    path.dirname(FilePath),
                    path.join(__dirname, "./build/", val.slice(10, -1))
                );
            }
            return val;
        })
        .join("")
        .split(/(#\([^\)]*\)\[[^\]]*\]<[0-9]+,[0-9]+>)/)
        .map((val, index) => {
            if (index % 2 == 1) {
                let url = val.match(/\([^\)]*\)/)[0].slice(1, -1);
                let alt = val.match(/\[[^\)]*\]/)[0].slice(1, -1);
                let wh = val.match(/<[0-9]+,[0-9]+>/);
                wh = wh[0].slice(1, -1).split(",");
                return `<img src="${url}" alt="${alt}" width="${wh[0]}" height="${wh[1]}"/>`;
            }
            return val;
        })
        .join("")
        .split(/(#\([^\)]*\)\[[^\]]*\])/)
        .map((val, index) => {
            if (index % 2 == 1) {
                let url = val.match(/\([^\)]*\)/)[0].slice(1, -1);
                let alt = val.match(/\[[^\)]*\]/)[0].slice(1, -1);
                return `<img src="${url}" alt="${alt}"/>`;
            }
            return val;
        })
        .join("");
}
function buildTutorial(page, FilePath) {
    return r;
}
function buildBlog(page, FilePath) {
    return r;
}

exports.build = build;
