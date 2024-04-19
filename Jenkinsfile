library 'magic-butler-catalogue'

def PROJECT_NAME = "logdna-cloudwatch"
def REPO = "logdna/${PROJECT_NAME}"
def TRIGGER_PATTERN = ".*@logdnabot.*"
def CURRENT_BRANCH = [env.CHANGE_BRANCH, env.BRANCH_NAME]?.find{branch -> branch != null}
def DEFAULT_BRANCH = 'master'

pipeline {
  agent {
    node {
      label 'ec2-fleet'
      customWorkspace("/tmp/workspace/${env.BUILD_TAG}")
    }
  }

  options {
    timestamps()
    ansiColor 'xterm'
  }

  triggers {
    issueCommentTrigger(TRIGGER_PATTERN)
  }

  stages {
    stage('Validate PR Source') {
      when {
        expression { env.CHANGE_FORK }
        not {
          triggeredBy 'issueCommentCause'
        }
      }
      steps {
        error("A maintainer needs to approve this PR for CI by commenting")
      }
    }

    stage('Test Suite') {
      matrix {
        axes {
          axis {
            name 'NODE_VERSION'
            values '16', '18', '20'
          }
        }

        agent {
          docker {
            image "us.gcr.io/logdna-k8s/node:${NODE_VERSION}-ci"
            label 'ec2-fleet'
            customWorkspace("/tmp/workspace/${env.BUILD_TAG}-${NODE_VERSION}")
          }
        }

        environment {
          GITHUB_TOKEN = credentials('github-api-token')
        }

        stages {
          stage('Test') {
            steps {
              sh 'npm ci'
              sh 'npm run lint'
              sh 'npm run test'
            }
          }
        }
      }
    }

    stage('Test Release') {
      when {
        beforeAgent true
        not {
          branch DEFAULT_BRANCH
        }
      }

      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:18-ci"
          customWorkspace("/tmp/workspace/${env.BUILD_TAG}")
          label 'ec2-fleet'
        }
      }

      environment {
        GITHUB_TOKEN = credentials('github-api-token')
        GIT_BRANCH = "${CURRENT_BRANCH}"
        BRANCH_NAME = "${CURRENT_BRANCH}"
        CHANGE_ID = ""
      }

      steps {
        sh 'npm run package'
        sh 'npm ci'
        sh "npm run release:dry"
      }
    }

    stage('Release') {
      when {
        beforeAgent true
        branch DEFAULT_BRANCH
      }

      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:20-ci"
          customWorkspace("/tmp/workspace/${env.BUILD_TAG}")
          label 'ec2-fleet'
        }
      }

      environment {
        GITHUB_TOKEN = credentials('github-api-token')
      }

      steps {
        sh 'npm run package'
        sh 'npm ci'
        sh 'npm run release'
      }
    }
  }
}
