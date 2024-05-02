import { FC } from "react";
import {
    Panel,
    PanelHeader,
    List,
    Button,
    Div,
    Title,
    Text
} from '@vkontakte/vkui';
import { newsType } from "../types";
import { getNews } from "../api/getNews";

type HomeProps = {
    id: string;
    go: (path: string) => void;
    news: newsType[];
    setNews: (news: newsType[]) => void;
    error: string;
    setError: (err: string) => void;
}

export const Home: FC<HomeProps> = ({ id, go, news, setNews, error, setError }) => {

    const handleRefresh = async () => {
        try {
            const fetchedNews = await getNews();
            setNews(fetchedNews.sort((a, b) => b.date.getTime() - a.date.getTime())); // Сортировка новостей по дате
        } catch (error) {
            setError('Ошибка при обновлении новостей');
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader>Главная страница</PanelHeader>
            <Div>
                <Button stretched size="l" mode="secondary" onClick={handleRefresh}>
                    Обновить новости
                </Button>
            </Div>
            {error ? (
                <Div>{error}</Div>
            ) : (
                <List>
                    {news.map((newsItem) => (
                        <Div
                            key={newsItem.id}
                            style={{ display: 'flex', cursor: 'pointer' }}
                            onClick={() => go(`/news/${newsItem.id}`)}
                        >
                            <div style={{ flexGrow: 1 }}>
                                <Title level="2">{newsItem.title}</Title>
                                <Text>от {newsItem.authorNick}</Text>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Text style={{textWrap:'nowrap'}}>рейтинг: {newsItem.rating}</Text>
                                <Text>{newsItem.date.toLocaleDateString().split('/').join('.')}</Text>
                            </div>
                        </Div>
                    ))}
                </List>
            )}
        </Panel>
    );
};