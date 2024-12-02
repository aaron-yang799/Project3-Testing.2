const { SpecReporter } = require('jasmine-spec-reporter');  // Notice the curly braces

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter({
    spec: {
        displayPending: true,
        displayStacktrace: true,
        displaySuccessful: true,
        displayFailed: true
    },
    summary: {
        displayErrorMessages: true,
        displaySuccessful: true,
        displayFailed: true,
        displayPending: true
    }
}));