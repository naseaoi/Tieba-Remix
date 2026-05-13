import _ from "lodash";
import { GetThreadImagesResponse, tiebaAPI } from "@/lib/api/tieba";
import { renderDialog } from "@/lib/render";
import { currentStorage, highQualityImage, HOME_FEED_IMAGES } from "@/lib/user-values";
import AwaitDialog, { AwaitDialogOpts } from "../await-dialog.vue";
import { imagesViewer } from "./index";

/**
 * 按 tid 打开帖子大图查看器
 * - 缓存命中：直接打开
 * - 未命中：展示 AwaitDialog 并并发拉取完整图片列表（高清原图），缓存后自动打开
 * 适用于 home feed 推送卡片 与 吧首页帖子列表 等"按帖加载完整图集"的入口
 */
export function openThreadImages(tid: number, defaultIndex = 0): void {
    const cache = currentStorage.get(HOME_FEED_IMAGES);
    if (!_.isNil(cache) && !_.isNil(cache[tid])) {
        imagesViewer({
            content: cache[tid],
            defaultIndex,
        });
        return;
    }

    renderDialog<AwaitDialogOpts>(AwaitDialog, {
        unloadPred: () => {
            const c = currentStorage.get(HOME_FEED_IMAGES);
            return !_.isNil(c) && !_.isNil(c[tid]);
        },
    }, {
        unloaded() {
            imagesViewer({
                content: currentStorage.get(HOME_FEED_IMAGES)[tid],
                defaultIndex,
            });
        },
    });

    void (async () => {
        const response: GetThreadImagesResponse = await (await tiebaAPI.getThreadImages(tid, true)).json();
        const pictureList: ThreadPicture[] = _(response.data.pic_list)
            .keys()
            .sortBy(key => parseInt(key.slice(1)))
            .map(key => {
                const value = response.data.pic_list[key];
                return {
                    original: highQualityImage.get() ? value.img.original.waterurl : value.img.screen.waterurl,
                    thumbnail: value.img.medium.url,
                };
            })
            .value();
        currentStorage.set(HOME_FEED_IMAGES, {
            ...currentStorage.get(HOME_FEED_IMAGES),
            [tid]: pictureList,
        });
    })();
}
