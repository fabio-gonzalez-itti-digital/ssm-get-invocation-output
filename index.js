const core = require('@actions/core');
const github = require('@actions/github');

try {
    // Obtener valores de entrada.
    const awsAccessKeyId = core.getInput('aws-access-key-id');
    const awsSecretAccessKey = core.getInput('aws-secret-access-key');
    const awsRegion = core.getInput('aws-region');
    const awsInstanceId = core.getInput('instance-id');
    const awsCommandId = core.getInput('command-id');

    core.setOutput("test", "test");
} catch (error) {
    core.setFailed(error.message);
}