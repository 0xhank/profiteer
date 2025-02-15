export const cleanWikiArticle = (articleHtml: string) => {
    // remove all divs that have class name "box-Missing_Information"
    const parser = new DOMParser();
    const doc = parser.parseFromString(articleHtml, "text/html");
    const divs = doc.querySelectorAll("table");
    divs.forEach((div) => {
        if (div.className.includes("box-Missing_information")) {
            div.remove();
        } else if (div.className.includes("box-Multiple_issues")) {
            div.remove();
        } else if (div.className.includes("box-More_citations_needed")) {
            div.remove();
        } else if (div.className.includes("hatnote")) {
            div.remove();
        } else if (div.className.includes("box-Citation_needed")) {
            div.remove();
        } else if (div.className.includes("box-Citation_style")) {
            div.remove();
        }
    });

    // go through each a and turn it into a div if the href is not a wiki link
    const links = doc.querySelectorAll("a");
    links.forEach((link) => {
        if (!checkValidWikiLink(link.href)) {
            const span = document.createElement("span");
            span.innerHTML = link.innerHTML;
            link.replaceWith(span);
        } 
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

