const nameToLink = (link: string) => {
    const cleanedArticleName = link
        .replace(/_/g, "%20")
        .replace(/ /g, "%20")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/,/g, "%2C");
    return cleanedArticleName;
};

const linkToName = (link: string) => {
    const cleanedArticleName = link
        .replace(/^\/wiki\//, "")
        .replace(/_/g, " ")
        .replace(/%20/g, " ")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%2C/g, ",");
    return cleanedArticleName;
};

export { linkToName, nameToLink };
