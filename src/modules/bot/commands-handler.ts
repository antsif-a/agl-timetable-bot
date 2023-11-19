import type { PrismaClient } from '@prisma/client';
import type { Bot as GrammyBot } from 'grammy';
import { VKApi } from 'node-vk-sdk';

import TimetableCommand from '@/modules/bot/commands/timetable';
import SubscribeCommand from '@/modules/bot/commands/subscribe';
import UnsubscribeCommand from '@/modules/bot/commands/unsubscribe';
import type { BotCommand } from '@/modules/bot/bot-command';

export class CommandsHandler {
    private readonly commands: BotCommand[];

    constructor(vkClient: VKApi, dbClient: PrismaClient) {
        this.commands = [
            new TimetableCommand(vkClient),
            new SubscribeCommand(dbClient),
            new UnsubscribeCommand(dbClient),
        ];
    }

    async init(bot: GrammyBot) {
        this.commands.forEach(
            (c) => bot.command(c.command, (ctx) => c.action(ctx)));

        await bot.api.setMyCommands(
            this.commands.map(({ command, description }) => {
                return { command, description };
            }));
    }
}
