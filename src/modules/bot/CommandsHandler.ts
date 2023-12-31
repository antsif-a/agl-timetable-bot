import type { PrismaClient } from '@prisma/client';
import type { Bot as GrammyBot } from 'grammy';
import { VKApi } from 'node-vk-sdk';

import TimetableCommand from '@/modules/bot/commands/Timetable';
import SubscribeCommand from '@/modules/bot/commands/Subscribe';
import UnsubscribeCommand from '@/modules/bot/commands/Unsubscribe';
import StartCommand from '@/modules/bot/commands/Start';
import type { BotCommand } from '@/modules/bot/BotCommand';

export class CommandsHandler {
    private readonly commands: BotCommand[];

    constructor(vkClient: VKApi, dbClient: PrismaClient) {
        this.commands = [
            new TimetableCommand(vkClient),
            new SubscribeCommand(dbClient),
            new UnsubscribeCommand(dbClient),
        ];

        this.commands.push(new StartCommand(this.commands));
    }

    async init(bot: GrammyBot) {
        this.commands.forEach(
            (c) => bot.command(c.command, (ctx) => c.action(ctx)));

        await bot.api.setMyCommands(this.commands);
    }
}
