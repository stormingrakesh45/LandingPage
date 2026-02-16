pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git branch: 'main',
                url: 'https://github.com/stormingrakesh45/LandingPage.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t landing-page:latest .'
            }
        }

        stage('Stop Old Container') {
            steps {
                sh '''
                docker stop landing || true
                docker rm landing || true
                '''
            }
        }

        stage('Run New Container') {
            steps {
                sh 'docker run -d -p 80:80 --name landing landing-page:latest'
            }
        }
    }
}