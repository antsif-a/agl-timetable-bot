import { Application } from '@/application';
import Logger from '@/modules/logging/logger';
import Bot from '@/modules/bot/bot';
import VkBridge from '@/modules/api/vkBridge';
import { exit, env } from 'node:process';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TS_NODE_BASEURL: string;
            DATABASE_URL: string;
            TELEGRAM_BOT_TOKEN: string;
            VK_COMMUNITY_ACCESS_TOKEN: string;
            VK_TEST_COMMUNITY_ACCESS_TOKEN: string;
            VK_COMMUNITY_ID: string;
            VK_TEST_COMMUNITY_ID: string;
            VK_USER_ACCESS_TOKEN: string;
        }
    }
}

const {
    VK_USER_ACCESS_TOKEN,
    VK_COMMUNITY_ACCESS_TOKEN,
    VK_TEST_COMMUNITY_ACCESS_TOKEN,
    TELEGRAM_BOT_TOKEN,
} = env;
const VK_COMMUNITY_ID = Number.parseInt(env.VK_COMMUNITY_ID);
const VK_TEST_COMMUNITY_ID = Number.parseInt(env.VK_TEST_COMMUNITY_ID);

const app = new Application()
    // every module can access app's events and set listeners
    .addModule(Logger.create())
    .addModule(VkBridge.create(VK_TEST_COMMUNITY_ACCESS_TOKEN, VK_TEST_COMMUNITY_ID))
    .addModule(Bot.create(TELEGRAM_BOT_TOKEN, VK_USER_ACCESS_TOKEN))
    // synchronous calls
    .init();

// immediately exit on error
app.events.on('app:error', () => exit());

// asynchronous calls
app.start()
    .catch((e) => app.events.emit('app:error', new Error(e)))
