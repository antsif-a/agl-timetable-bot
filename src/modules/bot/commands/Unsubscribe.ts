import type { PrismaClient } from '@prisma/client';
import type { Context } from 'grammy';

import type { BotCommand } from '@/modules/bot/BotCommand';

export default class UnsubscribeCommand implements BotCommand {
    command = 'unsubscribe';
    description = 'Отписаться от уведомлений'

    constructor(
        private db: PrismaClient,
    ) {}

    async action(ctx: Context) {
        const chatId = await ctx.getChat().then((c) => c.id);

        const subscribed = await
            this.db.subscriber.findUnique({ where: { chatId } });

        if (!subscribed) {
            await ctx.reply('Вы не подписаны!');
        } else {
            await this.db.subscriber.delete({ where: { chatId } });
            await ctx.reply('Вы отписались от уведомлений');
        }
    }
}
