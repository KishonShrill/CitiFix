import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import path from 'path';

export default defineConfig({
    plugins: [
        vinext({
            cache: {
                cdn: cdnAdapter(),
                data: kvDataAdapter({ binding: "CITYFIX_KV_CACHE" }),
            },
            images: { optimizer: imagesOptimizer() },
        }),
        cloudflare({
            viteEnvironment: {
                name: "rsc",
                childEnvironments: ["ssr"],
            },
        }),
    ],
    resolve: {
        alias: {
            '@api': path.resolve(import.meta.dirname, './app/api'),
            '@app': path.resolve(import.meta.dirname, './app'),
            '@': path.resolve(import.meta.dirname, '.'),
        },
    },
});
