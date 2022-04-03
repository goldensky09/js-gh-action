const core = require('@actions/core');
const github = require('@actions/github');
const { readdirSync, writeFileSync, rmdirSync } = require('fs');

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
  // const nameToGreet = core.getInput('who-to-greet');
  // console.log(`Hello ${nameToGreet}!`);
  // const time = (new Date()).toTimeString();
  // core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);


  const isPublish = core.getInput('isPublish');
  console.log("#############is publish received as" + isPublish)


  const files = readdirSync('pr', { withFileTypes: true });

    // files object contains all files names
    // log them on console
    files.forEach(file => {
        console.log(file);
    });


  if (isPublish === 'true') {
    rmdirSync('./pr', { recursive: true });

    console.log(`old PRs deleted!`);
  }


  const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

  let prVersions = getDirectories('pr').map((dir) => {
    return {
      id: dir,
      text: 'pr/' + dir
    }
  });

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