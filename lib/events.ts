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

    emit<E extends keyof Events>(
        event: E, ...args: Parameters<Events[E]>): boolean;
    eventNames(): (keyof Events)[];
    rawListeners(event: keyof Events): Events[keyof Events][];
    listeners(event: keyof Events): Events[keyof Events][];
    listenerCount(event: keyof Events): number;

    getMaxListeners(): number;
    setMaxListeners(maxListeners: number): this;
}
