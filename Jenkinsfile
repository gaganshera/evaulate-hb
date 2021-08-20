pipeline {
    
    agent any
    
    environment {
        scannerHome = tool name: 'SonarQubeScanner'
        username = 'himanshubungla'
        dockerRegistry = 'himanshusb12/app_himanshubungla'
        masterAppPort = 7200
        developAppPort = 7300
        dockerPort = 7100
        masterAppName = 'node-app-master-deployment'
        masterServiceName = 'node-app-master'
        masterExposedPort = 30157
        developAppName = 'node-app-develop-deployment'
        developServiceName = 'node-app-develop'
        developExposedPort = 30158
    }
    
    tools {
        nodejs "nodejs"
        dockerTool 'docker'
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
                    sh 'npm install .'
            }
        }
        
        stage('Unit Testing') {
            when {
                branch 'master'
            }
            steps {
                   sh 'npm test'
                
            }
        }
        
        stage('Sonar Analysis') {
            when {
                branch 'develop'
            }
            steps {
                    sh 'npm test'
                    
                    withSonarQubeEnv('Test_Sonar') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=sonar-himanshubungla -Dsonar.projectName=sonar-himanshubungla -Dsonar.language=js -Dsonar.sourceEncoding=UTF-8 -Dsonar.exclusions=tests/** -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
                } 
            }
        }

        stage('Docker image') {
            steps {
                sh "docker build . -t i-${username}-${env.BRANCH_NAME}:${BUILD_NUMBER}"
            }
        }

        stage('Containers') {
            parallel {
                stage('Pre-Container Check') {
                    when {
                        expression {
                            return sh (script: "docker port c-${username}-${env.BRANCH_NAME}", returnStatus: true) == 0;
                        }
                    }
                    steps {
                        echo 'Stopping the already running container'
                        sh "docker rm -f c-${username}-${env.BRANCH_NAME}"
                    }
                }

                stage('Publish to Docker Hub') {
                    steps {
                        sh "docker tag i-${username}-${env.BRANCH_NAME}:${BUILD_NUMBER} ${dockerRegistry}:${BUILD_NUMBER}"
                        sh "docker tag i-${username}-${env.BRANCH_NAME}:${BUILD_NUMBER} ${dockerRegistry}:latest"
                        script {
                            withDockerRegistry(credentialsId: 'DockerHub', toolName: 'docker') {
                                sh "docker push ${dockerRegistry}:${BUILD_NUMBER}"
                                sh "docker push ${dockerRegistry}:latest"
                            }
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
                        sh "docker run --name c-${username}-${env.BRANCH_NAME} -p ${masterAppPort}:${dockerPort} -d ${dockerRegistry}:${BUILD_NUMBER}"    
                    }
                    else if (env.BRANCH_NAME == 'develop') {
                        sh "docker run --name c-${username}-${env.BRANCH_NAME} -p ${developAppPort}:${dockerPort} -d ${dockerRegistry}:${BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                script {
                    echo "Kubernetes Deployment"
                    if (env.BRANCH_NAME == 'master') {
                        powershell "(get-content deployment.yaml) | %{\$_ -replace \"<APP_NAME>\", \"$masterAppName\"} | %{\$_ -replace \"<SERVICE_NAME>\", \"$masterServiceName\"} | %{\$_ -replace \"<EXPOSED_PORT>\", \"$masterExposedPort\"} | set-content deployment.yaml"
                    } 
                    else if (env.BRANCH_NAME == 'develop') {
                        powershell "(get-content deployment.yaml) | %{\$_ -replace \"<APP_NAME>\", \"$developAppName\"} | %{\$_ -replace \"<SERVICE_NAME>\", \"$developServiceName\"} | %{\$_ -replace \"<EXPOSED_PORT>\", \"$developExposedPort\"} | set-content deployment.yaml"
                    }
                
                    sh "kubectl apply -f deployment.yaml" 
                }
                
            }
        }
    }
}