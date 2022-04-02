const core = require('@actions/core');
const github = require('@actions/github');

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


try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);

  const { promises: { readdir } } = require('fs')

  const getDirectories = async source =>
    (await readdir(source, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

  getDirectories('pr').then((directories) => {
    directories.map((dir) => {
      const tmpObj = {
        id: dir,
        text: 'pr/' + dir
      }
      sourceTemplate.results[1].children.push(tmpObj);
      console.log(sourceTemplate);
    })
  });
  getDirectories('r').then((directories) => {
    directories.map((dir) => {
      const tmpObj = {
        id: dir,
        text: 'r/' + dir
      }
      sourceTemplate.results[2].children.push(tmpObj);
      console.log(sourceTemplate);
    })
  });

  
  
} catch (error) {
  core.setFailed(error.message);
}