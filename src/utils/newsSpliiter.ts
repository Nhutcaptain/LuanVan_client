import { NewsData } from "@/data/news_data";

export const newSplitter = (articles: NewsData[]) => {
    const sideNews = articles.slice(0, 2);
    const mainNews = articles.slice(2, 3);
    const otherNews = articles.slice(3,7);
    return { sideNews, mainNews, otherNews };
}

