export type EventMap = Record<string | symbol, (...args: any[]) => void>;

export interface EventHandler<Events extends EventMap> {
    addListener(event: keyof Events, listener: Events[keyof Events]): this;
    on(event: keyof Events, listener: Events[keyof Events]): this;
    once(event: keyof Events, listener: Events[keyof Events]): this;
    prependListener(event: keyof Events, listener: Events[keyof Events]): this;
    prependOnceListener(
        event: keyof Events, listener: Events[keyof Events]): this;

    off(event: keyof Events, listener: Events[keyof Events]): this;
    removeAllListeners(event?: keyof Events): this;
    removeListener(event: keyof Events, listener: Events[keyof Events]): this;

    emit(
        event: keyof Events, ...args: Parameters<Events[keyof Events]>): boolean;
    eventNames(): (keyof Events)[];
    /*
    * using Function here because typescript can't
    * resolve (...args: any[]) => void to Function
    */
    rawListeners(event: keyof Events): Function[];
    listeners(event: keyof Events): Function[];
    listenerCount(event: keyof Events): number;

    getMaxListeners(): number;
    setMaxListeners(maxListeners: number): this;
}
