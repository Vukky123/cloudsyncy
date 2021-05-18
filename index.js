const config = require("./config.json");
const packagejson = require("./package.json");
const chalk = require("chalk");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const ora = require("ora");

let spinnery, origin, destination, loops, answers, args;
args = require('minimist')(process.argv.slice(2));

function display() {
    console.clear();
    console.log(`${chalk.green("cloudsyncy")} ${chalk.blueBright(packagejson.version)}`);
}
display();

// lol, if it works it works
async function run() {
    if(Object.keys(args).length < 2) {
        answers = await inquirer.prompt([
            {
                type: 'list' ,
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
    } else {
        if(args.config && args.mode) {
            answers = {};
            if(!config[args.config]) {
                console.log("That configuration doesn't exist. Please refer to the cloudsyncy config.json file.")
                process.exit(1);
            }
            answers.type = args.config;
            if(args.mode != "ltc" && args.mode != "ctl") {
                console.log("Incorrect arguments passed, please read the README.");
                process.exit(1);
            }
            if(args.mode == "ltc") answers.mode = "Local to cloud";
            if(args.mode == "ctl") answers.mode = "Cloud to local";
        } else {
            console.log("Incorrect arguments passed, please read the README.");
            process.exit(1);
        }
    }
    const displayCurrentFile = (src, dest) => {
        if(answers.mode == "Local to cloud") {
            if(config[answers.type].ignoreLocal.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) }).includes(src)) {
                return false;
            }
            if(config[answers.type].ignoreCloud.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) }).includes(dest)) {
                return false;
            }
        } else { 
            if(config[answers.type].ignoreCloud.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) }).includes(src)) {
                return false;
            }
            if(config[answers.type].ignoreLocal.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) }).includes(dest)) {
                return false;
            }
        }
        spinnery.text = `Copying ${src} to ${dest}...`
        return true;
    }
    
    if(answers.mode == "Cloud to local") {
        origin = config[answers.type].cloud.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
        destination = config[answers.type].local.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
    } else if (answers.mode == "Local to cloud") {
        origin = config[answers.type].local.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
        destination = config[answers.type].cloud.map(function(x){ return x.replace(/%([^%]+)%/g, (_,n) => process.env[n]) });
    } else {
        return console.error("Something doesn't seem right.");
    }
    loops = 0;

    display();
    console.log(`Sweet! Let's copy your ${answers.type} files.\n`);
    async function next() {
        let originy = origin[loops];
        let destinationy = destination[loops];
        if(config[answers.type].deleteDestinationContentsBeforeCopy == true) {
            spinnery = ora(`Deleting contents of ${destinationy}...`).start();
            await fs.emptyDir(destinationy);
            spinnery.stop();
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
}
run();