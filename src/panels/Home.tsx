import {FC, useEffect, useState} from "react";
import {
    Panel,
    PanelHeader,
    List,
    Group,
    Button,
    Div,
    NavIdProps,
    SplitCol,
    SplitLayout,
    Title,
    Text
} from '@vkontakte/vkui';
import {newsType} from "../types.ts";
import {getNews} from "../api/getNews.ts";

export const Home: FC<NavIdProps> = ({id}) => {
    const [news, setNews] = useState<newsType[]>([]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const fetchedNews = await getNews();
                setNews(fetchedNews.sort((a, b) => b.date.getTime() - a.date.getTime()));
            } catch (error) {
                setError('Ошибка загрузки новостей');
            }
        };

        fetchNews();
        const intervalId = setInterval(fetchNews, 60000); // Обновление каждую минуту

        return () => clearInterval(intervalId); // Очистка интервала
    }, []);

    const handleRefresh = async () => {
        try {
            const fetchedNews = await getNews();
            setNews(fetchedNews.sort((a, b) => b.date.getTime() - a.date.getTime()));
        } catch (error) {
            setError('Ошибка при обновлении новостей');
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader>Главная страница</PanelHeader>
            <Group>
                <Button stretched size="l" mode="secondary" onClick={handleRefresh}>
                    Обновить новости
                </Button>
            </Group>
            <Group>
                <Div>
                    {error ? (
                        <Div>{error}</Div>
                    ) : (
                        <List>
                            {news.map((newsItem) => (
                                <Div key={newsItem.id}
                                     onClick={() => console.log('Переход на страницу новости', newsItem.id)}>
                                    <SplitLayout>
                                        <SplitCol>
                                            <Div>
                                                <Title level="2">{newsItem.title}</Title>
                                                <Text>by {newsItem.authorNick}</Text>
                                            </Div>
                                        </SplitCol>
                                        <SplitCol>
                                            <Div style={{textAlign:'right'}}>
                                                <Text>rating: {newsItem.rating}</Text>
                                                <Text>date: {newsItem.date.toLocaleDateString().split('/').join('.')}</Text>
                                            </Div>
                                        </SplitCol>
                                    </SplitLayout>
                                </Div>
                            ))}
                        </List>
                    )}
                </Div>
            </Group>
        </Panel>
    );
};