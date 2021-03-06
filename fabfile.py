from fabric.api import *
import os

env.hosts = ['staging.chicagolx.org']
env.user = 'chicagolx'
env.path = '~/Sites/clx'
env.remotepath = '/home/chicagolx/webapps/clx_staging'
env.git_branch = 'master'
env.warn_only = True
env.remote_protocol = 'http'

def production():
  env.hosts = ['chicagolx.org']
  env.user = 'chicagolx'
  env.remotepath = '/home/chicagolx/webapps/clx_production'
  env.git_branch = 'master'
  env.remote_protocol = 'https'

def assets():
  local('npx gulp --production')

def devsetup():
  print "Installing composer, node and bower assets...\n"
  local('composer install')
  local('npm install')
  local('cd assets && bower install')
  local('npx gulp')
  local('cp .env-example .env')
  print "OK DONE! Hello? Are you still awake?\nEdit your .env file with local credentials\nRun `npx gulp watch` to run local gulp to compile & watch assets"

def deploy(composer='y'):
  update()
  if composer == 'y':
    composer_install()
  # clear_cache()

def update():
  with cd(env.remotepath):
    run('git pull origin {0}'.format(env.git_branch))

def composer_install():
  with cd(env.remotepath):
    run('php72 ~/bin/composer.phar install')

# def clear_cache():
#   run ('curl -vs -o /dev/null {0}://{1}/actions/cacheClear/clear?key=fbclear > /dev/null 2>&1'.format(env.remote_protocol, env.hosts[0]))
