pipeline {
  agent any
  stages {
    stage('检出') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: env.GIT_BUILD_REF]],
          userRemoteConfigs: [[
            url: env.GIT_REPO_URL,
            credentialsId: env.CREDENTIALS_ID
          ]]])
          sh '''mkdir depends
curl -L -o adb.7z https://passoa-generic.pkg.coding.net/repertory/cxb/adb.7z?version=latest
curl -L -o browser.7z https://passoa-generic.pkg.coding.net/repertory/cxb/browser.7z?version=latest
curl -L -o db.7z https://passoa-generic.pkg.coding.net/repertory/cxb/db.7z?version=latest
sudo apt-get install p7zip-full
7z x browser.7z -r -o./depends/browser -y
7z x db.7z -r -o./depends/db -y
7z x adb.7z -r -o./depends/adb -y
cd depends
curl -L -o vcredist_x86.exe https://download.microsoft.com/download/9/3/F/93FCF1E7-E6A4-478B-96E7-D4B285925B00/vc_redist.x86.exe
curl -L -o zadig.exe https://passoa-generic.pkg.coding.net/repertory/cxb/zadig.exe?version=latest
curl -L -o node.exe https://passoa-generic.pkg.coding.net/repertory/cxb/node.exe?version=v12.16.1-winx64
ls
'''
          sh '''export platform=windows
npm isntall nrm -g
nrm use taobao
cd service
npm install
npm run build
cd ../views
npm install
npm run build'''
        }
      }
      stage(' 上传到 generic 仓库') {
        steps {
          sh '''sudo apt-get install nsis
makensis -INPUTCHARSET UTF8 poseidon.nsi
makensis -INPUTCHARSET UTF8 reveal.nsi
7z a Poseidon.7z PoseidonSetup.exe
7z a Reveal.7z RevealSetup.exe'''
          codingArtifactsGeneric(files: 'Poseidon.7z', repoName: "${env.GENERIC_REPO_NAME}", credentialsId: '${env.CODING_ARTIFACTS_CREDENTIALS_ID}', withBuildProps: true, version: '${env.REF}')
        }
      }
    }
  }