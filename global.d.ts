declare module "next/config" {
    type ConfigTypes = () => {
        publicRuntimeConfig: {
            "page-container-size": string;
        };
    };

    declare const getConfig: ConfigTypes;

    export default getConfig;
}
