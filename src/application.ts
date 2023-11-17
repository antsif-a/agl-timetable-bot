import { exit } from 'node:process';
import { EventEmitter } from 'node:events';
import { Message, User, UserFromGetMe } from 'grammy/types';
import { EventHandler, EventMap } from '@events';
import { WallWallpostFull } from 'node-vk-sdk/distr/src/generated/Models';
import { BotError } from 'grammy';

export interface ApplicationEvents extends EventMap {
    ['app:error']: (error: Error) => void;

    ['process:warn']: (warn: Error) => void;

    ['bot:start']: (botInfo: UserFromGetMe) => void;
    ['bot:error']: (error: BotError) => void;
    ['bot:message']: (message: Message, user: User) => void;

    ['vk:start']: () => void;
    ['vk:post']: (wallItem: WallWallpostFull) => void;

    ['db:start']: () => void;
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

        // it's last to allow other modules add their own listeners
        this.events.on('app:error', () => exit(1));

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
