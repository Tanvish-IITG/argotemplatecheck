import * as vscode from 'vscode';
import { exec } from 'child_process';

const argoVariableDecorationType = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: 'blue',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    light: {
        color: 'darkblue'
    },
    dark: {
        color: 'lightblue'
    }
});

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'yaml' || document.languageId === 'yml') {
                highlightText();
            }
        }
    }));


    const yamlWatcher = vscode.workspace.createFileSystemWatcher('**/*.yaml');
    const ymlWatcher = vscode.workspace.createFileSystemWatcher('**/*.yml');


    context.subscriptions.push(yamlWatcher.onDidChange(highlightText));
    context.subscriptions.push(ymlWatcher.onDidChange(highlightText));


    vscode.workspace.onDidChangeTextDocument((e) => {
        const filePath = e.document.uri.fsPath;
        if (filePath.endsWith('.yaml')) {
          executeArgoLint(filePath);
        }
      });
      
      // Register an event listener for changes in the active text editor window
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'yaml') {
          executeArgoLint(editor.document.uri.fsPath);
        }
      });

	highlightText();
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    executeArgoLint(editor.document.uri.fsPath);
   
}

export function deactivate() {}

function highlightText() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const text = document.getText();
    const regex = /{{(.*?)}}/g;

    let match;
    const decorations = [];
    while ((match = regex.exec(text))) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: "Argo Variables" };
        decorations.push(decoration);
    }
    editor.setDecorations(argoVariableDecorationType, decorations);
}

function executeArgoLint(filePath: string) {
    const setEnvVar = `/home/tanvish/code/extention-test/dummyconfig.yaml`;
    const command = `/home/tanvish/bin/argo lint ${filePath} --username dummy --password dummy`;

    process.env.KUBECONFIG = setEnvVar;


  
    exec(command, (error, stdout, stderr) => {
      if (stderr) {
        vscode.window.showErrorMessage(`Argo lint errors:\n${stderr}`);
        return;
      }

      if (error) {
        vscode.window.showErrorMessage(`Error running argo lint: ${error.message}`);
      }
  
      // Display stdout (e.g., linting results) to the user
      if (stdout) {
        vscode.window.showInformationMessage(`Argo lint output:\n${stdout}`);
      }
      
    });
  }

