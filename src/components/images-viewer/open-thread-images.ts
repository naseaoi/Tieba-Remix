import _ from "lodash";
import { GetThreadImagesResponse, tiebaAPI } from "@/lib/api/tieba";
import { currentStorage, highQualityImage, HOME_FEED_IMAGES } from "@/lib/user-values";
import { imagesViewer } from "./index";

/**
 * 按 tid 打开帖子大图查看器
 * - 缓存命中：直接打开
 * - 未命中：静默拉取完整图片列表（高清原图），数据回来后直接打开
 *   不再使用 AwaitDialog，避免点击图片时出现「等待对话框 一闪而过 → 看图器」的双重加载视觉割裂
 * 适用于 home feed 推送卡片 与 吧首页帖子列表 等"按帖加载完整图集"的入口
 */
export function openThreadImages(tid: number, defaultIndex = 0): void {
    const cache = currentStorage.get(HOME_FEED_IMAGES);
    if (!_.isNil(cache) && !_.isNil(cache[tid])) {
        const cached = cache[tid];
        if (cached.length > 0) {
            imagesViewer({ content: cached, defaultIndex });
        }
        return;
    }

    void (async () => {
        try {
            const response: GetThreadImagesResponse = await (await tiebaAPI.getThreadImages(tid, true)).json();
            const picList = response?.data?.pic_list;
            const pictureList: ThreadPicture[] = _(picList ?? {})
                .keys()
                .sortBy(key => parseInt(key.slice(1)))
                .map(key => {
                    const value = picList[key];
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
            // 无图（视频帖、空列表）则不打开看图器
            if (pictureList.length > 0) {
                imagesViewer({ content: pictureList, defaultIndex });
            }
        } catch (err) {
            // 拉取/解析失败：写入空数组，标记该 tid 已尝试过，下次仍走 fetch 路径
            currentStorage.set(HOME_FEED_IMAGES, {
                ...currentStorage.get(HOME_FEED_IMAGES),
                [tid]: [],
            });
            console.warn("[Tieba-Remix] 拉取帖子图片失败:", err);
        }
    })();
}
