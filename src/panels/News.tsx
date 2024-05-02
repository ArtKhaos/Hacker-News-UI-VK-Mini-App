import {FC, useEffect, useState} from 'react';
import {Button, Div, Link, Panel, PanelHeader, Text, Title} from '@vkontakte/vkui';
import {useEnableSwipeBack, useParams} from "@vkontakte/vk-mini-apps-router";
import {commentType, newsType} from "../types";
import {getComment, getComments, getNewsDetails} from "../api/getNews";

type NewsProps = {
    id: string;
    go: (path: string) => void;
    news: newsType[];
};

export const News: FC<NewsProps> = ({id, go, news}) => {

    useEnableSwipeBack()
    const [currentNews, setCurrentNews] = useState<newsType | null>(null);
    const [comments, setComments] = useState<commentType[] | null>(null);
    const [error, setError] = useState<string>('');
    const params = useParams<'id'>();


    // State для вложенных комментариев
    const [expandedComments, setExpandedComments] = useState<{
        [key: number]: commentType[]
    }>({});


    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const newsId = parseInt(params.id, 10);
                const currentNews = news.find(newsItem => newsItem.id === newsId);

                if (currentNews && isMounted) {
                    setCurrentNews(currentNews);

                    if (currentNews.kids) {
                        const fetchedComments = await getComments(currentNews.kids);
                        if (isMounted) {
                            setComments(fetchedComments);
                        }
                    }
                } else {
                    const fetchedNews = await getNewsDetails(newsId);
                    if (fetchedNews && isMounted) {
                        setCurrentNews(fetchedNews);

                        if (fetchedNews.kids) {
                            const fetchedComments = await getComments(fetchedNews.kids);
                            if (isMounted) {
                                setComments(fetchedComments);
                            }
                        }
                    } else {
                        setError('Новость не найдена');
                    }
                }
            } catch (error) {
                setError('Произошла ошибка при загрузке новости');
            }
        };

        fetchData().then();

        return () => {
            isMounted = false;
        };
    }, [params.id, news]);

    const refreshComments = async () => {
        if (currentNews && currentNews.kids) {
            try {
                const fetchedComments = await getComments(currentNews.kids);
                setComments(fetchedComments);
            } catch (error) {
                setError('Произошла ошибка при обновлении комментариев');
            }
        }
    };

    const declineComments = (count: number): string => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (count !== undefined) {
            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                return `${count} комментариев`;
            }

            switch (lastDigit) {
                case 1:
                    return `${count} комментарий`;
                case 2:
                case 3:
                case 4:
                    return `${count} комментария`;
                default:
                    return `${count} комментариев`;
            }
        } else {
            return 'Количество комментариев не найдено'
        }
    };

    const renderComments = (comments: commentType[], level = 0) => {
        return comments.map((comment) => (
            <Div key={comment.id}>
                <Title level='3'>{comment.by}</Title>
                <Text dangerouslySetInnerHTML={{__html: comment.text}}/>
                {comment.kids && comment.kids.length > 0 && (
                    <Div>
                        <Button
                            onClick={async () => {
                                const fetchedComments = await Promise.all(
                                    comment.kids.map(async (id) => {
                                        const fetchedComment = await getComment(id);
                                        if (fetchedComment && fetchedComment.deleted) {
                                            return {
                                                id,
                                                by: 'Удалён',
                                                text: 'Удалённый комментарий',
                                                parent: comment.id,
                                                time: 0,
                                                type: 'comment',
                                                kids: [],
                                                deleted: true,
                                            };
                                        }
                                        return fetchedComment;
                                    })
                                );
                                setExpandedComments((prevExpandedComments) => ({
                                    ...prevExpandedComments,
                                    [comment.id]: fetchedComments.filter((comment) => comment !== null),
                                }));
                            }}
                        >
                            Показать дочерние комментарии ({comment.kids.length})
                        </Button>
                    </Div>
                )}
                {expandedComments[comment.id] &&
                    renderComments(expandedComments[comment.id], level + 1)}
            </Div>
        ));
    };

    return (
        <Panel id={id}>
            <PanelHeader>Новость</PanelHeader>
            {error ? (
                <Div>{error}</Div>
            ) : currentNews ? (
                <Div>
                    <Link href={`https://news.ycombinator.com/item?id=${currentNews.id}`} target="_blank"
                          rel="noopener noreferrer">
                        Ссылка на новость
                    </Link>
                    <Title level="2">{currentNews.title ? currentNews.title : 'Название не найдено'}</Title>
                    <Text>{currentNews.date.toLocaleDateString().split('/').join('.')}</Text>
                    <Text>{currentNews.authorNick}</Text>
                    <Div><Button onClick={() => go('/')}>Вернуться к списку новостей</Button></Div>
                    <Text>{declineComments(currentNews.descendants)}</Text>
                    <Div>
                        <Button onClick={refreshComments}>Обновить комментарии</Button>
                    </Div>
                    {currentNews.kids && currentNews.kids.length > 0 ? (
                        comments ? (
                            renderComments(comments)
                        ) : (
                            <Text>Загрузка комментариев...</Text>
                        )) : ('')
                    }
                </Div>
            ) : (
                <Text>Загрузка новости...</Text>
            )}
        </Panel>
    );
};