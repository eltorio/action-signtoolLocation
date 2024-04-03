import * as core from '@actions/core';
import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';


/**
 * Searches the installed Windows SDKs for the most recent signtool.exe version
 * Taken from https://github.com/dlemstra/code-sign-action
 * @returns Path to most recent signtool.exe (x86 version)
 */
async function getSigntoolLocation() {
    const windowsKitsFolder = 'C:/Program Files (x86)/Windows Kits/10/bin/';
    const folders = await fs.readdir(windowsKitsFolder);
    let fileName = '';
    let maxVersion = 0;
    for (const folder of folders) {
        if (!folder.endsWith('.0')) {
            continue;
        }
        const folderVersion = parseInt(folder.replace(/\./g,''));
        if (folderVersion > maxVersion) {
            const signtoolFilename = `${windowsKitsFolder}${folder}/x64/signtool.exe`;
            try {
                const stat = await fs.stat(signtoolFilename);
                if (stat.isFile()) {
                    fileName = signtoolFilename;
                    maxVersion = folderVersion;
                }
            }
            catch {
                console.warn('Skipping %s due to error.', signtoolFilename);
            }
        }
    }
    if(fileName == '') {
        throw new Error('Unable to find signtool.exe in ' + windowsKitsFolder);
    }

    console.log(`Signtool location is ${fileName}.`);
    return fileName;
}

async function run() {
    try {
        const signtoolLocation = await getSigntoolLocation();
        core.setOutput('signtoolLocation', signtoolLocation);
    } catch (error) {
        core.setFailed(error.message);
    }
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
