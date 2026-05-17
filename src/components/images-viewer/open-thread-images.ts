import _ from "@/lib/utils/_";
import { GetThreadImagesResponse, tiebaAPI } from "@/lib/api/tieba";
import { currentStorage, highQualityImage, HOME_FEED_IMAGES } from "@/lib/user-values";
import { imagesViewer } from "./index";

export async function fetchThreadImages(tid: number): Promise<ThreadPicture[]> {
    const cache = currentStorage.get(HOME_FEED_IMAGES);
    if (!(cache == null) && !(cache[tid] == null)) return cache[tid];

    try {
        const response: GetThreadImagesResponse = await (await tiebaAPI.getThreadImages(tid, true)).json();
        const picList = response?.data?.pic_list;
        const pictureList: ThreadPicture[] = Object.keys(picList ?? {})
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
            .map(key => {
                const value = picList[key];
                return {
                    original: highQualityImage.get() ? value.img.original.waterurl : value.img.screen.waterurl,
                    thumbnail: value.img.medium.url,
                    pictureId: value.img.original.id,
                    postId: value.post_id,
                };
            });
        currentStorage.set(HOME_FEED_IMAGES, {
            ...currentStorage.get(HOME_FEED_IMAGES),
            [tid]: pictureList,
        });
        return pictureList;
    } catch (err) {
        currentStorage.set(HOME_FEED_IMAGES, {
            ...currentStorage.get(HOME_FEED_IMAGES),
            [tid]: [],
        });
        console.warn("[Tieba-Remix] 拉取帖子图片失败:", err);
        return [];
    }
}

export function openThreadImages(tid: number, defaultIndex = 0): void {
    void (async () => {
        const list = await fetchThreadImages(tid);
        if (list.length > 0) imagesViewer({ content: list, defaultIndex });
    })();
}
