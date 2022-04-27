const path = require('path');
const { expect } = require('chai');
const { spawn } = require('child_process');
const { promises: fs, existsSync } = require('fs');

const indexFilePath = path.resolve(__dirname, '../src/index.js');

describe('CLI', () => {
  const waitProcessExecution = (childProcess) => {
    return new Promise((resolve) => {
      childProcess.on('exit', resolve);
    })
  };

  it('It should exit with non-zero code (Throw an error) if passed incorrect command name', async () => {
    const cliProcess = spawn('node', [indexFilePath, 'randomCommandName']);

    const exitCode = await waitProcessExecution(cliProcess);

    expect(exitCode).to.not.equal(0);

    const cliProcess2 = spawn('node', [indexFilePath, '--fadsfwe']);

    const exitCode2 = await waitProcessExecution(cliProcess2);

    expect(exitCode2).to.not.equal(0);
  });

  it('It should exit with non-zero code (Throw an error) if passed incorrect arguments for rimraf command', async () => {
    const cliProcess = spawn('node', [indexFilePath, 'rimraf', '--random']);

    const exitCode = await waitProcessExecution(cliProcess);

    expect(exitCode).to.not.equal(0);

    const cliProcess2 = spawn('node', [indexFilePath, 'rimraf', '--aloha', '--from', 'path', '--to', 'path2']);

    const exitCode2 = await waitProcessExecution(cliProcess2);

    expect(exitCode2).to.not.equal(0);
  });

  it('It should exit with non-zero code (Throw an error) if passed incorrect arguments for rename command', async () => {
    const cliProcess = spawn('node', [indexFilePath, 'rename', '--random']);

    const exitCode = await waitProcessExecution(cliProcess);

    expect(exitCode).to.not.equal(0);

    const cliProcess2 = spawn('node', [indexFilePath, 'rename', '--path', './text.txt']);

    const exitCode2 = await waitProcessExecution(cliProcess2);

    expect(exitCode2).to.not.equal(0);
  });

  it('It should delete a folder with all it content when using rimraf command.', async () => {
    await fs.mkdir('./testDir');
    await fs.writeFile('./testDir/file.txt', 'adkfjsofijwoefwjeo', {
      encoding: 'UTF-8'
    });
    await fs.mkdir('./testDir/subDir1');
    await fs.mkdir('./testDir/subDir2');
    await fs.writeFile('./testDir/subDir1/file.jped', '');

    const cliProcess = spawn('node', [indexFilePath, 'rimraf', '--path', './testDir']);

    const exitCode = await waitProcessExecution(cliProcess);

    expect(exitCode).to.equal(0);

    expect(existsSync('./testDir')).to.be.false;
  });


  it('It should delete a file when using rimraf command.', async () => {
    await fs.writeFile('./file.txt', 'adkfjsofijwoefwjeo', {
      encoding: 'UTF-8'
    });

    const cliProcess = spawn('node', [indexFilePath, 'rimraf', '--path', './file.txt']);

    const exitCode = await waitProcessExecution(cliProcess);

    expect(exitCode).to.equal(0);

    expect(existsSync('./file.txt')).to.be.false;
  });

  it('It should rename a file when using rename command.', async () => {
    const fileContent = 'adkfjsofijwoefwjeo';

    await fs.writeFile('./file.txt', fileContent, {
      encoding: 'UTF-8'
    });

    const cliProcess = spawn('node', [indexFilePath, 'rename', '--from', './file.txt', '--to', './renamed.txt']);

    const exitCode = await waitProcessExecution(cliProcess);

    expect(exitCode).to.equal(0);

    expect(existsSync('./file.txt')).to.be.false;
    expect(existsSync('./renamed.txt')).to.be.true;
    expect((await fs.readFile('./renamed.txt')).toString()).to.be.eq(fileContent);

    await fs.rm('./renamed.txt');
  });

  it('It should rename a folder when using rename command.', async () => {
    await fs.mkdir('./folder');

    const cliProcess = spawn('node', [indexFilePath, 'rename', '--from', './folder', '--to', './renamed']);

    const exitCode = await waitProcessExecution(cliProcess);

    expect(exitCode).to.equal(0);

    expect(existsSync('./file')).to.be.false;
    expect(existsSync('./renamed')).to.be.true;

    const stat = await fs.lstat('./renamed');

    expect(stat.isDirectory(), 'A directory should stay a directory after renaming').to.be.true;

    await fs.rm('./renamed', { recursive: true });
  });

});
