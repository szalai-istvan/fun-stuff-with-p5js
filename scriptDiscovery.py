import os
import sys

PROJECTS = {
    'labirinth-game': {
        'html-file-name': 'index.html',
        'script-type': 'text/javascript'
    },
    'ball-bouncer': {
        'html-file-name': 'index.html',
        'script-type': 'module'
    }
}

SCRIPT_TYPE = '$SCRIPT_TYPE'
SCRIPT_PATH = '$SCRIPT_PATH'
PROJECTS_TO_PROCESS = ['labirinth-game', 'ball-bouncer']
SCRIPT_TEMPLATE = f'{' ' * 8}<script type="{SCRIPT_TYPE}" src="{SCRIPT_PATH}"></script>'
P5_SCRIPT = f'{' ' * 8}<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>'
PROJECTS_REPORT = {}

def main():
    try:
        for p in PROJECTS_TO_PROCESS:
            processOneProject(p)
        print(f'✅  scripts updated successfully!')
        print('\n🎯  Project brief summary:')
        printProjectReport()
    except:
        print(f'❌  script update failed!')

def processOneProject(projectName):
    project = PROJECTS[projectName]
    htmlFileName = project['html-file-name']
    scriptType = project['script-type']

    jsFiles = getJsFilesInFolder(projectName)
    scriptTags = createScriptTags(jsFiles, scriptType)
    processedHtmlContent = appendScriptsToHtmlFile(projectName, htmlFileName, scriptTags)
    overwriteHtmlFile(processedHtmlContent, projectName, htmlFileName)
    reportDataOnJsFiles(projectName, jsFiles)

def getJsFilesInFolder(folder):
    folderPath = os.path.join(os.getcwd(), folder)
    jsFiles = []
    for root, subdirs, files in os.walk(folderPath):
        for file in files:
            fullPath = os.path.join(root, file)
            relativePath = fullPath.replace(folderPath, '')[1:].replace('\\', '/')
            if fullPath[-3:] == '.js':
                jsFiles.append(relativePath)
    return jsFiles

def createScriptTags(jsFiles, scriptType):
    lastDiscriminator = ''
    scriptTags = [P5_SCRIPT]
    for jsFile in jsFiles:
        discriminator = jsFile.split('/')[1]
        if discriminator != lastDiscriminator:
            scriptTags.append('')
        lastDiscriminator = discriminator
        scriptTags.append(SCRIPT_TEMPLATE.replace(SCRIPT_TYPE, scriptType).replace(SCRIPT_PATH, jsFile))
    return scriptTags

def appendScriptsToHtmlFile(projectName, htmlFileName, scriptTags):
    htmlPath = os.path.join(os.getcwd(), projectName, htmlFileName)
    htmlContent = []
    with open(htmlPath) as file:
        for line in file:
            if '<script' in line or '</body>' in line:
                break
            htmlContent.append(line)

    [htmlContent.append(s+'\n') for s in scriptTags]
    htmlContent.append('    </body>\n</html>')
    return htmlContent

def overwriteHtmlFile(processedHtmlContent, projectName, htmlFileName):
    processedHtmlContent = ''.join(processedHtmlContent)
    htmlPath = os.path.join(os.getcwd(), projectName, htmlFileName)
    with open(htmlPath, 'w') as file:
        file.write(processedHtmlContent)

def reportDataOnJsFiles(projectName, jsFiles):
    fileCounter = 0
    lineCounter = 0

    for jsFile in jsFiles:
        fileCounter += 1
        absolutePath = os.path.join(os.getcwd(), projectName, jsFile)
        with open(absolutePath) as file:
            for line in file:
                if isNotComment(line):
                    lineCounter += 1
    PROJECTS_REPORT[projectName] = (fileCounter, lineCounter)

def isNotComment(line):
    line = line.strip()

    if len(line) == 0:
        return True
    if line[0:2] == '//':
        return False
    if line[0] == '*':
        return False
    if line[0:3] == '/**':
        return False
    return True

def printProjectReport():
    projects = sorted(list(PROJECTS_REPORT.keys()))
    table = [
        ['Project', 'Files', 'Lines']
    ]
    for p in projects:
        table.append([p, f'{PROJECTS_REPORT[p][0]:_} files'.replace('_', ' '), f'{PROJECTS_REPORT[p][1]:_} lines'.replace('_', ' ')])
    allFiles = sum([PROJECTS_REPORT[p][0] for p in projects])
    allLines = sum([PROJECTS_REPORT[p][1] for p in projects])
    table.append(['Summary: ', f'{allFiles:_} files'.replace('_', ' '), f'{allLines:_} lines'.replace('_', ' ')])

    # determine max length per column for padding
    maxLengthPerColumn = []
    for i in range(3):
        maxLengthInColumn = max([len(row[i]) for row in table])
        maxLengthPerColumn.append(maxLengthInColumn)
    # apply padding
    for i in range(3):
        padding = maxLengthPerColumn[i] - len(table[0][i])
        leftPadding = padding // 2
        rightPadding = padding - leftPadding
        table[0][i] = f'{' ' * leftPadding} {table[0][i]} {' ' * rightPadding}'
    for row in range(1, len(table)):
        row = table[row]
        project = row[0]
        projectMaxLength = maxLengthPerColumn[0]
        row[0] = f' {project} {' ' * (projectMaxLength - len(project))}'

        files = row[1]
        filesMaxLength = maxLengthPerColumn[1]
        row[1] = f'{' ' * (filesMaxLength - len(files))} {files} '

        lines = row[2]
        linesMaxLength = maxLengthPerColumn[2]
        row[2] = f'{' ' * (linesMaxLength - len(lines))} {lines} '

    print(f'+{'-'*(maxLengthPerColumn[0] + 2)}+{'-'*(maxLengthPerColumn[1] + 2)}+{'-'*(maxLengthPerColumn[2] + 2)}+')
    for row in table:
        print(f'|{row[0]}|{row[1]}|{row[2]}|')
        print(f'+{'-'*(maxLengthPerColumn[0] + 2)}+{'-'*(maxLengthPerColumn[1] + 2)}+{'-'*(maxLengthPerColumn[2] + 2)}+')

main()