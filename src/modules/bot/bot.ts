import { ApplicationEvents, ApplicationModule } from '@/application';
import { Bot as GrammyBot } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { CommandsHandler } from '@/modules/bot/commands-handler';
import type { UserFromGetMe } from 'grammy/out/types';
import { VKApi } from 'node-vk-sdk';
import { EventHandler } from '@events';
import {
    PhotosPhoto,
    PhotosPhotoSizes, WallWallpost,
    WallWallpostAttachment,
} from 'node-vk-sdk/distr/src/generated/Models';

function findLargestPhotoSize(photo: PhotosPhoto) {
    return photo.sizes
        .sort((a: PhotosPhotoSizes, b: PhotosPhotoSizes) => b.width - a.width)
        .at(0)!;
}

export default class Bot implements ApplicationModule {
    private readonly bot: GrammyBot;
    private readonly dbClient: PrismaClient;
    private readonly commands: CommandsHandler;
    private onStart: (botInfo: UserFromGetMe) => void = () => {};
    private onDatabaseConnect: () => void = () => {};

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
        this.onStart =
            (botInfo) => events.emit('bot:start', botInfo);

        this.onDatabaseConnect =
            () => events.emit('db:start');

        // send vk post to every user
        events.on('vk:post', async (post) => {
            const userChatIds = await this.dbClient.subscriber.findMany().
                then((subscribers) => subscribers.map((s => s.chatId)));

            if (userChatIds.length > 0) {
                await this.sendPostToUsers(post, userChatIds);
            }
        });
    }

    async sendPostToUsers(post: WallWallpost, userChatIds: number[]) {
        const { attachments, text } = post;
        const photoUrls = attachments
            .map((a: WallWallpostAttachment) =>
                findLargestPhotoSize(a.photo).url);

        // check to avoid unnecessary loops
        if (text || photoUrls.length > 0) {
            for (const userChatId of userChatIds) {
                if (photoUrls.length > 0) {
                    for (const photoUrl of photoUrls) {
                        await this.bot.api.sendPhoto(userChatId, photoUrl);
                    }
                }
                if (text) {
                    await this.bot.api.sendMessage(userChatId, text);
                }
            }
        }
    }

    async start() {
        await this.commands.init(this.bot);
        await this.dbClient.$connect()
            .then(this.onDatabaseConnect);
        await this.bot.start({ onStart: this.onStart });
    }

    dispose() {
        this.dbClient.$disconnect();
    }
}
