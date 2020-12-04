import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import VueResource from 'vue-resource'
import Vuelidate from 'vuelidate'
import store from './store.js'

Vue.prototype.$eventBus = new Vue()

Vue.config.productionTip = true

Vue.use(VueResource)
Vue.use(Vuetify, { //material icons
  iconfont: 'mdi'
})

Vue.use(Vuelidate)

Vue.use(VueKeyCloak, {
  config: {
    authRealm: "euxdat",
    authUrl: "https://test.euxdat.eu/auth",
    authClientId: "frontend",
    logoutRedirectUri: "https://test.euxdat.eu",
  },

  onReady: () => {
    new Vue({
      el: '#app',
      store, //esto es el store de VUEX
      template: '<App/>',
      render: h => h(App)
    })
  },
  init: {onLoad: 'login-required'}
})


