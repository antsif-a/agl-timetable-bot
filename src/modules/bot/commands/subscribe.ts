import { PrismaClient } from '@prisma/client';
import { Context } from 'grammy';
import { BotCommand } from '@/modules/bot/bot-command';

export default class SubscribeCommand implements BotCommand {
    command = 'subscribe';
    description = 'Подписаться на уведомления';

    constructor(
        private db: PrismaClient,
    ) {}

    async action(ctx: Context) {
        const chatId = await ctx.getChat().then((c) => c.id);

        const subscribed = await
            this.db.subscriber.findUnique({ where: { chatId } });

        if (subscribed) {
            await ctx.reply('Вы уже подписаны!');
        } else {
            await this.db.subscriber.create({ data: { chatId } });
            await ctx.reply('Вы подписались на уведомления');
        }
    }
}
