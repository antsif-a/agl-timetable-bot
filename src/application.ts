import { EventEmitter } from 'node:events';
import { UserFromGetMe } from 'grammy/types';
import { EventHandler, EventMap } from '@events';
import { WallWallpostFull } from 'node-vk-sdk/distr/src/generated/Models';

export interface ApplicationEvents extends EventMap {
    ['bot:start']: (botInfo: UserFromGetMe) => void;

    ['vk:start']: () => void;
    ['vk:post']: (wallItem: WallWallpostFull) => void;

    ['db:start']: () => void;

    ['app:error']: (e: Error) => void;
}

export interface ApplicationModule {
    init?(events: EventHandler<ApplicationEvents>): void;
    start?(): Promise<void> | void;
    dispose?(): Promise<void> | void;
}

export class Application {
    // @ts-ignore TODO: make EventHandler resolve to EventEmitter correctly
    readonly #events: EventHandler<ApplicationEvents>
        = new EventEmitter();

    private readonly modules: ApplicationModule[] = [];

    addModule(applicationModule: ApplicationModule) {
        this.modules.push(applicationModule);
        return this;
    }

    init() {
        for (const module of this.modules) {
            module.init && module.init(this.events);
        }
        return this;
    }

    async start() {
        for (const module of this.modules) {
            module.start && await module.start();
        }
        return this;
    }

    async dispose() {
        for (const module of this.modules) {
            module.dispose && module.dispose();
        }
        return this;
    }

    get events(): EventHandler<ApplicationEvents> {
        return this.#events;
    }
}
