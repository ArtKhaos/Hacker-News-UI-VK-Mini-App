import {newsType} from "../types.ts";

async function getNewsIDs():Promise<number[]> {
    const newStories = 'https://hacker-news.firebaseio.com/v0/newstories.json';

    try {
        const response = await fetch(newStories);
        if (!response.ok) {
            throw new Error('Ответ сети не в порядке');
        }
        const IDs: number[] = await response.json() as number[];

        return IDs;

    } catch (error) {
        console.error("Ошибка получения новостей: ", error);
        throw error;
    }
}

export async function getNews() {
    const IDs = await getNewsIDs();

    const newsPromises = IDs.slice(0, 100).map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ответ не в порядке');
                }
                return response.json();
            })
            .then(apiResponse => transformApiResponseToNewsType(apiResponse))
            .catch(error => {
                console.error('Ошибка загрузки новости:', error);
                return null;
            })
    );

    const news = await Promise.all(newsPromises);
    return news.filter(item => item !== null); // Фильтруем неудачные запросы
}

function transformApiResponseToNewsType(apiResponse: any): newsType {
    return {
        id: apiResponse.id,
        title: apiResponse.title,
        rating: apiResponse.score,
        authorNick: apiResponse.by,
        date: new Date(apiResponse.time * 1000) // Преобразование Unix timestamp в объект Date
    };
}