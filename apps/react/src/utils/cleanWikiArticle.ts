export const cleanWikiArticle = (articleHtml: string) => {
    // remove all divs that have class name "box-Missing_Information"
    const parser = new DOMParser();
    const doc = parser.parseFromString(articleHtml, "text/html");
    const divs = doc.querySelectorAll("table");
    divs.forEach((div) => {
        if (div.className.includes("box-Missing_information")) {
            div.remove();
        }
    });

    // go through each a and turn it into a div if the href is not a wiki link
    const links = doc.querySelectorAll("a");
    links.forEach((link) => {
        // if (!checkValidWikiLink(link.href)) {
        //     const div = document.createElement("span");
        //     div.innerHTML = link.innerHTML;
        //     link.replaceWith(div);
        // }
    });
    return doc.body.innerHTML;
};

export const checkValidWikiLink = (link: string) => {
    if (link.includes("File:")) {
        return false;
    }
    if (link.includes("Category:")) {
        return false;
    }
    if (link.includes("Portal:")) {
        return false;
    }
    if (link.includes("Help:")) {
        return false;
    }
    return true;
};
