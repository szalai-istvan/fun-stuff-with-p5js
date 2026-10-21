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

def main():
    try:
        for p in PROJECTS_TO_PROCESS:
            processOneProject(p)
        print(f'✅  scripts updated successfully!')
        print('\n🎯  Project brief summary:')
        printProjectReport()
    except:
        print(f'❌  script update failed!')

main()












def addScriptsToFile(file):
    jsFiles = getJsFilesForFile(file)
    htmlContent = readHtmlContent(file)
    htmlContent = getFullHtmlContent(htmlContent, jsFiles)
    
    with open(file, 'w') as apparat:
        apparat.write(htmlContent)

def getJsFilesForFile(file):
    projects = HTML_FILE_PROJECT_MAPPING[file]
    cwd = os.getcwd()

    jsFiles = []
    for root, subdirs, files in os.walk(cwd):
        for file in files:
            fullPath = os.path.join(root, file)
            relativePath = fullPath.replace(cwd, '')[1:].replace('\\', '/')
            if fullPath[-3:] == JS and fileBelongsToProjects(relativePath, projects):
                jsFiles.append(relativePath)
    return jsFiles

def fileBelongsToProjects(relativePath, projects):
    for p in projects:
        if p == relativePath.split('/')[1]:
            return True
    return False

def readHtmlContent(file):
    lines = []
    with open(file) as apparat:
        for line in apparat:
            lines.append(line)
            if STOP_SIGN in line:
                break
    return lines

def getFullHtmlContent(htmlContent, jsFiles):
    lastDir = ''
    rows = []
    p5Rows = []

    for jsFile in jsFiles:
        directory = jsFile.split('/')[DISCRIMINATOR_PATH_PART]
        if directory != lastDir:
            rows.append(EMPTY_STRING + '\n')
        lastDir = directory

        if P5 not in jsFile:
            rows.append(FOUR_SPACES + createScriptTag(jsFile) + '\n')
        else:
            p5Rows.append(FOUR_SPACES + createScriptTag(jsFile) + '\n')
    
    allRows = []
    [allRows.append(row) for row in htmlContent]
    [allRows.append(row) for row in rows]
    allRows.append(EMPTY_STRING + '\n')
    [allRows.append(row) for row in p5Rows]
    
    allRows.append('</body>\n')
    allRows.append('\n')
    allRows.append('</html>\n')

    return ''.join(allRows)

def createScriptTag(path):
    return SCRIPT_TAG_TEMPLATE.replace(SRC, path)

def formatAndPrintProjectData(projects):
    projectData = [getProjectData(p) for p in projects]
    projectData.append(('summary', sum(list([p[1] for p in projectData])), sum(list([p[2] for p in projectData]))))
    projectNames = [p[0] for p in projectData]
    projectFileCounts = [p[1] for p in projectData]
    projectLineCounts = [p[2] for p in projectData]

    maxProjectLength = max([len(pn) for pn in projectNames])
    projectNames = [' ' + pn + ' ' * (maxProjectLength + 4 - len(pn)) for pn in projectNames]

    projectFileCounts = [f'{pfc:_} files '.replace('_', ' ') for pfc in projectFileCounts]
    maxProjectFileCountsLength = max([len(pfc) for pfc in projectFileCounts])
    projectFileCounts = [' ' * (maxProjectFileCountsLength + 4 - len(pfc)) + pfc for pfc in projectFileCounts]

    projectLineCounts = [f'{plc:_} lines '.replace('_', ' ') for plc in projectLineCounts]
    maxProjectLineCountsLength = max([len(plc) for plc in projectLineCounts])
    projectLineCounts = [' ' * (maxProjectLineCountsLength + 4 - len(plc)) + plc for plc in projectLineCounts]

    print('\n🎯  Project brief summary:')
    print('+' + '-'*len(projectNames[0]) + '+' + '-'*len(projectFileCounts[0]) + '+' + '-'*len(projectLineCounts[0]) + '+')
    for i in range(len(projectNames)):
        print(f'|{projectNames[i]}|{projectFileCounts[i]}|{projectLineCounts[i]}|')
        if i == len(projectNames) - 2:
            print('+' + '-'*len(projectNames[0]) + '+' + '-'*len(projectFileCounts[0]) + '+' + '-'*len(projectLineCounts[0]) + '+')
    print('+' + '-'*len(projectNames[0]) + '+' + '-'*len(projectFileCounts[0]) + '+' + '-'*len(projectLineCounts[0]) + '+')

def process():
    files = list(HTML_FILE_PROJECT_MAPPING.keys())
    projects = []
    for f in files:
        try:
            addScriptsToFile(f)
            print(f'✅  \033[1m{f}\033[0;0m scripts updated successfully!')
        except:
            print(f'❌  \033[1m{f}\033[0;0m script update failed!')
        for p in HTML_FILE_PROJECT_MAPPING[f]:
            projects.append(p)

    projects = sorted(set(projects))
    formatAndPrintProjectData(projects)