import { commentType, newsType } from "../types";

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

async function fetchData(url: string): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}/${url}`);
        if (!response.ok) {
            throw new Error('Ответ не в порядке');
        }
        return await response.json();
    } catch (error) {
        console.error(`Ошибка загрузки данных: ${error}`);
        throw error;
    }
}

async function getNewsIDs(): Promise<number[]> {
    const newsIDs = await fetchData('newstories.json');
    return newsIDs || [];
}

export async function getComments(IDs: number[]): Promise<commentType[]> {
    const commentPromises = IDs.map(id => fetchData(`item/${id}.json`));
    const comments = await Promise.all(commentPromises);
    return comments.filter((item): item is commentType => item !== null);
}

export async function getComment(id: number): Promise<commentType | null> {
    return await fetchData(`item/${id}.json`);
}

export async function getNews() {
    const IDs = await getNewsIDs();
    const newsPromises = IDs.slice(0, 100).map(id => fetchData(`item/${id}.json`));
    const news = await Promise.all(newsPromises);
    return news
        .filter((item): item is newsType => item !== null)
        .map(transformApiResponseToNewsType);
}

function transformApiResponseToNewsType(apiResponse: any): newsType {
    return {
        id: apiResponse.id,
        title: apiResponse.title,
        rating: apiResponse.score,
        authorNick: apiResponse.by,
        date: new Date(apiResponse.time * 1000),
        url: apiResponse.url,
        kids: apiResponse.kids,
        descendants: apiResponse.descendants
    };
}

export async function getNewsDetails(id: number): Promise<newsType | null> {
    const newsDetails = await fetchData(`item/${id}.json`);
    return newsDetails ? transformApiResponseToNewsType(newsDetails) : null;
}
