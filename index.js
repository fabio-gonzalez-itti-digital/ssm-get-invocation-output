const DEFAULT_MAX_WAIT_EXECUTION = 3600;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async function () {
    const core = require("@actions/core");
    const github = require("@actions/github");
    const AWS = require("@aws-sdk/client-ssm");

    try {
        // Obtener valores de entrada.
        const awsAccessKeyId = core.getInput('aws-access-key-id');
        const awsSecretAccessKey = core.getInput('aws-secret-access-key');
        const awsRegion = core.getInput('aws-region');
        const awsInstanceId = core.getInput('instance-id');
        const awsCommandId = core.getInput('command-id');
        let maxWaitExecution = core.getInput('max-wait-execution');

        // Controles.
        if (awsAccessKeyId === null || awsAccessKeyId === undefined || awsAccessKeyId === "") {
            core.setFailed("Se espera un valor para access key id");
            return;
        }

        if (awsSecretAccessKey === null || awsSecretAccessKey === undefined || awsSecretAccessKey === "") {
            core.setFailed("Se espera un valor para secret access key");
            return;
        }

        if (awsRegion === null || awsRegion === undefined || awsRegion === "") {
            core.setFailed("Se espera un valor para region.");
            return;
        }

        if (awsInstanceId === null || awsInstanceId === undefined || awsInstanceId === "") {
            core.setFailed("Se espera un valor para instance id");
            return;
        }

        if (awsCommandId === null || awsCommandId === undefined || awsCommandId === "") {
            core.setFailed("Se esperaba un valor para command id");
            return;
        }

        if (maxWaitExecution === null || maxWaitExecution === undefined || maxWaitExecution === "") {
            maxWaitExecution = DEFAULT_MAX_WAIT_EXECUTION;
        } else {
            try {
                maxWaitExecution = Number.parseInt(maxWaitExecution, 10);
            } catch (err) {
                maxWaitExecution = DEFAULT_MAX_WAIT_EXECUTION;
            }
        }

        console.log('resolved max wait execution =>', maxWaitExecution);

        // Nuevo cliente SSM.
        const client = new AWS.SSMClient({
            secretAccessKey: awsAccessKeyId,
            accessKeyId: awsSecretAccessKey,
            region: awsRegion
        });

        // Parámetros de entrada para comandos de cliente SSM.
        const commandInvocationCommandInput = {
            CommandId: awsCommandId,
            InstanceId: awsInstanceId
        };

        // Obtener estado de invocación de comando.
        const command = new AWS.GetCommandInvocationCommand(commandInvocationCommandInput);
        let response = await client.send(command);

        console.log('Command Status:', response.Status);

        // Mientras siga en ejecución, esperar.
        while (response.Status === "InProgress") {
            response = await client.send(command);
            console.log('Command Status:', response.Status);
            await delay(1000);
        }

        // Datos de salida.
        core.setOutput("command-id", awsCommandId);
        core.setOutput("status", response.Status || "-");
        core.setOutput("stdout", response.StandardOutputContent || "-");

        // Ok.
        console.log('** output');
        console.log(response.StandardOutputContent || "-");
    } catch (error) {
        core.setFailed(error.message);
    }
})();