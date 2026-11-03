import { afterEach, describe, expect, it } from "vitest";
import { applyFloorShield, applyForumThreadShield, findElementShieldRule, findShieldRule, type ShieldRule } from "./index";

function rule(content: string, scopes: ShieldRule["scopes"], type: ShieldRule["type"] = "text"): ShieldRule {
    return { content, type, scopes, toggle: true };
}

function floor(postNo: number, content = "", author = ""): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "l_post l_post_bright";
    el.setAttribute("data-field", JSON.stringify({ content: { post_no: postNo } }));
    el.innerHTML = `<a class="p_author_name">${author}</a><div class="d_post_content">${content}</div>`;
    document.body.append(el);
    return el;
}

afterEach(() => {
    document.body.innerHTML = "";
});

describe("findShieldRule", () => {
    it("matches each text separately so anchored regex still works", () => {
        const anchored = rule("^同名$", ["username"], "regex");
        expect(findShieldRule([anchored], ["同名", "同名"], "username")).toBe(anchored);
    });

    it("ignores rules outside the scope", () => {
        expect(findShieldRule([rule("广告", ["thread-title"])], ["广告"], "post-content")).toBeUndefined();
    });
});

describe("findElementShieldRule", () => {
    it("checks duplicated author nodes one by one", () => {
        const item = document.createElement("div");
        item.innerHTML = `<span class="a">某用户</span><span class="b">某用户</span>`;
        const anchored = rule("^某用户$", ["username"], "regex");
        expect(findElementShieldRule(item, [{ scope: "username", subSelector: ".a, .b" }], [anchored])).toBe(anchored);
    });
});

describe("applyForumThreadShield", () => {
    it("keeps native pinned hiding when a rule is applied or removed", () => {
        const item = document.createElement("li");
        item.style.display = "none";
        applyForumThreadShield(item, undefined);
        expect(item.style.display).toBe("none");
        applyForumThreadShield(item, rule("广告", ["thread-title"]));
        expect(item.hasAttribute("data-tbr-shield-hidden")).toBe(true);
        applyForumThreadShield(item, undefined);
        expect(item.hasAttribute("data-tbr-shield-hidden")).toBe(false);
        expect(item.style.display).toBe("none");
    });

    it("does not mutate an unchanged rule result", () => {
        const item = document.createElement("li");
        const matched = rule("广告", ["thread-title"]);
        applyForumThreadShield(item, matched);
        const observer = new MutationObserver(() => {});
        observer.observe(item, { attributes: true });
        applyForumThreadShield(item, matched);
        expect(observer.takeRecords()).toEqual([]);
        observer.disconnect();
    });
});

describe("applyFloorShield", () => {
    it("hides ordinary floors directly", () => {
        const reply = floor(2, "广告");
        applyFloorShield(reply, rule("广告", ["post-content"]));
        expect(reply.style.display).toBe("none");
        expect(document.querySelector(".tbr-shield-notice")).toBeNull();
    });

    it("collapses the main floor into a notice with the matched rule", () => {
        const main = floor(1, "广告");
        applyFloorShield(main, rule("广告", ["post-content"]));
        const notice = main.previousElementSibling;
        expect(main.style.display).toBe("none");
        expect(notice?.classList.contains("tbr-shield-notice")).toBe(true);
        expect(notice?.querySelector(".tbr-shield-notice-rule")?.textContent).toBe("广告");
    });

    it("keeps a single notice across repeated runs", () => {
        const main = floor(1, "广告");
        const matched = rule("广告", ["post-content"]);
        applyFloorShield(main, matched);
        applyFloorShield(main, matched);
        expect(document.querySelectorAll(".tbr-shield-notice")).toHaveLength(1);
    });

    it("reveals the main floor and keeps it visible after reveal", () => {
        const main = floor(1, "广告");
        const matched = rule("广告", ["post-content"]);
        applyFloorShield(main, matched);
        main.previousElementSibling?.querySelector<HTMLButtonElement>(".tbr-shield-notice-reveal")?.click();
        applyFloorShield(main, matched);
        expect(main.style.display).toBe("");
        expect(document.querySelector(".tbr-shield-notice")).toBeNull();
    });

    it("restores the main floor when it no longer matches", () => {
        const main = floor(1, "广告");
        applyFloorShield(main, rule("广告", ["post-content"]));
        applyFloorShield(main, undefined);
        expect(main.style.display).toBe("");
        expect(document.querySelector(".tbr-shield-notice")).toBeNull();
    });
});
