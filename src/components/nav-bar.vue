<template>
    <div v-if="isFolded" class="nav-reveal-zone" @mouseenter="handleRevealZoneEnter"
        @mouseleave="handleRevealZoneLeave"></div>

    <nav ref="navBar" id="nav-bar" class="nav-bar remove-default" :class="{ fold: isFolded, revealed: isRevealActive }"
        @mouseenter="handleNavMouseEnter" @mouseleave="handleNavMouseLeave" @transitionend="handleNavTransitionEnd">

        <div id="nav-container">
            <div class="left-container">
                <a class="nav-brand" href="/">百度贴吧</a>
            </div>

            <div class="right-container">
                <!-- 消息 -->
                <UserButton class="nav-icon-button menu-trigger" data-menu-trigger="message" no-border="all"
                    @mouseenter="handleMenuTriggerEnter($event, 'message')"
                    @mouseleave="handleMenuTriggerLeave($event, 'message')">
                    <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    <DropdownMenu class="nav-menu" :class="{ visible: activeMenu === 'message' }" data-menu-key="message"
                        :menu-items="messageMenu" @mouseenter="handleMenuPanelEnter('message')"
                        @mouseleave="handleMenuPanelLeave($event, 'message')" @request-close="closeMenus"></DropdownMenu>
                </UserButton>

                <!-- 更多 -->
                <UserButton class="nav-icon-button menu-trigger" data-menu-trigger="more" no-border="all"
                    @mouseenter="handleMenuTriggerEnter($event, 'more')"
                    @mouseleave="handleMenuTriggerLeave($event, 'more')">
                    <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                    </svg>
                    <DropdownMenu class="nav-menu" :class="{ visible: activeMenu === 'more' }" data-menu-key="more"
                        :menu-items="moreMenu" @mouseenter="handleMenuPanelEnter('more')"
                        @mouseleave="handleMenuPanelLeave($event, 'more')" @request-close="closeMenus"></DropdownMenu>
                </UserButton>

                <!-- 设置 -->
                <UserButton class="nav-icon-button" no-border="all" @click="renderDialog(Settings)">
                    <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path
                            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </UserButton>

                <!-- 头像 -->
                <UserButton class="nav-icon-button menu-trigger avatar-button" data-menu-trigger="user" no-border="all"
                    @mouseenter="handleMenuTriggerEnter($event, 'user')"
                    @mouseleave="handleMenuTriggerLeave($event, 'user')">
                    <img ref="navAvatar" class="nav-avatar">
                    <DropdownMenu class="nav-menu" :class="{ visible: activeMenu === 'user' }" data-menu-key="user"
                        :menu-items="userMenu!" @mouseenter="handleMenuPanelEnter('user')"
                        @mouseleave="handleMenuPanelLeave($event, 'user')" @request-close="closeMenus"></DropdownMenu>
                </UserButton>
            </div>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import { tiebaAPI } from "@/lib/api/tieba";
import { dom } from "@/lib/elemental";
import { renderDialog } from "@/lib/render";
import { navBarHideMode } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";
import _ from "lodash";
import { messageBox, toast, UserButton } from "user-view";
import { computed, onMounted, ref, watch } from "vue";
import DropdownMenu from "./dropdown-menu.vue";
import Settings from "./settings.vue";

export type NavBarHideMode = "fold" | "alwaysFold" | "never";
type MenuKey = "message" | "more" | "user";

const navBar = ref<HTMLElement>();

const navAvatar = ref<HTMLImageElement>();
const userPortrait = ref<string>("");
const activeMenu = ref<MenuKey | null>(null);
const isAutoFolded = ref(false);
const isRevealActive = ref(false);
const hideMode = ref<NavBarHideMode>(navBarHideMode.get());
const isMenuReady = ref(hideMode.value === "never");

navBarHideMode.on("setter", (value) => { hideMode.value = value; });

const messageMenu = ref<DropdownMenu[]>([]);
const moreMenu = ref<DropdownMenu[]>([]);
const userMenu = ref<DropdownMenu[]>([]);

const isFolded = computed(() => hideMode.value === "alwaysFold" || (hideMode.value === "fold" && isAutoFolded.value));

watch(isFolded, (folded) => {
    activeMenu.value = null;
    if (folded) {
        isRevealActive.value = false;
        isMenuReady.value = false;
        return;
    }

    isRevealActive.value = false;
    isMenuReady.value = true;
}, { immediate: true });

init();
onMounted(async function () {
    {
        waitUntil(() => userPortrait.value !== "").then(function () {
            if (navAvatar.value)
                navAvatar.value.src = tiebaAPI.URL_profile(userPortrait.value);
        });
    }
});

function positionMenu(trigger: HTMLElement) {
    const menu = trigger.querySelector(".nav-menu") as HTMLElement;
    if (!menu || !navBar.value) return;
    const triggerRect = trigger.getBoundingClientRect();
    const navRect = navBar.value.getBoundingClientRect();
    menu.style.top = `${navRect.bottom}px`;
    // nav-menu is positioned inside the nav bar context, so its horizontal offset
    // needs to be relative to the nav bar instead of the viewport.
    menu.style.left = `${triggerRect.left - navRect.left + triggerRect.width / 2 - menu.offsetWidth / 2}px`;
}

function revealNav() {
    if (!isFolded.value || isRevealActive.value) return;
    isRevealActive.value = true;
    isMenuReady.value = false;
}

function closeMenus() {
    activeMenu.value = null;
}

function hideNav() {
    if (activeMenu.value) return;
    closeMenus();
    if (!isFolded.value) return;
    isRevealActive.value = false;
    isMenuReady.value = false;
}

function handleRevealZoneEnter() {
    revealNav();
}

function handleRevealZoneLeave(e: MouseEvent) {
    if (shouldKeepNavVisible(e.relatedTarget)) return;
    hideNav();
}

function handleNavMouseEnter() {
    revealNav();
}

function handleNavMouseLeave(e: MouseEvent) {
    if (shouldKeepNavVisible(e.relatedTarget)) return;
    hideNav();
}

function handleNavTransitionEnd(e: TransitionEvent) {
    if (e.target !== navBar.value || e.propertyName !== "transform") return;
    if (!isFolded.value) {
        isMenuReady.value = true;
        syncHoveredMenu();
        return;
    }
    if (isRevealActive.value) {
        isMenuReady.value = true;
        syncHoveredMenu();
    }
}

function handleMenuTriggerEnter(e: MouseEvent, key: MenuKey) {
    if (!isMenuReady.value) return;
    positionMenu(e.currentTarget as HTMLElement);
    activeMenu.value = key;
}

function handleMenuTriggerLeave(e: MouseEvent, key: MenuKey) {
    const nextTarget = e.relatedTarget as Element | null;
    const menu = getMenuElement(key);
    if (menu && nextTarget && menu.contains(nextTarget)) return;
    if (nextTarget && navBar.value?.contains(nextTarget)) return;

    if (activeMenu.value === key) {
        activeMenu.value = null;
    }
}

function handleMenuPanelEnter(key: MenuKey) {
    activeMenu.value = key;
}

function handleMenuPanelLeave(e: MouseEvent, key: MenuKey) {
    const nextTarget = e.relatedTarget as Element | null;
    const trigger = getTriggerElement(key);
    if (trigger && nextTarget && trigger.contains(nextTarget)) return;

    if (activeMenu.value === key) {
        activeMenu.value = null;
    }
    if (shouldKeepNavVisible(nextTarget)) return;
    hideNav();
}

function getMenuElement(key: MenuKey) {
    return navBar.value?.querySelector<HTMLElement>(`.nav-menu[data-menu-key="${key}"]`) ?? null;
}

function getTriggerElement(key: MenuKey) {
    return navBar.value?.querySelector<HTMLElement>(`.menu-trigger[data-menu-trigger="${key}"]`) ?? null;
}

function syncHoveredMenu() {
    if (!isMenuReady.value || !navBar.value) return;
    const hoveredTrigger = navBar.value.querySelector<HTMLElement>(".menu-trigger:hover");
    const key = hoveredTrigger?.dataset.menuTrigger as MenuKey | undefined;
    if (!hoveredTrigger || !key) return;

    positionMenu(hoveredTrigger);
    activeMenu.value = key;
}

function shouldKeepNavVisible(target: EventTarget | null) {
    const element = target instanceof Element ? target : null;
    if (!element) return false;
    return !!element.closest("#nav-bar, .nav-reveal-zone, .nav-menu");
}

async function init() {
    await waitUntil(() => PageData !== undefined).then(() => {
        userPortrait.value = PageData.user.portrait;
        loadNavMenuContent();
    });

    let scrollCleanup: (() => void) | undefined;

    watch(hideMode, (mode) => {
        if (scrollCleanup) { scrollCleanup(); scrollCleanup = undefined; }
        isAutoFolded.value = false;

        if (mode === "fold") {
            let lastScrollY = window.scrollY;
            const handle = _.throttle(function () {
                if (window.scrollY > lastScrollY) {
                    isAutoFolded.value = true;
                }
                lastScrollY = window.scrollY;
            }, 100);
            window.addEventListener("scroll", handle);
            scrollCleanup = () => window.removeEventListener("scroll", handle);
        }
    }, { immediate: true });
}

async function login() {
    const loginButton = dom(".u_login");
    const directLoginButton = dom<"a">("#TANGRAM__PSP_24__submit");

    if (directLoginButton) {
        const confirmDirect = await messageBox({
            title: "快速登录",
            content: "检测到快速登录入口，是否尝试直接登录？",
            type: "okCancel",
        });

        if (confirmDirect === "positive") {
            directLoginButton.click();
        } else {
            regularLogin();
        }
    } else {
        regularLogin();
    }

    function regularLogin() {
        loginButton
            ? dom<"a">("a", loginButton)?.click()
            : cannotLogin();
    }

    function cannotLogin() {
        toast({ message: "未检测到可用的登录入口，请刷新重试", type: "warning" });
    }
}

function loadNavMenuContent() {
    messageMenu.value = [
        {
            title: "查看私信",
            href: "/im/pcmsg",
        },
        {
            title: "查看回复",
            href: `/i/sys/jump?u=${userPortrait.value}&type=replyme`,
        },
        {
            title: "查看 @",
            href: `/i/sys/jump?u=${userPortrait.value}&type=atme`,
        },
        "separator",
        {
            title: "查看好友申请",
            href: `/i/sys/jump?u=${userPortrait.value}&type=friendapply`,
        },
        {
            title: "查看新粉丝",
            href: `/i/sys/jump?u=${userPortrait.value}&type=fans`,
        },
        "separator",
        {
            title: "我的收藏",
            href: `/i/sys/jump?u=${userPortrait.value}&type=storethread`,
        },
        {
            title: "我的通知",
            href: "/sysmsg/index?type=notity",
        },
    ];

    moreMenu.value = [
        {
            title: "账号设置",
            href: "//passport.baidu.com/?center&tpl=tb&aid=6&default_tab=3#3,0",
        },
        {
            title: "贴吧设置",
            href: `/home/profile?un=${PageData.user.name_url}`,
        },
        "separator",
        {
            title: "服务中心",
            href: "//tieba.baidu.com/pmc",
        },
        {
            title: "问题反馈",
            href: "//tieba.baidu.com/hermes/feedback",
        },
    ];
    userMenu.value = [
        {
            title: "我的贴吧",
            href: `/home/main?id=${userPortrait.value}&fr=userbar`,
        },
        {
            title: "我的收藏",
            href: `/i/sys/jump?un=${PageData.user.user_name}${PageData.user.name_url}&type=storethread&st_mod=userbar&fr=tb0_pb`,
        },
    ];

    PageData.user.is_login
        ? userMenu.value.push("separator", {
            title: "退出登录",
            click() {
                const logoutButton = dom(".u_logout");
                if (logoutButton) {
                    dom<"a">("a", logoutButton)?.click();
                } else {
                    toast({ message: "未检测到退出登录入口，请刷新重试。", type: "warning" });
                }
            },
        })
        : userMenu.value.push("separator", {
            title: "登录",
            click() {
                login();
            },
        });
}
</script>

<style lang="scss" scoped>
$nav-height: 48px;
$hover-trigger-height: 16px;

.nav-reveal-zone {
    position: fixed;
    z-index: 1199;
    top: 0;
    right: 0;
    left: 0;
    height: $hover-trigger-height;
}

#nav-bar {
    position: fixed;
    z-index: 1200;
    top: 8px;
    right: 0;
    left: 0;
    display: flex;
    width: calc(100% - 24px);
    max-width: 860px;
    height: $nav-height;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    margin: 0 auto;
    background-color: var(--trans-default-background);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    transition: transform var(--default-duration), opacity var(--default-duration);

    html.dark-theme & {
        box-shadow: 0 2px 12px rgb(0 0 0 / 40%);
    }

    body[no-scrollbar] & {
        right: var(--scrollbar-width);
    }

    &.fold {
        transform: translateY(calc(-100% - 16px));
        opacity: 0;

        &.revealed {
            transform: translateY(0);
            opacity: 1;
        }
    }

    #nav-container {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;

        .left-container {
            .nav-brand {
                color: var(--default-fore);
                font-size: 15px;
                font-weight: var(--font-weight-bold);
                opacity: 0.5;
                text-decoration: none;
            }
        }

        .right-container {
            display: flex;
            align-items: center;
            gap: 4px;

            .avatar-button {
                .nav-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    object-fit: cover;
                }

                &:hover > .nav-avatar {
                    box-shadow: 0 0 0 2px var(--tieba-theme-color);
                }
            }
        }
    }
}

.nav-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--light-fore);

    .nav-svg {
        width: 18px;
        height: 18px;
    }

    &:hover {
        background-color: var(--default-hover);
        color: var(--default-fore);
    }
}

.menu-trigger {
    position: relative;
    background-color: transparent;
}

.nav-menu {
    position: fixed;
    z-index: 1201;
    visibility: hidden;
    cursor: default;
    font-weight: var(--font-weight-normal);
    opacity: 0;
    pointer-events: none;

    &.visible {
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
    }
}
</style>
