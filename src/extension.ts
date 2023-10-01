import * as vscode from 'vscode';

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

	highlightText();
   
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
