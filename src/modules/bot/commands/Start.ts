import type { BotCommand } from '@/modules/bot/BotCommand';
import { Context } from 'grammy';

export default class StartCommand implements BotCommand {
    command = 'start';
    description = 'Начать работу с ботом';

    readonly #reply: string;

    constructor(commandList: BotCommand[]) {
        const commandsHelp = commandList
            .reduce((str, c) => str + `/${c.command} — ${c.description}\n`, '');
        this.#reply = `Список доступных команд:\n\n${commandsHelp}`;
    }

    async action(ctx: Context) {
        await ctx.reply(this.#reply);
    }
}
