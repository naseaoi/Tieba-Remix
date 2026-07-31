module.exports = {
    extends: [
        "stylelint-config-standard",
        "stylelint-config-recommended-vue",
        "stylelint-config-standard-scss"
    ],
    overrides: [
        {
            files: ["**/*.{html,vue}"],
            customSyntax: "postcss-html"
        }
    ],
    rules: {
        "comment-empty-line-before": null,
        "selector-class-pattern": null,
        "selector-id-pattern": null,
        "no-descending-specificity": null,
        "declaration-empty-line-before": null,
        "custom-property-empty-line-before": null,
        "scss/dollar-variable-pattern": null,
        "scss/dollar-variable-empty-line-before": null,
        "no-empty-source": null,
        "scss/double-slash-comment-empty-line-before": null,
        "at-rule-empty-line-before": null,
        "declaration-block-no-redundant-longhand-properties": null,
        "declaration-property-value-keyword-no-deprecated": null,
        "media-feature-range-notation": null,
        "property-no-deprecated": null,
        "property-no-vendor-prefix": null,
        "selector-not-notation": null,
        "selector-pseudo-class-no-unknown": [true, {
            "ignorePseudoClasses": ["deep"]
        }],
        "value-keyword-case": null,
        "color-function-alias-notation": null,
        "color-function-notation": null,
        "alpha-value-notation": null
    }
};
