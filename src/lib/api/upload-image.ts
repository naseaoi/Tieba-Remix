import { gmRequest } from "@/lib/monkey";
import { requestBody } from "@/lib/utils";

const IMG_TBS_URL = "https://tieba.baidu.com/dc/common/imgtbs";
const UPLOAD_URL = "https://uploadphotos.baidu.com/upload/pic";

export interface UploadedImage {
    displayUrl: string;
    width: number;
    height: number;
    picId: string;
}

interface ImgTbsResponse {
    no?: number;
    data?: {
        tbs?: string;
    };
}

interface UploadPicResponse {
    err_no: number;
    err_msg?: string;
    info?: {
        pic_url_no_auth?: string;
        pic_url_auth?: string;
        fullpic_width?: number | string;
        fullpic_height?: number | string;
        pic_id?: number | string;
    };
}

async function fetchImageTbs(): Promise<string> {
    const res = await gmRequest<"json">({
        method: "GET",
        url: IMG_TBS_URL,
        responseType: "json",
        timeout: 10_000,
    });
    const body = res.response as ImgTbsResponse | null;
    const tbs = body?.data?.tbs;
    if (!tbs) throw new Error("获取图片上传凭证失败");
    return tbs;
}

function resolveFileName(file: Blob): string {
    if (file instanceof File && file.name) return file.name;
    const ext = file.type.split("/")[1] || "png";
    return `clipboard-image.${ext}`;
}

export async function uploadTiebaImage(file: Blob, fid: string): Promise<UploadedImage> {
    const tbs = await fetchImageTbs();
    const query = requestBody({ tbs, fid, save_yun_album: 1 });

    const form = new FormData();
    form.append("file", file, resolveFileName(file));

    const res = await gmRequest<"json">({
        method: "POST",
        url: `${UPLOAD_URL}?${query}`,
        data: form,
        responseType: "json",
        timeout: 30_000,
    });

    const body = res.response as UploadPicResponse | null;
    if (!body || Number(body.err_no) !== 0 || !body.info?.pic_url_no_auth) {
        throw new Error(body?.err_msg || "图片上传失败");
    }

    return {
        displayUrl: body.info.pic_url_auth || body.info.pic_url_no_auth,
        width: Number(body.info.fullpic_width) || 0,
        height: Number(body.info.fullpic_height) || 0,
        picId: String(body.info.pic_id ?? ""),
    };
}
