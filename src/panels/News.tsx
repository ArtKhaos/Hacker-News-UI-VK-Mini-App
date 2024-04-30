import {FC} from 'react';
import {Button, NavIdProps, Panel, Text} from '@vkontakte/vkui';
import {useRouteNavigator} from "@vkontakte/vk-mini-apps-router";

export const News: FC<NavIdProps> = ({id}) => {
    const routeNavigator = useRouteNavigator();

    return (
        <Panel id={id}>
            <Text>Сап!!!</Text>
            <Button onClick={() => routeNavigator.push('/')}>Вернибте!!!!</Button>
        </Panel>
    );
};
