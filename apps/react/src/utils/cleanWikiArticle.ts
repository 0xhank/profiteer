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
        }
    });

    // go through each a and turn it into a div if the href is not a wiki link
    const links = doc.querySelectorAll("a");
    links.forEach((link) => {
        if (!checkValidWikiLink(link.href)) {
            const span = document.createElement("span");
            span.innerHTML = link.innerHTML;
            link.replaceWith(span);
        } else {
            // Extract the path from the full URL
            const path = link.getAttribute("href")?.split("/").pop() || "";
            const linkText = link.innerHTML;

            // Create a wrapper span that React can hydrate into a Link
            const wrapper = document.createElement("span");
            wrapper.setAttribute("data-internal-link", "true");
            wrapper.setAttribute("data-to", path);
            wrapper.innerHTML = linkText;
            link.replaceWith(wrapper);
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

export const cleanTopicURI = (topic: string) => {
    return decodeURIComponent(topic)
        .split("_")
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
};
