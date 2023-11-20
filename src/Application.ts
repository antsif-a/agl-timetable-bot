import { exit } from 'node:process';
import { EventEmitter } from 'node:events';
import type { BotError } from 'grammy';
import type { Message, User, UserFromGetMe } from 'grammy/types';
import type { EventHandler, EventMap } from '@events';
import type { GroupsGroup, WallWallpostFull } from '@vk';

export interface ApplicationEvents extends EventMap {
    ['app:error']: (error: Error) => void;

    ['process:warn']: (warn: Error) => void;

    ['bot:start']: (botInfo: UserFromGetMe) => void;
    ['bot:error']: (error: BotError) => void;
    ['bot:message']: (message: Message, user: User) => void;
    ['bot:stop']: () => void;

    ['vk:start']: (group: GroupsGroup) => void;
    ['vk:post']: (wallItem: WallWallpostFull) => void;
    ['vk:stop']: () => void;

    ['db:connect']: () => void;
    ['db:disconnect']: () => void;
}

export interface ApplicationModule {
    init?(events: EventHandler<ApplicationEvents>): void;
    start?(): Promise<void> | void;
    dispose?(): Promise<void> | void;
}

export class Application {
    private readonly state = {
        initialized: false,
        started: false,
    };

    readonly #events: EventHandler<ApplicationEvents>
        = new EventEmitter();

    private readonly modules: ApplicationModule[] = [];

    addModule(applicationModule: ApplicationModule) {
        this.modules.push(applicationModule);
        return this;
    }

    init() {
        if (this.state.initialized) {
            throw new Error('Application is already initialized.');
        }

        for (const module of this.modules) {
            module.init && module.init(this.events);
        }

        // it's last to allow other modules add their own listeners
        this.events.on('app:error', () => exit(1));
        this.state.initialized = true;

        return this;
    }

    async start() {
        if (this.state.started) {
            throw new Error('Application has already started.');
        }

        for (const module of this.modules) {
            module.start && await module.start();
        }

        this.state.started = true;

        return this;
    }

    async dispose() {
        for (const module of this.modules) {
            module.dispose && await module.dispose();
        }
        return this;
    }

    get events(): EventHandler<ApplicationEvents> {
        return this.#events;
    }
}
