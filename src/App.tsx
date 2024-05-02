import {View, SplitLayout, SplitCol} from '@vkontakte/vkui';
import {useActiveVkuiLocation, useRouteNavigator} from '@vkontakte/vk-mini-apps-router';

import {Home, News} from './panels';
import {DEFAULT_VIEW_PANELS} from './routes';
import {useEffect, useState} from "react";
import {newsType} from "./types.ts";
import {getNews} from "./api/getNews.ts";

export const App = () => {
    const {panel: activePanel = DEFAULT_VIEW_PANELS.HOME} = useActiveVkuiLocation();
    const routeNavigator = useRouteNavigator();

    // News находится здесь для того, чтобы не подгружать новости снова при переходе на главную страницу,
    // т.к. библиотека перерисовывает компоненты при переходе между страницами
    const [error, setError] = useState<string>('');
    const [news, setNews] = useState<newsType[]>([]);
    const go = (path: string) => {
        routeNavigator.push(path);
    };

    // UseEffect с загрузкой новостей расположено здесь,
    // чтобы при просмотре новости данные всё равно обновлялись.
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const fetchedNews = await getNews();
                setNews(fetchedNews.sort((a, b) => b.date.getTime() - a.date.getTime()));
            } catch (error) {
                setError('Ошибка загрузки новостей');
            }
        };

        fetchNews().then();
        const intervalId = setInterval(fetchNews, 60000); // Обновление каждую минуту

        return () => clearInterval(intervalId); // Очистка интервала
    }, []);



    return (
        <SplitLayout>
            <SplitCol>
                <View activePanel={activePanel}>
                    <Home id="home" go={go} news={news} setNews={setNews} error={error} setError={setError}/>
                    <News id="news" go={go} news={news} />
                </View>
            </SplitCol>
        </SplitLayout>
    );
};
