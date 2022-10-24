const shell = require('shelljs')

// 配置选项
const projectName = '' // 项目英文名
const projectChName = '' // 项目中文名
const sshUrl = '' // git库地址
const destDirName = '' // 目标目录名称

const curDirName = getCurDirName()

const envMode = process.argv[2] || 'prod'

function publish () {
  if (!checkDirExist(`./../${envMode}s`)) {
    shell.mkdir(`./../${envMode}s`)
  }
  if (!checkDirExist(`./../${envMode}s/${envMode}-${projectName}`)) {
    shell.mkdir(`./../${envMode}s/${envMode}-${projectName}`)
    shell.cd(`./../${envMode}s/${envMode}-${projectName}`)
  }
  // console.log(shell.exec('git remote -v'));
  const remote = shell.exec('git remote -v')
  if (remote.stderr && remote.stderr.includes('not a git repository')) {
    shell.exec('git init', () => {
      shell.exec(`git remote add origin ${sshUrl}`, () => {
        shell.echo(' ---------------------------------- successfully add origin ---------------------------------- ')
        shell.exec(`git fetch origin ${envMode}`, () => {
          shell.echo(' ---------------------------------- successfully fetch origin ---------------------------------- ')
          shell.exec(`git checkout -b ${envMode} origin/${envMode}`, () => {
            buildAndCpAndRl(envMode)
          })
        })
      })
    })
  } else {
    buildAndCpAndRl(envMode)
  }
}

function buildAndCpAndRl () {
  shell.exec(`git pull origin ${envMode}`, () => {
    shell.cd(`./../../${curDirName}`)
    shell.echo(` ---------------------------------- npm run build:${envMode} ---------------------------------- `)
    shell.exec(`npm run build:${envMode}`, () => {
      shell.echo(` ---------------------------------- successfully build:${envMode} ---------------------------------- `)
      shell.rm('-rf', `./../${envMode}s/${envMode}-${projectName}/${projectName}/${destDirName}`)
      shell.echo(' ---------------------------------- successfully remove file ---------------------------------- ')
      shell.cp('-R', './build/', `./../${envMode}s/${envMode}-${projectName}/${projectName}/${destDirName}/`)
      shell.echo(' ---------------------------------- successfully copy file ---------------------------------- ')
      shell.cd(`./../${envMode}s/${envMode}-${projectName}/`)
      shell.exec('git add .', () => {
        const msg = `chore: ${projectChName}${{
          pre: '准生产',
          prod: '生产',
          test: '综测'
        }[envMode]}提交代码`
        shell.exec(`git commit -m "${msg}"`, () => {
          shell.exec(`git push origin ${envMode}`, () => {
            shell.echo(` ---------------------------------- successfully push to ${envMode} ---------------------------------- `)
          })
        })
      })
    })
  })
}

function checkDirExist (dir) {
  const cd = shell.cd(dir)
  const curDir = shell.pwd()
  if (cd.stderr && cd.stderr.includes('no such file or directory')) {
    return false
  }
  shell.cd(curDir)
  return true
}

function getCurDirName () {
  let curDirArr = shell.pwd().stdout.split('/')
  let lenOfDirArr = curDirArr.length
  if (lenOfDirArr === 1) {
    curDirArr = shell.pwd().stdout.split('\\')
    lenOfDirArr = curDirArr.length
  }
  return curDirArr[lenOfDirArr - 1]
}

// 自动化发综测
publish()
