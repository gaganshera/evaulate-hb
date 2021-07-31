pipeline {
    
    agent any
    
    environment {
        scannerHome = tool name: 'SonarQubeScanner'
        username = 'himanshubungla'
        dockerRegistry = 'himanshusb12/app_himanshubungla'
        masterAppPort = 7200
        developAppPort = 7300
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
                bat "docker build . -t i-${username}-${env.BRANCH_NAME}:${BUILD_NUMBER}"
            }
        }

        stage('Containers') {
            parallel {
                stage('Pre-Container Check') {
                    when {
                        expression {
                            return bat (script: "docker port c-${username}-${env.BRANCH_NAME}", returnStatus: true) == 0;
                        }
                    }
                    steps {
                        echo 'Stopping the already running container'
                        bat "docker rm -f c-${username}-${env.BRANCH_NAME}"
                    }
                }

                stage('Publish to Docker Hub') {
                    steps {
                        bat "docker tag i-${username}-${env.BRANCH_NAME}:${BUILD_NUMBER} ${dockerRegistry}:${BUILD_NUMBER}"
                        bat "docker tag i-${username}-${env.BRANCH_NAME}:${BUILD_NUMBER} ${dockerRegistry}:latest"
                        
                        withDockerRegistry([credentialsId: 'DockerHub', url: '']) {
                            bat "docker push ${dockerRegistry}:${BUILD_NUMBER}"
                            bat "docker push ${dockerRegistry}:latest"
                        }
                    }
                }
            }
        }

        stage('Docker deployment') {
            steps {
                script {
                    echo 'Starting the api container'
                    if (env.BRANCH_NAME == 'master') {
                        bat "docker run --name c-${username}-${env.BRANCH_NAME} -p ${masterAppPort}:${dockerPort} -d ${dockerRegistry}:${BUILD_NUMBER}"    
                    }
                    else if (env.BRANCH_NAME == 'develop') {
                        bat "docker run --name c-${username}-${env.BRANCH_NAME} -p ${developAppPort}:${dockerPort} -d ${dockerRegistry}:${BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                echo "Kubernetes Deployment"
            }
        }
    }
}
