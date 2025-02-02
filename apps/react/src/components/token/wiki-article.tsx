const WikiArticle = ({ articleHtml }: { articleHtml: string }) => {
    return <div id="article" dangerouslySetInnerHTML={{ __html: articleHtml }} />;
};

export default WikiArticle;
