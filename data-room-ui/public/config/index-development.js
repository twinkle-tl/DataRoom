window.ENV = 'development'
var developmentConfig = {
  baseURL: 'http://192.168.30.108:8083',
  fileUrlPrefix: 'http://192.168.30.108:8083' + '/static'
}
// 必须的
window.CONFIG={}
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)

