import { setupLegacyRedirect } from "./lib/legacy-redirect";

const bootstrapReady = import("./bootstrap");

setupLegacyRedirect((signal) => {
    void bootstrapReady.then(({ bootstrap }) => bootstrap(signal));
});
