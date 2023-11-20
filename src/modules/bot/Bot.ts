import type { Buffer } from 'node:buffer';
import { exit } from 'node:process';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { run, RunnerHandle } from '@grammyjs/runner';
import { Bot as GrammyBot, InputFile } from 'grammy';
import type { UserFromGetMe } from 'grammy/types';
import { VKApi } from 'node-vk-sdk';
import type { EventHandler } from '@events';
import type {
    PhotosPhotoSizes,
    WallWallpostFull,
    WallWallpostAttachment,
} from '@vk';

import { ApplicationEvents, ApplicationModule } from '@/Application';
import { CommandsHandler } from '@/modules/bot/CommandsHandler';

function findLargestPhotoSize(sizes: PhotosPhotoSizes[]) {
    return sizes
        .sort((a: PhotosPhotoSizes, b: PhotosPhotoSizes) => b.width - a.width)
        .at(0)!;
}

export default class Bot implements ApplicationModule {
    private readonly bot: GrammyBot;
    private readonly dbClient: PrismaClient;
    private readonly commands: CommandsHandler;

    private onStart: (botInfo: UserFromGetMe) => void = () => {};
    private onStop: () => void = () => {};
    private onDatabaseConnect: () => void = () => {};
    private onDatabaseDisconnect: () => void = () => {};
    private botHandle?: RunnerHandle;

    private constructor(vkApi: VKApi, telegramToken: string) {
        this.bot = new GrammyBot(telegramToken);
        this.dbClient = new PrismaClient();
        this.commands = new CommandsHandler(vkApi, this.dbClient);
    }

    static create(telegramToken: string, vkUserToken: string) {
        const vkApi = new VKApi({
            token: vkUserToken,
            lang: 'ru'
        });

        return new Bot(vkApi, telegramToken);
    }

    init(events: EventHandler<ApplicationEvents>) {
        events.on('bot:error', () => exit(1));

        this.bot.catch((error) => events.emit('bot:error', error));
        this.bot.use(async (ctx, next) => {
            if (ctx.message) {
                events.emit('bot:message', ctx.message, ctx.message.from!);
            }

            await next();
        });

        this.onStart =
            (botInfo) => events.emit('bot:start', botInfo);

        this.onStop =
            () => events.emit('bot:stop');

        this.onDatabaseConnect =
            () => events.emit('db:connect');

        this.onDatabaseDisconnect =
            () => events.emit('db:disconnect');

        // send vk post to every user
        events.on('vk:post', async (post) => {
            const userChatIds = await this.dbClient.subscriber.findMany().
                then((subscribers) => subscribers.map((s => s.chatId)));

            if (userChatIds.length > 0) {
                await this.sendPostToUsers(post, userChatIds);
            }
        });
    }

    async sendPostToUsers(
        { attachments, text }: WallWallpostFull,
        userChatIds: number[],
    ) {
        if (attachments) {
            const photoUrls = attachments
                .map((a: WallWallpostAttachment) =>
                    findLargestPhotoSize(a.photo!.sizes!).url!);

            if (photoUrls.length > 0) {
                for (const photoUrl of photoUrls) {
                    const image = new InputFile(() =>
                        axios.get(photoUrl, {
                            responseType: 'arraybuffer'
                        }).then((res) => res.data as Buffer));

                    for (const userChatId of userChatIds) {
                        await this.bot.api.sendPhoto(userChatId, image);
                    }
                }
            }
        }

        if (text) {
            for (const userChatId of userChatIds) {
                await this.bot.api.sendMessage(userChatId, text);
            }
        }
    }

    async start() {
        await this.commands.init(this.bot);
        await this.dbClient.$connect()
            .then(this.onDatabaseConnect);

        this.botHandle = run(this.bot);

        this.bot.api.getMe()
            .then(this.onStart);
    }

    async dispose() {
        this.botHandle?.isRunning() && await this.botHandle?.stop()
            .then(this.onStop);
        await this.dbClient.$disconnect()
            .then(this.onDatabaseDisconnect);
    }
}
