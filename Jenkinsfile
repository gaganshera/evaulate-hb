pipeline {
    
    agent any
    
    environment {
        scannerHome = tool name: 'SonarQubeScanner'
        username = 'himanshubungla'
        dockerRegistry = 'himanshusb12/app_himanshubungla'
        appPort = 7100
        dockerPort = 7100
    }
    
    tools {
        nodejs "node"
    }
    
    options {
        // prepend time stamps in log
        timestamps()
        
        // timeout
        timeout(time: 1, unit:'HOURS')
        
        // Skip checking out code from source control by default 
        skipDefaultCheckout()
        
        buildDiscarder(logRotator(
                numToKeepStr: '5',
                daysToKeepStr: '10'
            )
        )
        
    }
    
    stages {        
        stage('Build') {
            steps {
                    checkout scm
                    bat 'npm install .'
            }
        }
        
        stage('Unit Testing') {
            when {
                branch 'master'
            }
            steps {
                   bat 'npm test'
                
            }
        }
        
        stage('Sonar Analysis') {
            when {
                branch 'develop'
            }
            steps {
                    withSonarQubeEnv('Test_Sonar') {
                    bat "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=sonar-himanshubungla -Dsonar.projectName=sonar-himanshubungla -Dsonar.language=js -Dsonar.sourceEncoding=UTF-8 -Dsonar.exclusions=tests/** -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
                } 
            }
        }

        stage('Docker image') {
            steps {
                bat "docker build . -t i-${username}-master"
            }
        }

        stage('Containers') {
            parallel {
                stage('Pre-Container Check') {
                    when {
                        expression {
                            return bat (script: "docker port c-${username}-master", returnStatus: true) == 0;
                        }
                    }
                    steps {
                        echo 'Stopping the already running container'
                        bat "docker rm -f c-${username}-master"
                    }
                }

                stage('Publish to Docker Hub') {
                    steps {
                        bat "docker tag i-${username}-master ${dockerRegistry}:${BUILD_NUMBER}"
                        
                        withDockerRegistry([credentialsId: 'DockerHub', url: '']) {
                            bat "docker push ${dockerRegistry}:${BUILD_NUMBER}"
                        }
                    }
                }
            }
        }

        stage('Docker deployment') {
            steps {
                echo 'Starting the api container'
                bat "docker run --name c-${username}-master -p ${appPort}:${dockerPort} -d ${dockerRegistry}:${BUILD_NUMBER}"
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                echo "Kubernetes Deployment"
            }
        }
    }
}
