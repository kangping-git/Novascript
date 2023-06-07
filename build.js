const fs = require("fs");
const path = require("path");
const pages = fs
    .readFileSync(path.join(__dirname, "./pages.txt"), "utf-8")
    .split(/\r\n|\n|\r/);
const defaultFooter = fs.readFileSync(
    path.join(__dirname, "./footer.html"),
    "utf-8"
);
const d = require("../bin/runner");

function buildPage(page, FilePath) {
    let pageLines = page.split(/\r\n|\n|\r/);
    let title = "";
    let lang = "";
    let block = false;
    let label = "";
    for (let i in pageLines) {
        if (pageLines[i].slice(0, 3) == "```") {
            if (lang) {
                lang = "";
                pageLines[i] = "</code></pre>";
            } else {
                lang = pageLines[i].slice(3);
                pageLines[i] = "<code><pre>";
                if (lang == "") {
                    lang = "plane";
                }
            }
            continue;
        }
        if (pageLines[i].slice(0, 3) == "'''") {
            block = !block;
            let l = pageLines[i].slice(3).split(" ");
            if (l[0] == "CanHide") {
                if (block) {
                    pageLines[i] =
                        "<br><input type='checkbox' id='check_" +
                        i +
                        "'><label for='check_" +
                        i +
                        "'>" +
                        l.slice(1).join(" ") +
                        "</label><div class='block'>";
                } else {
                    pageLines[i] = "</div>";
                }
            } else {
                if (block) {
                    pageLines[i] = "<div class='block'>";
                } else {
                    pageLines[i] = "</div>";
                }
            }
            continue;
        }
        if (lang) {
            if (lang == "novascript") {
                let tokens = d.codeSpliter(pageLines[i]);
                function isNextToken(index, token) {
                    let i = tokens
                        .slice(index + 1)
                        .findIndex((t) => t[0] != " " && t);
                    if (i >= 0) {
                        return tokens[i + index + 1] == token;
                    }
                    return false;
                }
                pageLines[i] = "<span class='line'>";
                for (let j in tokens) {
                    let I = Number(j);
                    if (tokens[I].match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                        if (tokens.length > I + 1) {
                            if (isNextToken(I, "(")) {
                                if (
                                    ["for", "while", "if"].includes(tokens[I])
                                ) {
                                    pageLines[
                                        i
                                    ] += `<span class="func for">${tokens[I]}</span>`;
                                    continue;
                                }
                                pageLines[
                                    i
                                ] += `<span class="func">${tokens[I]}</span>`;
                                continue;
                            }
                        }
                        if (tokens[I] == "else") {
                            pageLines[
                                i
                            ] += `<span class="func for">${tokens[I]}</span>`;
                            continue;
                        }
                        if (["let", "var", "const"].includes(tokens[I])) {
                            pageLines[
                                i
                            ] += `<span class="initVar">${tokens[I]}</span>`;
                            continue;
                        }
                        pageLines[i] += `<span class="var">${tokens[I]}</span>`;
                        continue;
                    } else if (tokens[I].match(/^"[^"]*"$/)) {
                        pageLines[
                            i
                        ] += `<span class="string">${tokens[I]}</span>`;
                        continue;
                    } else if (tokens[I].match(/^[0-9]+\.[0-9]+|[0-9]+$/)) {
                        pageLines[
                            i
                        ] += `<span class="number">${tokens[I]}</span>`;
                        continue;
                    }
                    pageLines[i] += `<span>${tokens[I]}</span>`;
                }
            }
            pageLines[i] += "</span>";
            continue;
        }
        if (pageLines[i].slice(0, 2) == "# ") {
            pageLines[i] = `<h1${label}>${pageLines[i].slice(2)}</h1>`;
        } else if (pageLines[i].slice(0, 3) == "## ") {
            pageLines[i] = `<h2${label}>${pageLines[i].slice(3)}</h2>`;
        } else if (pageLines[i].slice(0, 4) == "### ") {
            pageLines[i] = `<h3${label}>${pageLines[i].slice(4)}</h3>`;
        } else if (pageLines[i].slice(0, 5) == "#### ") {
            pageLines[i] = `<h4${label}>${pageLines[i].slice(5)}</h4>`;
        } else if (pageLines[i].slice(0, 6) == "##### ") {
            pageLines[i] = `<h5${label}>${pageLines[i].slice(6)}</h5>`;
        } else if (pageLines[i].slice(0, 7) == "###### ") {
            pageLines[i] = `<h6${label}>${pageLines[i].slice(7)}</h6>`;
        } else if (pageLines[i].slice(0, 3) == "!# ") {
            pageLines[i] = `<h1${label} class="noMargin">${pageLines[i].slice(
                3
            )}</h1>`;
        } else if (pageLines[i].slice(0, 4) == "!## ") {
            pageLines[i] = `<h2${label} class="noMargin">${pageLines[i].slice(
                4
            )}</h2>`;
        } else if (pageLines[i].slice(0, 5) == "!### ") {
            pageLines[i] = `<h3${label} class="noMargin">${pageLines[i].slice(
                5
            )}</h3>`;
        } else if (pageLines[i].slice(0, 6) == "!#### ") {
            pageLines[i] = `<h4${label} class="noMargin">${pageLines[i].slice(
                6
            )}</h4>`;
        } else if (pageLines[i].slice(0, 7) == "!##### ") {
            pageLines[i] = `<h5${label} class="noMargin">${pageLines[i].slice(
                7
            )}</h5>`;
        } else if (pageLines[i].slice(0, 8) == "!###### ") {
            pageLines[i] = `<h6${label} class="noMargin">${pageLines[i].slice(
                8
            )}</h6>`;
        } else if (pageLines[i].slice(0, 14) == "@ContentTable ") {
            pageLines[i] = `<ul>
                ${pageLines[i]
                    .slice(14)
                    .split(" ")
                    .map((value) => {
                        return `<li><a href="#${value}">${value}</a></li>`;
                    })
                    .join("\n")}
                </ul>`;
        } else if (pageLines[i].slice(0, 10) == "@SetTitle ") {
            title = pageLines[i].slice(10);
            pageLines[i] = "";
        }
        label = "";
        if (pageLines[i].slice(0, 10) == "@SetLabel ") {
            label = ` id="${pageLines[i].slice(10)}"`;
            pageLines[i] = "";
        }
        if (block) {
            pageLines[i] += "<br>";
        }
    }
    let r = fs
        .readFileSync(path.join(__dirname, "./template.html"), "utf-8")
        .replace(/%Content%/, pageLines.join("\n"))
        .replace(/%Title%/, title)
        .replace(/%Footer%/, defaultFooter)
        .split(/(\([^\)]*\)\[[^\]]*\])/)
        .map((value, index) => {
            if (index % 2 == 1) {
                return (
                    "<a href='" +
                    value.match(/\[[^\]]*\]/)[0].slice(1, -1) +
                    "'>" +
                    value.match(/\([^\)]*\)/)[0].slice(1, -1) +
                    "</a>"
                );
            }
            return value;
        })
        .join("")
        .replace(/\\/g, "<br>");
    r = r
        .split(/(%relative [^%]+%)/g)
        .map((value, index) => {
            if (index % 2 == 1) {
                console.log(
                    path.relative(
                        FilePath,
                        path.join(__dirname, "./build/", value.slice(10, -1))
                    )
                );
                return path.relative(
                    FilePath,
                    path.join(__dirname, "./build/", value.slice(10, -1))
                );
            }
            return value;
        })
        .join("");
    return r;
}

for (let i of pages) {
    fs.mkdirSync(path.dirname(path.join(__dirname, "./build/", i + ".html")), {
        recursive: true,
    });
    fs.writeFileSync(
        path.join(__dirname, "./build/", i + ".html"),
        buildPage(
            fs.readFileSync(
                path.join(__dirname, "./pages/", i + ".page"),
                "utf-8"
            ),
            path.dirname(path.join(__dirname, "./build/", i + ".html"))
        )
    );
}
