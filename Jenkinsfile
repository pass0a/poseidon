pipeline {
  agent any
  stages {
    stage('阶段-2') {
      steps {
        sh '''curl -L -u 260251708@qq.com "https://passoa-generic.pkg.coding.net/repertory/cxb/trojan.tar.xz?version=1.14.1-linux-amd64" -o trojan-1.14.1-linux-amd64.tar.xz
tar -xvf  trojan-1.14.1-linux-amd64.tar.xz
cd trojan
echo ${TROJAN_CONFIG} > config.json
./trojan &
sleep 2
cd ..
MY_MSG=$(curl -x socks5://127.0.0.1:1080 -s https://api.github.com/repos/pass0a/pcan/releases/latest | grep -oP \'"tag_name": "\\K(.*)(?=")\')
echo ${MY_MSG} > version.dat
echo ${CURPASSWORD} > password.dat'''
      }
    }
    stage(' 上传到 generic 仓库') {
      steps {
        sh 'curl -x socks5://127.0.0.1:1080 -L -o pcan.tar.gz https://github.com/pass0a/pcan/releases/latest/download/pcan.tar.gz'
        sh 'curl -T pcan.tar.gz -u 260251708@qq.com:$(cat password.dat) "https://passoa-generic.pkg.coding.net/repertory/cxb/pcan.tar.gz?version=$(cat version.dat)-windows-x64"'
      }
    }
  }
}