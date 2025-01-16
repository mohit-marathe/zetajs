module.exports = {
    launch: {
        headless: true,
        args: ["--no-sandbox"]
    },
    server: {
        command: "npm run test:convertpdf",
        debug: true
    },
};
