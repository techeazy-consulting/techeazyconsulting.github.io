// On stage and prod environment, this will change by github action script
const ENV = "prod"; 

const CONFIG = {
    dev: {
        DOMAIN: "http://localhost:8080"
    },
    stage: {
        DOMAIN: "https://stage.techeazyconsulting.com"
    },
    prod: {
        DOMAIN: "https://prod.techeazyconsulting.com"
    }
};

export const DOMAIN = CONFIG[ENV].DOMAIN;
