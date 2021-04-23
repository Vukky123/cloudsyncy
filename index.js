const config = require("./config.json");
const packagejson = require("./package.json");
const chalk = require("chalk");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const ora = require("ora");
const path = require("path");
console.clear();
console.log(`${chalk.green("cloudsyncy")} ${chalk.blueBright(packagejson.version)}`);
let spinnery, origin, destination, loops;

const displayCurrentFile = (src, dest) => {
    spinnery.text = `Copying ${src} to ${dest}...`
    return true;
}

inquirer
  .prompt([
    {
        type: 'list',
        name: 'type',
        message: 'Which configuration do you want to use?',
        choices: Object.keys(config)
    },
    {
        type: 'list',
        name: 'mode',
        message: 'Which mode do you want to use?',
        choices: ["Cloud to local", "Local to cloud"]
    },
  ])
  .then(answers => {
    if(answers.mode == "Cloud to local") {
        origin = config[answers.type].cloud.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
        destination = config[answers.type].local.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
    } else if (answers.mode == "Local to cloud") {
        origin = config[answers.type].local.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
        destination = config[answers.type].cloud.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
    } else {
        return console.error("Something doesn't seem right.");
    }
    let loops = 0;
    async function next() {
        let originy = origin[loops];
        let destinationy = destination[loops];
        if(config[answers.type].deleteDestinationContentsBeforeCopy == true) {
            spinnery = ora(`Deleting contents of ${destinationy}...`).start();
            await fs.emptyDir(destinationy);
            spinnery.succeed(`Deleted contents of ${destinationy}!`)
        }
        spinnery = ora(`Copying ${originy} to ${destinationy}...`).start();
        fs.copy(originy, destinationy, { overwrite: config[answers.type].overwriteExisting, filter: displayCurrentFile }, function (err) {
            if (err) {
              spinnery.fail("Failed to copy.");
              console.error(err);
              process.exit(1);
            } else {
              spinnery.succeed(`Copied ${originy} to ${destinationy}!`);
              loops += 1;
              if(loops === origin.length) {
                console.log("\ncloudsyncy is done! Your files have been copied.");
              } else {
                next();
              }
            }
        });
    }
    next();
  })