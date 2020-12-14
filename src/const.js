var domain = 'test.euxdat.eu';
var euxdatURL = 'https://sc5-backend.'.concat(domain,'/backend/');
var cloudifyURL = 'http://cloudify-api.'.concat(domain, '/api/v3.1/');
var mundiURL  = 'https://mundi-api.'.concat(domain, '/mundiapi');
var authHeader = 'Basic YWRtaW46RXV4ZGF0MTIzNDUh';
var dbHost = 'https://geodb-devel.'+domain+'/xalkidiki/';

var keyCloakConf = {
  authRealm: "euxdat",
  authUrl: "https://".concat(domain, "/auth"),
  authClientId: "frontend",
  logoutRedirectUri: "https://".concat(domain),
};

const CONST = {
  keyCloakConf: keyCloakConf,
  euxdatURL: euxdatURL,
  cloudifyURL: cloudifyURL,
  mundiURL: mundiURL,
  authHeader: authHeader,
  dbHost: dbHost,  
};

export default CONST