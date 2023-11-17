import chalk from 'chalk';
import { UserFromGetMe } from 'grammy/types';
import { ApplicationEvents, ApplicationModule } from '@/application';
import { EventHandler } from '@events';

export enum LogLevel {
    debug,
    info,
    warn,
    error,
}

export default class Logger implements ApplicationModule {
    private static loggerCount = 0;

    private constructor(
        private name: string,
    ) {}

    static create(name?: string) {
        if (!name) {
            name = this.loggerCount.toString();
            this.loggerCount++;
        }
        return new Logger(name);
    }

    init(events: EventHandler<ApplicationEvents>) {
        events.on('bot:start', (info: UserFromGetMe) => {
            this.info(
                `Bot ${info.first_name} (${info.username}) is online! ID: ${info.id}`,
            );
        });

        events.on('bot:message',
            ({ text }, { username, first_name, last_name }) => {
            const fullName = last_name ? `${first_name} ${last_name}` : first_name;
            this.debug(`Message from ${username} (${fullName}): ${text}`);
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

    debug(message: string) {
        this.log(message, LogLevel.debug);
    }

    warn(message: string) {
        this.log(message, LogLevel.warn);
    }

    info(message: string) {
        this.log(message, LogLevel.info)
    }

    error(message: string) {
        this.log(message, LogLevel.error);
    }

    private log(message: string, level: LogLevel) {
        const prefix =
            level == LogLevel.debug ? chalk.gray('[D]') :
                    level == LogLevel.info ? chalk.blue('[I]') :
                        level == LogLevel.warn ? chalk.yellow('[W]') :
                            level == LogLevel.error ? chalk.red('[E]') : null;

        const date = new Date().toLocaleString();

        console.log(`${this.name}\t- ${chalk.dim.underline(date)} ${prefix} ${message}`);
    }
}
