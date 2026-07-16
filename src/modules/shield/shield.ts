import { UserKey } from "@/lib/user-values";

export const shieldScopeOptions = [
    {
        value: "thread-title",
        label: "帖子标题",
        description: "首页推送和进吧列表中的帖子标题",
        icon: "title",
    },
    {
        value: "post-content",
        label: "楼层内容",
        description: "主楼、回复、楼中楼及推送正文",
        icon: "chat",
    },
    {
        value: "username",
        label: "用户名",
        description: "发帖人与回复者的用户名",
        icon: "account_circle",
    },
] as const;

export type ShieldScope = typeof shieldScopeOptions[number]["value"];

/**
 * 屏蔽规则对象
 */
export interface ShieldRule {
    /** 匹配规则，它可能是直接的屏蔽词，也可能是正则表达式 */
    content: string;
    /** 描述当前规则的类型 */
    type: "text" | "regex";
    /** 屏蔽规则的应用范围 */
    scopes: ShieldScope[];
    /** 是否启用该规则 */
    toggle: boolean;
    /** 是否忽略大小写，默认忽略 */
    ignoreCase?: boolean;
    /** 是否匹配 innerHTML？默认匹配 textContent */
    matchHTML?: boolean;
}

export interface ShieldRuleV1 {
    content: string;
    type: "text" | "regex";
    scope: "content" | "username";
    toggle: boolean;
    ignoreCase?: boolean;
    matchHTML?: boolean;
}

export interface ShieldRuleLegacy {
    rule: string;
    type: "string" | "regex";
    scope: "posts" | "users";
    switch: boolean;
    ignoreCase?: boolean;
    matchHTML?: boolean;
}

type StoredShieldRule = ShieldRule | ShieldRuleV1 | ShieldRuleLegacy;

export const shieldList = new UserKey<ShieldRule[], StoredShieldRule[]>(
    "shieldList", [], undefined, shieldListMigration
);

/**
 * 匹配字符串是否和屏蔽对象规则符合
 * @param rule 屏蔽对象
 * @param str 需要匹配的字符串
 * @param scope 当前匹配内容的应用范围
 * @returns 是否匹配成功
 */
export function matchShield(rule: ShieldRule, str: string, scope: ShieldScope): boolean {
    // 规则未启用，直接返回
    if (!rule.toggle) return false;

    // 作用域不匹配，直接返回
    if (!rule.scopes.includes(scope)) return false;

    // 可选参数
    const ignoreCase = rule.ignoreCase ?? true;

    // 字符串
    if (rule.type === "text") {
        // 忽略大小写，先转为小写
        const content = ignoreCase ? rule.content.toLowerCase() : rule.content;
        const source = ignoreCase ? str.toLowerCase() : str;

        if (source.includes(content)) {
            return true;
        }
    }

    // 正则
    if (rule.type === "regex") {
        try {
            const regex = new RegExp(rule.content, ignoreCase ? "i" : undefined);
            if (regex.test(str)) return true;
        } catch {
            return false;
        }
    }

    return false;
}

export function getShieldRuleValidationError(rule: Pick<ShieldRule, "content" | "type" | "scopes">): string | undefined {
    if (rule.content.trim().length === 0) return "请输入屏蔽规则";
    if (rule.scopes.length === 0) return "请至少选择一个应用范围";

    if (rule.type === "regex") {
        try {
            new RegExp(rule.content);
        } catch {
            return "正则表达式格式无效";
        }
    }
}

export function shieldRuleMigration(rule: unknown): ShieldRule | undefined {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return;
    const storedRule = rule as Record<string, unknown>;

    if (typeof storedRule.rule === "string") {
        const legacyRule = storedRule as unknown as ShieldRuleLegacy;
        return {
            content: legacyRule.rule,
            type: legacyRule.type === "regex" ? "regex" : "text",
            scopes: legacyRule.scope === "users"
                ? ["username"]
                : ["thread-title"],
            toggle: typeof legacyRule.switch === "boolean" ? legacyRule.switch : true,
            ignoreCase: typeof legacyRule.ignoreCase === "boolean" ? legacyRule.ignoreCase : undefined,
            matchHTML: typeof legacyRule.matchHTML === "boolean" ? legacyRule.matchHTML : undefined,
        };
    }

    if (typeof storedRule.content !== "string") return;

    if (storedRule.scope === "content" || storedRule.scope === "username") {
        const v1Rule = storedRule as unknown as ShieldRuleV1;
        return {
            content: v1Rule.content,
            type: v1Rule.type === "regex" ? "regex" : "text",
            scopes: v1Rule.scope === "username"
                ? ["username"]
                : ["thread-title"],
            toggle: typeof v1Rule.toggle === "boolean" ? v1Rule.toggle : true,
            ignoreCase: typeof v1Rule.ignoreCase === "boolean" ? v1Rule.ignoreCase : undefined,
            matchHTML: typeof v1Rule.matchHTML === "boolean" ? v1Rule.matchHTML : undefined,
        };
    }

    const currentRule = storedRule as unknown as ShieldRule;
    const storedScopes = Array.isArray(currentRule.scopes) ? currentRule.scopes : [];
    const scopes = shieldScopeOptions
        .map(option => option.value)
        .filter(scope => storedScopes.includes(scope));

    return {
        content: currentRule.content,
        type: currentRule.type === "regex" ? "regex" : "text",
        scopes: scopes.length > 0 ? scopes : ["thread-title"],
        toggle: typeof currentRule.toggle === "boolean" ? currentRule.toggle : true,
        ignoreCase: typeof currentRule.ignoreCase === "boolean" ? currentRule.ignoreCase : undefined,
        matchHTML: typeof currentRule.matchHTML === "boolean" ? currentRule.matchHTML : undefined,
    };
}

function shieldListMigration(value: unknown): ShieldRule[] {
    if (!Array.isArray(value)) return [];
    return value
        .map(shieldRuleMigration)
        .filter((rule): rule is ShieldRule => !!rule && rule.content.trim().length > 0);
}
