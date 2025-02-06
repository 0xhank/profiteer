const WikiArticle = ({ articleHtml }: { articleHtml: string }) => {
    return <div id="article" className="w-full" dangerouslySetInnerHTML={{ __html: articleHtml }} />;
};

export default WikiArticle;
