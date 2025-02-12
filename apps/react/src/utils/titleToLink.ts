
const linkToName = (link: string) => {
    const cleanedArticleName = link.replace(/ /g, "_").replace(/%20/g, "_").replace(/%28/g, "(").replace(/%29/g, ")");
    return cleanedArticleName;
}

const nameToLink = (name: string) => {
    const cleanedArticleName = name.replace(/ /g, "_").replace(/%20/g, "_").replace(/%28/g, "(").replace(/%29/g, ")");
    return cleanedArticleName;
}

export { linkToName, nameToLink };