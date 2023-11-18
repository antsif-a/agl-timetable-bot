import { env } from 'node:process';
import { Application } from '@/application';
import Logger from '@/modules/logging/logger';
import VKBridge from '@/modules/api/vkBridge';
import Bot from '@/modules/bot/bot';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TS_NODE_BASEURL: string;
            DATABASE_URL: string;
            TELEGRAM_BOT_TOKEN: string;
            VK_COMMUNITY_ACCESS_TOKEN: string;
            VK_COMMUNITY_ID: string;
            VK_USER_ACCESS_TOKEN: string;
        }
    }
}

const {
    VK_USER_ACCESS_TOKEN,
    VK_COMMUNITY_ACCESS_TOKEN,
    TELEGRAM_BOT_TOKEN,
} = env;
const VK_COMMUNITY_ID = Number.parseInt(env.VK_COMMUNITY_ID);

const app = new Application()
    // every module can access app's events and set listeners
    .addModule(Logger.create())
    .addModule(VKBridge.create(VK_COMMUNITY_ACCESS_TOKEN, VK_COMMUNITY_ID))
    .addModule(Bot.create(TELEGRAM_BOT_TOKEN, VK_USER_ACCESS_TOKEN));

process.on('warning', (warn) => app.events.emit('process:warn', warn));

// synchronous calls
app.init();

// asynchronous calls
app.start()
    .catch((e) => app.events.emit('app:error', e as Error));
