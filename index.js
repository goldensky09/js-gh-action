const core = require('@actions/core');
const github = require('@actions/github');
const { readdirSync, writeFileSync, rmdirSync, rmSync } = require('fs');
const path = require('path');
const io = require('@actions/io');

const sourceTemplate = {
  "results": [
    {
      "id": "",
      "text": "Select DxGUI Version"
    },
    {
      "text": "Published Revisions",
      "children": []
    },
    {
      "text": "Unpublished Pull Requests",
      "children": []
    }
  ]
}

let prVersions = [];


try {
  // `who-to-greet` input defined in action metadata file
  // const nameToGreet = core.getInput('who-to-greet');
  // console.log(`Hello ${nameToGreet}!`);
  // const time = (new Date()).toTimeString();
  // core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

  const isPublish = core.getInput('isPublish');
  console.log("#############is publish received as" + isPublish)

  if (isPublish === 'true') {
    // rmdirSync('./pr', { withFileTypes: true, recursive: true });
    // rmSync(path.resolve(__dirname,'pr'), { recursive: true, force: true });

    // get all published PR storybook versions
    getDirectories('pr').forEach(file => {
      io.rmRF('pr/'+file)
        .catch((error) => {
          core.setFailed(error.message);
        });
    })

    console.log(`old PRs deleted!`);
  } else {
    prVersions = getDirectories('pr').map((dir) => {
      return {
        id: dir,
        text: 'pr/' + dir
      }
    });
  }


  

  if (isPublish !== 'true') {
    
  }

  let rVersions = getDirectories('r').map((dir) => {
    return {
      id: dir,
      text: 'r/' + dir
    }
  });

  sourceTemplate.results[1].children = rVersions;
  sourceTemplate.results[2].children = prVersions;

  writeFileSync('source-out1.json', JSON.stringify(sourceTemplate));

} catch (error) {
  core.setFailed(error.message);
}