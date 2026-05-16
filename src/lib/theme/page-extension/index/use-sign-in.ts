import { confirmDialog } from "@/components/confirm-dialog";
import { FollowedForumsResponse, OneKeySignResponse, tiebaAPI } from "@/lib/api/tieba";
import { requestInstance } from "@/lib/utils";
import _ from "lodash";
import { toast } from "user-view";
import { ref } from "vue";

export function useSignIn() {
    const followed = ref<FollowedForumsResponse["data"]>();
    const signedForums = ref(0);

    function getFollowedInstance() {
        requestInstance(tiebaAPI.followedForums()).then((response: FollowedForumsResponse) => {
            if (response) {
                signedForums.value = 0;
                followed.value = response.data;

                _.forEach(followed.value.like_forum, forum => {
                    if (forum.is_sign === 1) signedForums.value++;
                });
                followed.value.like_forum.sort((a, b) =>
                    parseInt(b.user_exp) - parseInt(a.user_exp));
            }
        });
    }

    async function oneKeySignInstance() {
        const tag = await confirmDialog({
            title: "一键签到",
            content: "需要注意，Web 端签到获取到的经验远少于移动端，建议使用其他设备进行签到。",
            type: "okCancel",
            variant: "warning",
            positiveText: "继续签到",
        });

        if (tag !== "positive") return;

        const response = await requestInstance(tiebaAPI.oneKeySign()) as OneKeySignResponse;
        toast({
            message: `本次共签到成功 ${response.data.signedForumAmount} 个吧，未签到 ${response.data.unsignedForumAmount} 个吧，签到失败 ${response.data.signedForumAmountFail} 个吧，共获得 ${response.data.gradeNoVip} 经验。`,
            type: "check",
            blurEffect: true,
        });

        getFollowedInstance();
    }

    return { followed, signedForums, getFollowedInstance, oneKeySignInstance };
}
