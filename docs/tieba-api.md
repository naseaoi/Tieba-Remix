# 贴吧接口要点

## 新版 PC 接口（同源，优先使用）

- `/c/f/pb/page_pc`、`/c/f/pb/nestedFloor` 与页面同源，使用 `fetch()` 并带 `credentials: "include"`，单次约 100–300ms；不需要 `tbs`。
- 表单需附带 `subapp_type=pc`、`_client_type=20` 与 `sign`。`sign` = 按键名排序拼接 `k=v`（无分隔符）后追加盐 `36770b1f34c9bbf2e7d1a99d2b82fa9e`，取小写 md5。App 接口的盐 `tiebaclient!!!` 在这里无效。
- `page_pc` 每批固定约 15 楼，忽略条数参数；旧版第 N 页对应 PC 第 `2N-1`、`2N` 两批，首楼另在 `first_floor` 中返回。`r=0` 正序，`lz=1` 只看楼主。
- `page_pc` 的 `user_list[*].ip_address` 覆盖楼层作者与楼中楼预览作者；`post_list[*].sub_post_list.sub_post_list` 每楼最多返回 4 条楼中楼预览。
- `nestedFloor` 按 `post_id`、`thread_id`、`offset` 分页，每批约 10 条，忽略条数参数；`data.page.has_more` 可能提前为 0，需按返回的 `offset` 再探测一次。
- PC 接口不返回设备来源；楼层设备取自原生 DOM，楼中楼设备取自 `/p/totalComment` 的 `post_from`。

## App 接口（跨域，仅作兜底）

- `tiebac.baidu.com` 必须经 `gmRequest()` 调用，浏览器内耗时约 3 秒；盐为 `tiebaclient!!!`，取大写 md5。
- `/c/f/pb/floor` 不返回楼中楼 IP 属地，不用于属地展示。
