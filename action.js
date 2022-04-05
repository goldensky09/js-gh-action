const core = require('@actions/core');
const github = require('@actions/github');
const {
  readdirSync,
  writeFileSync,
  rmdirSync,
  rmSync
} = require('fs');
const path = require('path');
const io = require('@actions/io');

const sourceTemplate = {
  "results": [{
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

let rVersions = [];
let prVersions = [];


try {

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const getDirectories = source =>
    readdirSync(source, {
      withFileTypes: true
    })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(dir => dir !== 'assets');

  const isRelease = core.getInput('isRelease');

  if (isRelease === 'true') {
    console.log("A realese storybook is published!")

    // get all published PR storybook versions on every release and purge them
    getDirectories('pr').forEach(file => {
      console.log('Cleaning the PR ' + file);

      // io.rmRF('pr/' + file)
      //   .catch((error) => {
      //     core.setFailed(error.message);
      //   });
    })

    console.log(`All old PRs deleted!`);
  } else {
    // Get all published Storybook versions
    prVersions = getDirectories('pr').map((dir) => {
      return {
        id: 'pr/' + dir,
        text: dir
      }
    });
  }

  // Get all published release versions
  rVersions = getDirectories('r').map((dir) => {
    return {
      id: 'r/' + dir,
      text: dir
    }
  });

  // create a json to be consumed by storybook landing page dropdown
  sourceTemplate.results[1].children = rVersions;
  sourceTemplate.results[2].children = prVersions;

  // update the json on repo
  writeFileSync('storybooks.json', JSON.stringify(sourceTemplate));

  //update the assets beside release and pr directories
  io.cp('assets', 'pr/assets', {
    recursive: true,
    force: false
  });
  io.cp('assets', 'r/assets', {
    recursive: true,
    force: false
  });

  // For identifying different updates setting the version return as time
  // as the publish version number is not accessible herre
  const time = (new Date()).toGMTString();
  core.setOutput("version", time);

} catch (error) {
  core.setFailed(error.message);
}