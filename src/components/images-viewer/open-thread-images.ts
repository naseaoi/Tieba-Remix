import { GetThreadImagesResponse, tiebaAPI } from "@/lib/api/tieba";
import { currentStorage, highQualityImage, HOME_FEED_IMAGES } from "@/lib/user-values";
import { imagesViewer } from "./viewer";

const threadImagesRequests = new Map<number, Promise<ThreadPicture[]>>();

export async function fetchThreadImages(tid: number): Promise<ThreadPicture[]> {
    if (!Number.isSafeInteger(tid) || tid <= 0) return [];

    const cache = currentStorage.get(HOME_FEED_IMAGES);
    if (cache?.[tid]?.length > 0) return cache[tid];

    const pendingRequest = threadImagesRequests.get(tid);
    if (pendingRequest) return pendingRequest;

    const request = requestThreadImages(tid).finally(() => {
        threadImagesRequests.delete(tid);
    });
    threadImagesRequests.set(tid, request);
    return request;
}

async function requestThreadImages(tid: number): Promise<ThreadPicture[]> {
    try {
        const response: GetThreadImagesResponse = await (await tiebaAPI.getThreadImages(tid, true)).json();
        const picList = response?.data?.pic_list;
        const pictureList: ThreadPicture[] = Object.keys(picList ?? {})
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
            .flatMap(key => {
                const value = picList[key];
                const original = highQualityImage.get()
                    ? value?.img?.original?.waterurl
                    : value?.img?.screen?.waterurl;
                const thumbnail = value?.img?.medium?.url;
                if (!original || !thumbnail) return [];

                return [{
                    original,
                    thumbnail,
                    pictureId: value.img.original.id,
                    postId: value.post_id,
                }];
            });
        currentStorage.set(HOME_FEED_IMAGES, {
            ...currentStorage.get(HOME_FEED_IMAGES),
            [tid]: pictureList,
        });
        return pictureList;
    } catch (err) {
        console.warn("[Tieba-Remix] 拉取帖子图片失败:", err);
        return [];
    }
}

export function openThreadImages(tid: number, defaultIndex = 0): void {
    void (async () => {
        const list = await fetchThreadImages(tid);
        void imagesViewer({ content: list, defaultIndex });
    })();
}
