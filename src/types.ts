export type newsType = {
    id: number,
    title:string,
    rating:number,
    descendants: number,
    authorNick:number,
    date: Date,
    url: string,
    kids: number[];
}

export type GoFunctionProp = {
    go: (path: string) => void,
};

export type commentType = {
    by: string,
    id: number,
    parent: number,
    text: string,
    time: number,
    type: string,
    kids?: number[],
    deleted: boolean
}