import { UserFromGetMe } from 'grammy/types';
import { ApplicationEvents, ApplicationModule } from '@/application';
import { EventHandler } from '@events';
import chalk from 'chalk';

export default class Logger implements ApplicationModule {
    private constructor() {}

    static create() {
        return new Logger();
    }

    init(events: EventHandler<ApplicationEvents>) {
        events.on('bot:start', (info: UserFromGetMe) => {
            this.info(
                `Bot ${info.first_name} (${info.username}) is online! ID: ${info.id}`,
            );
        });

        events.on('vk:start', () => {
            this.info('VK bridge set up.');
        });

        events.on('db:start', () => {
            this.info('Connected to database.');
        });

        events.on('app:error', (e: Error) => {
            this.error(e.toString());
        });
    }

    private info(message: string) {
        console.info(chalk.blue('[I]') + ` ${message}`);
    }

    private error(message: string) {
        console.info(chalk.red('[E]') + ` ${message}`);
    }
}
