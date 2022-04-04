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

let rVersions = [];
let prVersions = [];


try {
  const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

  const isRelease = core.getInput('isRelease');

  if (isRelease === 'true') {
    console.log("A realese storybook is published!")

    // get all published PR storybook versions on every release and purge them
    getDirectories('pr').forEach(file => {
      console.log('Cleaning the PR ' + file);

      io.rmRF('pr/'+file)
        .catch((error) => {
          core.setFailed(error.message);
        });
    })

    console.log(`All old PRs deleted!`);
  } else {
    // Get all published Storybook versions
    prVersions = getDirectories('pr').map((dir) => {
      return {
        id: dir,
        text: 'pr/' + dir
      }
    });
  }

  // Get all published release versions
  rVersions = getDirectories('r').map((dir) => {
    return {
      id: dir,
      text: 'r/' + dir
    }
  });

  // create a json to be consumed by storybook landing page dropdown
  sourceTemplate.results[1].children = rVersions;
  sourceTemplate.results[2].children = prVersions;

  io.cp('assets/', 'pr/assets', { recursive: true, force: false });

  // update the json on repo
  writeFileSync('storybooks.json', JSON.stringify(sourceTemplate));

  // For identifying different updates setting the version return as time
  // as the publish version number is not accessible herre
  const time = (new Date()).toTimeString();
  core.setOutput("version", time);

} catch (error) {
  core.setFailed(error.message);
}