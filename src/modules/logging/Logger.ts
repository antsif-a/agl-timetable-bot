import * as util from 'node:util';
import chalk from 'chalk';
import type { EventHandler } from '@events';

import type { ApplicationEvents, ApplicationModule } from '@/Application';

export enum LogLevel {
    debug,
    info,
    warn,
    error,
}

export default class Logger implements ApplicationModule {
    private constructor() {
    }

    static create() {
        return new Logger();
    }

    init(events: EventHandler<ApplicationEvents>) {
        events.on('app:error', (error) => {
            this.error(error, 'app');
        });

        events.on('bot:error', (error) => {
            this.error(error, 'bot');
        });

        events.on('bot:start', (info) => {
            this.info(
                `Bot ${info.first_name} (${info.username}) is online! ID: ${info.id}`,
                'bot'
            );
        });

        events.on('bot:stop', () => {
           this.info('Stopped bot', 'bot');
        });

        events.on('bot:message',
            ({ text }, { username, first_name, last_name, id }) => {
            const fullName = last_name ? `${first_name} ${last_name}` : first_name;
            this.debug(`Message from ${username || id} (${fullName}): ${text}`, 'bot');
        });

        events.on('vk:start', ({ name, id }) => {
            this.info(`Started long polling from ${id} (${name}) group`, 'vk');
        });

        events.on('db:connect', () => {
            this.info('Connected to database', 'db');
        });

        events.on('db:disconnect', () => {
            this.info('Disconnected from database', 'db');
        });
    }

    debug(message: string, scope?: string) {
        this.log(message, LogLevel.debug, scope);
    }

    warn(message: string, scope?: string) {
        this.log(message, LogLevel.warn, scope);
    }

    info(message: string, scope?: string) {
        this.log(message, LogLevel.info, scope)
    }

    error(message: string, scope?: string): void;
    error(error: Error, scope?: string): void;
    error(error: string | Error, scope?: string) {
        this.log(
            error instanceof Error
                ? util.inspect(error)
                : error,
            LogLevel.error,
            scope,
        );
    }

    private log(message: string, level: LogLevel, scope?: string) {
        const prefix =
            level == LogLevel.debug ? chalk.gray('[D]') :
                    level == LogLevel.info ? chalk.blue('[I]') :
                        level == LogLevel.warn ? chalk.yellow('[W]') :
                            level == LogLevel.error ? chalk.red('[E]') : null;

        const date = chalk.dim.underline(new Date().toLocaleString());

        console.log(`${date} (${scope || 'app'})\t${prefix} ${message}`);
    }
}
